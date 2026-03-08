# backend/medicine/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MedicineBatch, TransferRecord
from .utils import get_role   # ✅ CORRECT import (NO circular issue)

User = get_user_model()

# ✅ Supply chain flow (UPPERCASE roles)
VALID_FLOW = {
    "MANUFACTURER": ["DISTRIBUTOR"],
    "DISTRIBUTOR": ["WAREHOUSE"],
    "WAREHOUSE": ["WHOLESALER"],
    "WHOLESALER": ["SHOPKEEPER"],
    "SHOPKEEPER": [],
}


# =====================================================
# MEDICINE BATCH SERIALIZER
# =====================================================
class MedicineBatchSerializer(serializers.ModelSerializer):
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = MedicineBatch
        fields = [
            "id",
            "batch_id",
            "name",
            "manufacturer",
            "manufacture_date",
            "expiry_date",
            "quantity",
            "remaining_quantity",
            "qr_code",
            "qr_url",
        ]
        read_only_fields = ["manufacturer", "remaining_quantity", "qr_code"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["manufacturer"] = request.user
        return super().create(validated_data)

    def get_qr_url(self, obj):
        request = self.context.get("request")
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None


# =====================================================
# TRANSFER RECORD SERIALIZER (🔥 MAIN FIX HERE)
# =====================================================
class TransferRecordSerializer(serializers.ModelSerializer):
    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = TransferRecord
        fields = ["id", "batch", "sender", "receiver", "quantity", "timestamp"]
        read_only_fields = ["sender", "timestamp"]

    def validate(self, attrs):
        request = self.context.get("request")
        sender = request.user
        receiver = attrs.get("receiver")
        batch = attrs.get("batch")

        sender_role = get_role(sender)
        receiver_role = get_role(receiver)

        # ❌ Role missing
        if sender_role == "UNKNOWN":
            raise serializers.ValidationError("Sender role not assigned.")
        if receiver_role == "UNKNOWN":
            raise serializers.ValidationError("Receiver role not assigned.")

        # ❌ DRAP restriction
        if sender_role == "DRAP_ADMIN" or receiver_role == "DRAP_ADMIN":
            raise serializers.ValidationError("DRAP cannot transfer medicines.")

        # ❌ Self transfer
        if sender.id == receiver.id:
            raise serializers.ValidationError("Sender and receiver cannot be same.")

        # ❌ Invalid supply-chain flow
        allowed = VALID_FLOW.get(sender_role, [])
        if receiver_role not in allowed:
            raise serializers.ValidationError(
                f"{sender_role} cannot transfer to {receiver_role}"
            )

        # ❌ Quantity check
        if attrs["quantity"] > batch.remaining_quantity:
            raise serializers.ValidationError(
                f"Only {batch.remaining_quantity} quantity available"
            )

        return attrs

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)

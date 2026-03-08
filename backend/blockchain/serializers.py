# blockchain/serializers.py
from rest_framework import serializers
from .models import BlockChainBlock

class BlockTransactionSerializer(serializers.Serializer):
    tx_id = serializers.CharField(required=False)
    sender_role = serializers.CharField(required=False)
    sender_id = serializers.CharField(required=False, allow_null=True)
    receiver_role = serializers.CharField(required=False)
    receiver_id = serializers.CharField(required=False, allow_null=True)
    quantity = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_null=True)
    location = serializers.CharField(required=False, allow_null=True)
    # keep flexible: allow other keys if present
    other = serializers.DictField(child=serializers.CharField(), required=False)

class BlockListItemSerializer(serializers.ModelSerializer):
    transaction_data = serializers.JSONField()
    timestamp = serializers.DateTimeField()
    index = serializers.IntegerField()

    class Meta:
        model = BlockChainBlock
        fields = ("index", "timestamp", "transaction_data", "hash", "previous_hash")

class ChainVerifySerializer(serializers.Serializer):
    valid = serializers.BooleanField()
    message = serializers.CharField()
    chain_length = serializers.IntegerField()
    last_block_timestamp = serializers.DateTimeField(allow_null=True)
    trail = serializers.ListField(child=serializers.JSONField(), required=False)
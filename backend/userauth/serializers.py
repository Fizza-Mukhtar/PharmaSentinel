# userauth/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

# ==============================
# User Serializer (Read Only / Listing)
# ==============================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "role", "phone", "is_active", "date_joined"]
        read_only_fields = ["id", "date_joined"]


# ==============================
# Registration Serializer
# ==============================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    role = serializers.ChoiceField(
        choices=CustomUser.ROLE_CHOICES,
        required=True
    )

    class Meta:
        model = CustomUser
        fields = ("username", "email", "phone", "role", "password")

    def validate_username(self, value):
        """Ensure username is unique"""
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        """Ensure email is unique"""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        """Create user with proper role"""
        try:
            # Extract and normalize role
            role_value = validated_data.pop("role", "customer")
            role_value = role_value.lower()

            # Validate role
            valid_roles = [choice[0] for choice in CustomUser.ROLE_CHOICES]
            if role_value not in valid_roles:
                logger.error(f"Invalid role: {role_value}")
                raise serializers.ValidationError(f"Invalid role: {role_value}")

            # Create user using create_user (password automatically hashed)
            user = CustomUser.objects.create_user(
                username=validated_data["username"],
                email=validated_data.get("email", ""),
                phone=validated_data.get("phone", ""),
                password=validated_data["password"],
                role=role_value
            )

            logger.info(f"✅ User created successfully: {user.username} ({user.role})")
            return user

        except Exception as e:
            logger.error(f"❌ User creation failed: {str(e)}")
            raise serializers.ValidationError(f"User creation failed: {str(e)}")


# ==============================
# JWT Token Serializer
# ==============================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add extra info inside the token
        token["role"] = user.role
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        # Add user info in response
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "phone": self.user.phone,
            "role": self.user.role,
        }
        return data

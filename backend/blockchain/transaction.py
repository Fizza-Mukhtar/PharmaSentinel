# backend/blockchain/transaction.py
import hmac
import hashlib
import json
from django.conf import settings
from django.utils import timezone
from .roles import get_next_role

# secret for signing transactions
SECRET_KEY = getattr(settings, "BLOCKCHAIN_SECRET", "super_secure_pharmasentinel_key")

def generate_signature(data: dict) -> str:
    """
    Creates an HMAC SHA-256 signature for the given data
    """
    message = json.dumps(data, sort_keys=True).encode()
    return hmac.new(SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()

def verify_signature(data: dict, signature: str) -> bool:
    """
    Verifies the HMAC signature for authenticity
    """
    expected = generate_signature(data)
    return hmac.compare_digest(expected, signature)

def create_transaction(sender: str, receiver: str, batch_id: str, medicine_name: str, location: str):
    """
    Creates a secure transaction record
    """
    data = {
        "sender": sender,
        "receiver": receiver,
        "batch_id": batch_id,
        "medicine_name": medicine_name,
        "location": location,
        "timestamp": str(timezone.now())
    }
    signature = generate_signature(data)
    transaction = {**data, "signature": signature}
    return transaction



SECRET_KEY = getattr(settings, "BLOCKCHAIN_SECRET", "super_secure_pharmasentinel_key")

def generate_signature(data: dict) -> str:
    message = json.dumps(data, sort_keys=True).encode()
    return hmac.new(SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()

def verify_signature(data: dict, signature: str) -> bool:
    expected = generate_signature(data)
    return hmac.compare_digest(expected, signature)

def validate_roles(sender_role: str, receiver_role: str) -> bool:
    """
    Validate supply chain flow.
    e.g., Manufacturer → Distributor is valid, but Manufacturer → Customer is invalid.
    """
    next_role = get_next_role(sender_role)
    return next_role == receiver_role

def create_transaction(sender: str, receiver: str, batch_id: str, medicine_name: str, location: str, sender_role: str, receiver_role: str):
    """
    Creates a secure, role-validated transaction.
    """
    if not validate_roles(sender_role, receiver_role):
        raise ValueError(f"❌ Invalid role transition: {sender_role} → {receiver_role}")

    data = {
        "sender": sender,
        "receiver": receiver,
        "batch_id": batch_id,
        "medicine_name": medicine_name,
        "location": location,
        "sender_role": sender_role,
        "receiver_role": receiver_role,
        "timestamp": str(timezone.now())
    }

    signature = generate_signature(data)
    transaction = {**data, "signature": signature}
    return transaction
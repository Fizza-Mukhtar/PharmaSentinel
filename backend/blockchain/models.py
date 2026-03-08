# backend/blockchain/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import hashlib, hmac, json


try:
    from django.db.models import JSONField
except ImportError:
    from django.contrib.postgres.fields import JSONField


def sha256_hex(s: str) -> str:
    """Compute SHA256 hash of a UTF-8 string"""
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


class BlockChainBlock(models.Model):
    """
    Represents a single immutable block in the PharmaSentinel blockchain.
    Each medicine batch has its own linear blockchain.
    """

    index = models.PositiveIntegerField(help_text="Block number in the chain", db_index=True)
    batch_id = models.CharField(max_length=128, help_text="Medicine batch identifier", db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, help_text="Block creation time")
    previous_hash = models.CharField(max_length=128, blank=True, null=True, help_text="Previous block hash")
    transaction_data = JSONField(help_text="Transaction data (sender, receiver, etc.)")
    hash = models.CharField(max_length=128, editable=False, help_text="SHA256 hash of this block")
    server_signature = models.CharField(max_length=256, editable=False, help_text="HMAC signature for this block")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("batch_id", "index")
        unique_together = ("batch_id", "index")
        indexes = [models.Index(fields=["batch_id", "index"])]
        verbose_name = "Blockchain Block"
        verbose_name_plural = "Blockchain Blocks"

    def __str__(self):
        return f"Block #{self.index} for Batch {self.batch_id}"

    # -------------------------------
    # VALIDATION
    # -------------------------------
    def clean(self):
        if self.index < 1:
            raise ValidationError("Block index must start from 1 (Genesis block = 1).")
        if not isinstance(self.transaction_data, dict):
            raise ValidationError("transaction_data must be a dictionary.")

    # -------------------------------
    # HASHING & SIGNING
    # -------------------------------
    def compute_hash(self) -> str:
        """Compute deterministic SHA256 hash of block content"""
        data_str = (
            f"{self.index}|{self.timestamp.isoformat()}|"
            f"{json.dumps(self.transaction_data, sort_keys=True)}|"
            f"{self.previous_hash or ''}"
        )
        return sha256_hex(data_str)

    def sign_hash(self, secret=None) -> str:
        """Compute HMAC signature of hash"""
        secret_key = (secret or getattr(settings, "HMAC_SECRET", None) or settings.SECRET_KEY).encode("utf-8")
        return hmac.new(secret_key, self.hash.encode("utf-8"), hashlib.sha256).hexdigest()

    def verify_signature(self, secret=None) -> bool:
        """Verify HMAC signature for integrity"""
        expected = self.sign_hash(secret)
        return hmac.compare_digest(expected, self.server_signature or "")

    # -------------------------------
    # SAVE LOGIC
    # -------------------------------
    def save(self, *args, **kwargs):
        # Set timestamp before hashing
        if not self.timestamp:
            self.timestamp = timezone.now()

        # Compute hash
        self.hash = self.compute_hash()

        # Compute HMAC signature
        secret_key = getattr(settings, "HMAC_SECRET", None) or settings.SECRET_KEY
        self.server_signature = hmac.new(secret_key.encode("utf-8"), self.hash.encode("utf-8"), hashlib.sha256).hexdigest()

        super().save(*args, **kwargs)

    # -------------------------------
    # CHAIN VALIDATION HELPERS
    # -------------------------------
    @classmethod
    def get_chain_for_batch(cls, batch_id: str):
        """Return all blocks for a batch ordered by index"""
        return cls.objects.filter(batch_id=batch_id).order_by("index")

    @classmethod
    def validate_chain(cls, batch_id: str, secret=None):
        """Validate entire blockchain for integrity"""
        blocks = list(cls.get_chain_for_batch(batch_id))
        if not blocks:
            return False, "No blocks found."

        for i, blk in enumerate(blocks):
            # Index check
            if blk.index != i + 1:
                return False, f"Index mismatch at block {blk.index}"

            # Hash verification
            recomputed = blk.compute_hash()
            if recomputed != blk.hash:
                return False, f"Hash mismatch at block {blk.index}"

            # Signature verification
            if not blk.verify_signature(secret):
                return False, f"Invalid signature at block {blk.index}"

            # Previous hash check
            if i > 0 and blk.previous_hash != blocks[i - 1].hash:
                return False, f"Previous hash mismatch at block {blk.index}"

        return True, "Chain valid ✅"


# -------------------------------
# Optional helper to get full JSON chain
# -------------------------------
def get_full_chain_json(batch_id: str):
    blocks = BlockChainBlock.objects.filter(batch_id=batch_id).order_by("index")
    history = []
    for b in blocks:
        history.append({
            "index": b.index,
            "timestamp": b.timestamp,
            "from_user": str(b.created_by) if b.created_by else None,
            "transaction_data": b.transaction_data,
            "hash": b.hash,
            "previous_hash": b.previous_hash,
        })
    valid, msg = BlockChainBlock.validate_chain(batch_id)
    return {"batch_id": batch_id, "valid": valid, "message": msg, "chain": history}

from typing import Optional, Tuple
import logging
import json
import hashlib
import hmac

from django.db import transaction
from django.conf import settings
from django.utils import timezone

from .models import BlockChainBlock

logger = logging.getLogger(__name__)


# ==============================
# HMAC SECRET HELPER
# ==============================
def _get_hmac_secret(secret: Optional[str] = None) -> str:
    """Returns HMAC secret key."""
    return secret or getattr(settings, "HMAC_SECRET", settings.SECRET_KEY)


# ==============================
# HASHING + SIGNING
# ==============================
def compute_canonical_hash(index: int, timestamp, transaction_data: dict, previous_hash: Optional[str]):
    """Compute SHA256 hash of the block's canonical string."""
    ts = timestamp.isoformat() if timestamp else ""
    tx_json = json.dumps(transaction_data, sort_keys=True, ensure_ascii=False)
    raw = f"{index}|{ts}|{tx_json}|{previous_hash or ''}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def sign_hash_hex(hash_hex: str, secret=None) -> str:
    """Return HMAC signature of hash."""
    s = _get_hmac_secret(secret)
    return hmac.new(s.encode("utf-8"), hash_hex.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_hmac_signature(hash_hex: str, signature_hex: str, secret=None) -> bool:
    """Verify HMAC signature."""
    expected = sign_hash_hex(hash_hex, secret)
    return hmac.compare_digest(expected, signature_hex or "")


# ==============================
# BLOCK HELPERS
# ==============================
def get_last_block(batch_id: str) -> Optional[BlockChainBlock]:
    """Get last block for a batch."""
    return BlockChainBlock.get_chain_for_batch(batch_id).last()


# ==============================
# GENESIS BLOCK
# ==============================
@transaction.atomic
def create_genesis_block(batch_id: str, transaction_data: dict, created_by=None) -> BlockChainBlock:
    """Create first block of a batch (genesis)."""
    if get_last_block(batch_id):
        raise Exception(f"Genesis block already exists for batch {batch_id}")

    ts = timezone.now()
    block = BlockChainBlock(
        index=1,
        batch_id=batch_id,
        timestamp=ts,
        previous_hash="0",
        transaction_data=transaction_data,
        created_by=created_by,
    )
    block.hash = compute_canonical_hash(block.index, ts, transaction_data, block.previous_hash)
    block.server_signature = sign_hash_hex(block.hash)
    block.save()
    logger.info("Genesis block created for batch %s", batch_id)
    return block


# ==============================
# TRANSFER BLOCK
# ==============================
@transaction.atomic
def create_transfer_block(batch_id: str, transaction_data: dict, created_by=None) -> BlockChainBlock:
    """Create a transfer block after genesis."""
    last_block = get_last_block(batch_id)
    if not last_block:
        raise Exception(f"No genesis block found for batch {batch_id}")

    valid, msg = BlockChainBlock.validate_chain(batch_id)
    if not valid:
        raise Exception(f"Blockchain invalid for batch {batch_id}: {msg}")

    ts = timezone.now()
    new_index = last_block.index + 1
    computed_hash = compute_canonical_hash(new_index, ts, transaction_data, last_block.hash)
    signature = sign_hash_hex(computed_hash)

    block = BlockChainBlock(
        index=new_index,
        batch_id=batch_id,
        timestamp=ts,
        previous_hash=last_block.hash,
        transaction_data=transaction_data,
        created_by=created_by,
        hash=computed_hash,
        server_signature=signature
    )
    block.save()
    logger.info("Transfer block #%d created for batch %s", new_index, batch_id)
    return block


# ==============================
# PARTIAL TRANSFER BLOCK
# ==============================
def create_partial_transfer_block(batch, sender, receiver, quantity, created_by=None) -> BlockChainBlock:
    """Create a partial transfer block for a quantity < remaining_quantity."""
    if quantity <= 0 or quantity > batch.remaining_quantity:
        raise ValueError(f"Invalid transfer quantity {quantity} for batch {batch.batch_id}")

    tx_data = {
        "batch_id": batch.batch_id,
        "sender_id": sender.id,
        "receiver_id": receiver.id,
        "quantity_transferred": quantity,
        "remaining_quantity_after_transfer": batch.remaining_quantity - quantity,
        "timestamp": str(timezone.now()),
    }
    return create_transfer_block(batch.batch_id, tx_data, created_by)


# ==============================
# VALIDATION
# ==============================
def validate_chain(batch_id: str, secret=None) -> Tuple[bool, str]:
    """Validate the entire blockchain for a batch."""
    return BlockChainBlock.validate_chain(batch_id, secret=secret)


# ==============================
# VERIFY BLOCKCHAIN
# ==============================
def verify_blockchain(batch_id: str) -> dict:
    """Verify blockchain integrity and signatures."""
    blocks = BlockChainBlock.get_chain_for_batch(batch_id)
    if not blocks.exists():
        return {"status": "error", "message": "No blockchain data found"}

    secret = _get_hmac_secret()
    expected_prev = "0"

    for block in blocks:
        recalc_hash = compute_canonical_hash(block.index, block.timestamp, block.transaction_data, block.previous_hash)
        if recalc_hash != block.hash:
            return {"status": "tampered", "message": f"Hash mismatch at block {block.index}", "failed_block": block.index}

        if not hmac.compare_digest(sign_hash_hex(recalc_hash, secret), block.server_signature or ""):
            return {"status": "tampered", "message": f"Signature mismatch at block {block.index}", "failed_block": block.index}

        if block.previous_hash != expected_prev:
            return {"status": "tampered", "message": f"Broken chain at block {block.index}", "failed_block": block.index}

        expected_prev = block.hash

    return {"status": "authentic", "message": "Blockchain valid ✅"}


# ==============================
# AUTO CREATE BLOCK
# ==============================
def create_block(data: dict, created_by=None) -> Optional[BlockChainBlock]:
    """Auto-create genesis or transfer block based on batch existence."""
    batch_id = data.get("batch_id")
    if not batch_id:
        raise ValueError("batch_id is required")

    last = get_last_block(batch_id)
    if last:
        return create_transfer_block(batch_id, data, created_by)
    return create_genesis_block(batch_id, data, created_by)

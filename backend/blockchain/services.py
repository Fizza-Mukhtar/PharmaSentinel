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


# =====================================================
# 🔐 HMAC SECRET
# =====================================================
def _get_hmac_secret(secret: Optional[str] = None) -> str:
    """
    Returns HMAC secret key.
    Uses environment variable if available, else Django SECRET_KEY.
    """
    return secret or getattr(settings, "HMAC_SECRET", settings.SECRET_KEY)


# =====================================================
# 🔗 HASHING & SIGNING
# =====================================================
def compute_canonical_hash(
    index: int,
    timestamp,
    transaction_data: dict,
    previous_hash: Optional[str],
) -> str:
    """
    Compute SHA256 hash using canonical ordering.
    """
    ts = timestamp.isoformat() if timestamp else ""
    tx_json = json.dumps(transaction_data, sort_keys=True, ensure_ascii=False)
    raw = f"{index}|{ts}|{tx_json}|{previous_hash or ''}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def sign_hash_hex(hash_hex: str, secret: Optional[str] = None) -> str:
    """
    Sign a hash using HMAC-SHA256.
    """
    key = _get_hmac_secret(secret)
    return hmac.new(key.encode(), hash_hex.encode(), hashlib.sha256).hexdigest()


def verify_hmac_signature(hash_hex: str, signature_hex: str, secret: Optional[str] = None) -> bool:
    """
    Verify HMAC signature integrity.
    """
    expected = sign_hash_hex(hash_hex, secret)
    return hmac.compare_digest(expected, signature_hex or "")


# =====================================================
# ⛓ BLOCK HELPERS
# =====================================================
def get_last_block(batch_id: str) -> Optional[BlockChainBlock]:
    """
    Returns last block for a batch chain.
    """
    return BlockChainBlock.get_chain_for_batch(batch_id).last()


# =====================================================
# 🧬 GENESIS BLOCK (STRICT – ONE PER BATCH)
# =====================================================
@transaction.atomic
def create_genesis_block(
    batch_id: str,
    transaction_data: dict,
    created_by=None
) -> BlockChainBlock:
    """
    Create the first (genesis) block for a batch.
    Prevents duplicate genesis blocks completely.
    """

    existing = BlockChainBlock.objects.filter(batch_id=batch_id).order_by("index")

    if existing.exists():
        genesis = existing.first()
        logger.warning(
            "⚠️ Genesis already exists for batch %s (block #%d)",
            batch_id, genesis.index
        )
        return genesis

    logger.info("✅ Creating GENESIS block for batch %s", batch_id)

    ts = timezone.now()
    block = BlockChainBlock(
        index=1,
        batch_id=batch_id,
        timestamp=ts,
        previous_hash="0",
        transaction_data=transaction_data,
        created_by=created_by,
    )

    block.hash = compute_canonical_hash(
        block.index,
        ts,
        transaction_data,
        block.previous_hash,
    )
    block.server_signature = sign_hash_hex(block.hash)
    block.save()

    logger.info("✅ Genesis block created (hash=%s)", block.hash[:16])
    return block


# =====================================================
# 🔄 TRANSFER BLOCK (DUPLICATE SAFE)
# =====================================================
@transaction.atomic
def create_transfer_block(
    batch_id: str,
    transaction_data: dict,
    created_by=None
) -> BlockChainBlock:
    """
    Create a transfer block after genesis.
    Includes duplicate transaction detection.
    """

    last_block = get_last_block(batch_id)
    if not last_block:
        raise Exception(f"No genesis block found for batch {batch_id}")

    transfer_id = (
        transaction_data.get("transfer_id")
        or transaction_data.get("tx_id")
    )

    # 🔎 Duplicate detection
    for block in BlockChainBlock.objects.filter(batch_id=batch_id):
        existing_tx = block.transaction_data or {}

        if transfer_id and (
            existing_tx.get("transfer_id") == transfer_id
            or existing_tx.get("tx_id") == transfer_id
        ):
            logger.warning(
                "⚠️ Duplicate transfer block detected (transfer_id=%s)",
                transfer_id
            )
            return block

        if _is_duplicate_transaction(existing_tx, transaction_data):
            logger.warning(
                "⚠️ Duplicate transaction data detected (block #%d)",
                block.index
            )
            return block

    # ⛓ Validate blockchain before append
    valid, msg = BlockChainBlock.validate_chain(batch_id)
    if not valid:
        raise Exception(f"Blockchain corrupted: {msg}")

    ts = timezone.now()
    new_index = last_block.index + 1

    computed_hash = compute_canonical_hash(
        new_index,
        ts,
        transaction_data,
        last_block.hash,
    )

    block = BlockChainBlock(
        index=new_index,
        batch_id=batch_id,
        timestamp=ts,
        previous_hash=last_block.hash,
        transaction_data=transaction_data,
        created_by=created_by,
        hash=computed_hash,
        server_signature=sign_hash_hex(computed_hash),
    )

    block.save()
    logger.info(
        "✅ Transfer block #%d created (hash=%s)",
        new_index, block.hash[:16]
    )
    return block


# =====================================================
# 🔍 DUPLICATE TRANSACTION DETECTOR
# =====================================================
def _is_duplicate_transaction(tx1: dict, tx2: dict) -> bool:
    """
    Detects logically identical transactions even if formatted differently.
    """
    if not tx1 or not tx2:
        return False

    def normalize(tx):
        return {
            "batch_id": tx.get("batch_id"),
            "sender": tx.get("sender_id") or tx.get("from_user"),
            "receiver": tx.get("receiver_id") or tx.get("to_user"),
            "quantity": tx.get("quantity") or tx.get("quantity_transferred"),
            "action": tx.get("action"),
        }

    n1, n2 = normalize(tx1), normalize(tx2)

    return all(
        n1[k] == n2[k]
        for k in n1
        if n1[k] is not None and n2[k] is not None
    )


# =====================================================
# 📦 PARTIAL TRANSFER SUPPORT
# =====================================================
def create_partial_transfer_block(
    batch,
    sender,
    receiver,
    quantity,
    created_by=None
) -> BlockChainBlock:
    """
    Create transfer block for partial batch movement.
    """

    if quantity <= 0 or quantity > batch.remaining_quantity:
        raise ValueError("Invalid transfer quantity")

    tx_data = {
        "batch_id": batch.batch_number,
        "action": "PARTIAL_TRANSFER",
        "sender_id": sender.id,
        "receiver_id": receiver.id,
        "quantity_transferred": quantity,
        "remaining_after": batch.remaining_quantity - quantity,
        "timestamp": timezone.now().isoformat(),
    }

    return create_transfer_block(batch.batch_number, tx_data, created_by)


# =====================================================
# ✅ VALIDATION & VERIFICATION
# =====================================================
def validate_chain(batch_id: str, secret: Optional[str] = None) -> Tuple[bool, str]:
    """
    Validate blockchain structure and signatures.
    """
    return BlockChainBlock.validate_chain(batch_id, secret=secret)


def verify_blockchain(batch_id: str) -> dict:
    """
    Full blockchain integrity verification.
    """
    blocks = BlockChainBlock.get_chain_for_batch(batch_id)

    if not blocks.exists():
        return {"status": "error", "message": "No blockchain data found"}

    secret = _get_hmac_secret()
    expected_prev = "0"

    for block in blocks:
        recalculated = compute_canonical_hash(
            block.index,
            block.timestamp,
            block.transaction_data,
            block.previous_hash,
        )

        if recalculated != block.hash:
            return {"status": "tampered", "block": block.index, "reason": "Hash mismatch"}

        if not verify_hmac_signature(recalculated, block.server_signature, secret):
            return {"status": "tampered", "block": block.index, "reason": "Invalid signature"}

        if block.previous_hash != expected_prev:
            return {"status": "tampered", "block": block.index, "reason": "Broken chain"}

        expected_prev = block.hash

    return {"status": "authentic", "message": "Blockchain verified ✅"}


# =====================================================
# 🔁 AUTO BLOCK CREATOR
# =====================================================
def create_block(data: dict, created_by=None) -> BlockChainBlock:
    """
    Automatically decides between genesis or transfer block.
    """
    batch_id = data.get("batch_id")
    if not batch_id:
        raise ValueError("batch_id is required")

    if get_last_block(batch_id):
        return create_transfer_block(batch_id, data, created_by)

    return create_genesis_block(batch_id, data, created_by)




# =====================================================
# 🔐 COUNTERFEIT DETECTION
# =====================================================
def detect_counterfeit_attempts(batch_id: str) -> dict:
    """
    Detect potential counterfeit or suspicious activity
    Returns dict with security alerts
    """
    from .models import BlockChainBlock
    
    blocks = BlockChainBlock.get_chain_for_batch(batch_id)
    alerts = []
    
    if not blocks.exists():
        return {
            "is_suspicious": True,
            "alerts": ["⚠️ No blockchain found - likely COUNTERFEIT"],
            "risk_level": "CRITICAL"
        }
    
    # Check 1: Duplicate transactions
    seen_tx_ids = set()
    for block in blocks:
        tx_data = block.transaction_data or {}
        tx_id = tx_data.get("transfer_id") or tx_data.get("tx_id")
        
        if tx_id:
            if tx_id in seen_tx_ids:
                alerts.append(f"⚠️ Duplicate transaction detected: {tx_id}")
            seen_tx_ids.add(tx_id)
    
    # Check 2: Hash integrity
    for block in blocks:
        recomputed = compute_canonical_hash(
            block.index,
            block.timestamp,
            block.transaction_data,
            block.previous_hash
        )
        
        if recomputed != block.hash:
            alerts.append(f"🚨 CRITICAL: Hash tampered at block #{block.index}")
    
    # Check 3: Chain continuity
    previous_hash = "0"
    for block in blocks.order_by("index"):
        if block.previous_hash != previous_hash:
            alerts.append(f"🚨 CRITICAL: Chain broken at block #{block.index}")
        previous_hash = block.hash
    
    # Determine risk level
    if any("CRITICAL" in alert for alert in alerts):
        risk_level = "CRITICAL"
    elif alerts:
        risk_level = "HIGH"
    else:
        risk_level = "SAFE"
    
    return {
        "is_suspicious": len(alerts) > 0,
        "alerts": alerts,
        "risk_level": risk_level,
        "total_blocks": blocks.count(),
        "checked_at": timezone.now().isoformat()
    }


# =====================================================
# 🔐 VERIFY BATCH AUTHENTICITY
# =====================================================
def verify_batch_authenticity(batch_id: str) -> dict:
    """
    Complete authenticity check for a batch
    Combines blockchain validation + counterfeit detection
    """
    from .models import BlockChainBlock
    
    # Step 1: Check if blockchain exists
    blocks = BlockChainBlock.get_chain_for_batch(batch_id)
    if not blocks.exists():
        return {
            "authentic": False,
            "status": "COUNTERFEIT",
            "message": "⚠️ No blockchain trail found. This is likely a FAKE medicine.",
            "action": "DO NOT USE. Report to DRAP immediately."
        }
    
    # Step 2: Validate blockchain
    chain_valid, chain_message = validate_chain(batch_id)
    
    # Step 3: Counterfeit detection
    counterfeit_check = detect_counterfeit_attempts(batch_id)
    
    # Step 4: Determine overall authenticity
    if not chain_valid or counterfeit_check["is_suspicious"]:
        return {
            "authentic": False,
            "status": "SUSPICIOUS",
            "blockchain_valid": chain_valid,
            "blockchain_message": chain_message,
            "security_alerts": counterfeit_check["alerts"],
            "risk_level": counterfeit_check["risk_level"],
            "message": "⚠️ SECURITY WARNING: Suspicious activity detected",
            "action": "Verify with manufacturer or report to DRAP"
        }
    
    # All checks passed
    return {
        "authentic": True,
        "status": "VERIFIED",
        "blockchain_valid": True,
        "blockchain_message": chain_message,
        "risk_level": "SAFE",
        "total_blocks": blocks.count(),
        "message": "✅ Medicine is AUTHENTIC",
        "verified_at": timezone.now().isoformat()
    }


# =====================================================
# 🔐 ENHANCED VALIDATION WITH SECURITY CHECKS
# =====================================================
def validate_chain_with_security(batch_id: str, secret: Optional[str] = None) -> dict:
    """
    Enhanced chain validation with detailed security report
    """
    from .models import BlockChainBlock
    
    blocks = list(BlockChainBlock.get_chain_for_batch(batch_id))
    
    if not blocks:
        return {
            "valid": False,
            "message": "No blockchain found",
            "security_issues": ["Missing blockchain - potential counterfeit"]
        }
    
    security_issues = []
    expected_prev = "0"
    
    for i, block in enumerate(blocks):
        # Index check
        if block.index != i + 1:
            security_issues.append(f"Index mismatch at block {block.index}")
        
        # Hash verification
        recomputed = compute_canonical_hash(
            block.index,
            block.timestamp,
            block.transaction_data,
            block.previous_hash
        )
        
        if recomputed != block.hash:
            security_issues.append(f"🚨 Hash tampered at block {block.index}")
        
        # Signature verification
        if not verify_hmac_signature(recomputed, block.server_signature, secret):
            security_issues.append(f"🚨 Invalid signature at block {block.index}")
        
        # Chain continuity
        if block.previous_hash != expected_prev:
            security_issues.append(f"🚨 Chain broken at block {block.index}")
        
        expected_prev = block.hash
    
    # Overall verdict
    is_valid = len(security_issues) == 0
    
    return {
        "valid": is_valid,
        "message": "Chain valid ✅" if is_valid else "Security issues detected ⚠️",
        "total_blocks": len(blocks),
        "security_issues": security_issues,
        "risk_level": "SAFE" if is_valid else "HIGH" if security_issues else "MEDIUM"
    }
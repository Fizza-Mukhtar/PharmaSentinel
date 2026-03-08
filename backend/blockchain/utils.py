# blockchain/utils.py
from .models import BlockChainBlock
import hashlib

def is_chain_valid(batch_id: str) -> bool:
    """
    Validates the blockchain for a specific batch.
    Returns True if valid, False if tampered.
    """
    blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by("index")
    previous_hash = None

    for block in blocks:
        # Check hash
        block_string = f"{block.index}{block.timestamp}{block.batch_id}{block.transaction_data}{block.previous_hash}"
        computed_hash = hashlib.sha256(block_string.encode()).hexdigest()
        if computed_hash != block.hash:
            return False
        # Check previous hash
        if previous_hash and block.previous_hash != previous_hash:
            return False
        previous_hash = block.hash
    return True

def get_role(user):
    """
    Utility to fetch user role safely.
    """
    return getattr(user, "role", None)

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.db import transaction
from .models import MedicineBatch, TransferRecord
from .utils import generate_qr_for_batch, get_role
from blockchain.services import create_block

# ✅ Prevent recursion / double trigger
BLOCK_CREATION_LOCK = set()


# -------------------------------------------------
# 1️⃣ CREATE GENESIS BLOCK WHEN MEDICINE IS CREATED
# -------------------------------------------------
@receiver(post_save, sender=MedicineBatch)
def create_genesis_block_and_qr(sender, instance, created, **kwargs):
    # ✅ CRITICAL: Only run for NEW batches (not updates)
    if not created:
        return
    
    # ✅ CRITICAL: Ignore if update_fields is set (means it's a partial update)
    if kwargs.get('update_fields'):
        return

    from blockchain.models import BlockChainBlock

    batch_id = instance.batch_id
    if batch_id in BLOCK_CREATION_LOCK:
        return

    BLOCK_CREATION_LOCK.add(batch_id)

    # 🧠 Check if genesis block already exists
    if BlockChainBlock.objects.filter(batch_id=batch_id, index=1).exists():
        BLOCK_CREATION_LOCK.remove(batch_id)
        return

    data = {
        "action": "GENESIS",
        "batch_id": batch_id,
        "medicine_name": instance.name,
        "manufacturer": instance.manufacturer.username,
        "manufacture_date": str(instance.manufacture_date),
        "expiry_date": str(instance.expiry_date),
        "quantity": instance.quantity,
        "notes": "Genesis block: batch created",
    }

    try:
        with transaction.atomic():
            create_block(data, created_by=instance.manufacturer)
            print(f"✅ Genesis block created for {batch_id}")
    except Exception as e:
        print(f"⚠️ Error creating genesis block for {batch_id}: {e}")
    finally:
        BLOCK_CREATION_LOCK.remove(batch_id)

    # ✅ Update current holder safely
    MedicineBatch.objects.filter(pk=instance.pk, current_holder__isnull=True).update(
        current_holder=instance.manufacturer
    )

    # ✅ Generate QR code
    base_url = getattr(settings, "SITE_URL", "http://localhost:8000")
    generate_qr_for_batch(instance, base_url)


# --------------------------------------------
# 2️⃣ CREATE NEW BLOCK WHEN MEDICINE IS TRANSFERRED
# --------------------------------------------
@receiver(post_save, sender=TransferRecord)
def add_transfer_block(sender, instance, created, **kwargs):
    # ✅ CRITICAL: Only run for NEW transfers
    if not created:
        return
    
    # ✅ CRITICAL: Ignore if update_fields is set (prevents double-trigger from tx_id update)
    if kwargs.get('update_fields'):
        print(f"⏭️ Skipping signal - update_fields detected: {kwargs.get('update_fields')}")
        return

    from blockchain.models import BlockChainBlock

    transfer_key = f"{instance.batch.batch_id}-{instance.id}"
    if transfer_key in BLOCK_CREATION_LOCK:
        print(f"⏭️ Skipping duplicate signal for transfer {instance.id}")
        return

    BLOCK_CREATION_LOCK.add(transfer_key)

    try:
        # ✅ Check for existing block with same transfer_id
        existing_blocks = BlockChainBlock.objects.filter(batch_id=instance.batch.batch_id)
        lookup_tx_id = f"TR-{instance.id}"
        
        for block in existing_blocks:
            tx_data = block.transaction_data or {}
            if not isinstance(tx_data, dict):
                continue
                
            # Check if this exact transfer already has a block
            if tx_data.get("tx_id") == lookup_tx_id:
                print(f"⚠️ Block already exists for transfer {lookup_tx_id} (Block #{block.index})")
                return
            
            # Also check transfer_id field (in case of different formats)
            if tx_data.get("transfer_id") == instance.id:
                print(f"⚠️ Block already exists for transfer_id {instance.id} (Block #{block.index})")
                return

        # ✅ Get roles
        sender_role = get_role(instance.sender)
        receiver_role = get_role(instance.receiver)

        # ⚠️ Skip if roles missing
        if not sender_role or not receiver_role:
            print(f"⚠️ Missing sender/receiver role for transfer {instance.id}")
            return

        # 🧭 Validate transfer path
        valid_flow = {
            "MANUFACTURER": ["DISTRIBUTOR"],
            "DISTRIBUTOR": ["WAREHOUSE"],
            "WAREHOUSE": ["WHOLESALER"],
            "WHOLESALER": ["SHOPKEEPER"],
            "SHOPKEEPER": ["CUSTOMER"],
        }

        is_valid = (
            receiver_role in valid_flow.get(sender_role, [])
            or sender_role == "DRAP_ADMIN"
            or receiver_role == "DRAP_ADMIN"
        )

        if not is_valid:
            print(f"⚠️ Invalid transfer path: {sender_role} → {receiver_role}")
            return

        # 🧩 Prepare blockchain transaction data (SINGLE FORMAT)
        data = {
            "action": "TRANSFER",
            "tx_id": lookup_tx_id,
            "transfer_id": instance.id,  # ✅ Add both for compatibility
            "batch_id": instance.batch.batch_id,
            "sender": instance.sender.username,
            "receiver": instance.receiver.username,
            "sender_role": sender_role,
            "receiver_role": receiver_role,
            "quantity": instance.quantity,
            "timestamp": str(instance.timestamp),
            "notes": f"Transferred from {sender_role} to {receiver_role}",
        }

        # ✅ Create blockchain block
        with transaction.atomic():
            create_block(data, created_by=instance.sender)
            print(f"✅ Transfer block created for {lookup_tx_id} (Batch: {instance.batch.batch_id})")

    except Exception as e:
        print(f"⚠️ Error creating transfer block: {e}")
        import traceback
        traceback.print_exc()
    finally:
        BLOCK_CREATION_LOCK.discard(transfer_key)

    # ✅ Update batch holder
    try:
        MedicineBatch.objects.filter(pk=instance.batch.pk).update(
            current_holder=instance.receiver
        )
        print(f"✅ Batch holder updated to {instance.receiver.username}")
    except Exception as e:
        print(f"⚠️ Error updating batch holder: {e}")
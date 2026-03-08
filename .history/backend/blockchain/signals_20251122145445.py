# blockchain/signals.py
"""
Auto-create genesis block when a MedicineBatch model instance is created.
This file assumes your medicine-batch model is named 'MedicineBatch' inside app 'medicine'.
If your app/model names differ, change APP_LABEL and MODEL_NAME accordingly.
"""

from django.apps import apps
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import logging

from .services import create_genesis_block, append_transfer_or_create_genesis
from .models import BlockChainBlock

logger = logging.getLogger(__name__)

# Customize if your medicine-batch model is in a different app or has another name
APP_LABEL = "medicine"
MODEL_NAME = "MedicineBatch"

def _get_medicine_model():
    return apps.get_model(APP_LABEL, MODEL_NAME)


@receiver(post_save)
def medicinebatch_post_save(sender, instance, created, **kwargs):
    """
    Auto-create genesis block for a newly created MedicineBatch.

    Behavior:
    - If sender is NOT the expected MedicineBatch model, ignore.
    - On creation, attempt to create genesis block using batch identifier from
      the instance. This function expects `instance` to have an attribute
      that can be used as `batch_id` (e.g. `batch_number` or `batch_id`).
    - If chain already exists, do nothing. If creation fails, log error.
    """
    MedicineBatch = _get_medicine_model()
    if sender is not MedicineBatch:
        return

    # Attempt to extract batch id from common field names
    batch_id = None
    for attr in ("batch_id", "batch_number", "batch_no", "identifier", "id"):
        if hasattr(instance, attr):
            batch_id = getattr(instance, attr)
            break

    if not batch_id:
        logger.error("MedicineBatch instance saved but no batch identifier found: %s", instance)
        return

    # assemble minimal transaction_data for genesis
    tx = {
        "sender_role": "Manufacturer",
        "sender_id": getattr(instance, "manufacturer_id", None) or getattr(instance, "manufacturer", None),
        "receiver_role": "Manufacturer",
        "receiver_id": getattr(instance, "manufacturer_id", None) or getattr(instance, "manufacturer", None),
        "quantity": getattr(instance, "quantity", None) or 0,
        "tx_id": f"GEN-{batch_id}",
        "notes": "Genesis block: batch created"
    }

    try:
        # Use append_transfer_or_create_genesis so it will create genesis if not exists
        append_transfer_or_create_genesis(str(batch_id), tx, created_by=None)
        logger.info("Genesis block ensured for batch %s", batch_id)
    except Exception as e:
        # Do not raise — signals should not break saving flow. Log for later debugging.
        logger.exception("Failed to create genesis block for batch %s: %s", batch_id, e)
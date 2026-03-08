# blockchain/apps.py
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class BlockchainConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "blockchain"
    verbose_name = "PharmaSentinel Blockchain"

    def ready(self):
        # Import signals to register handlers
        try:
            import blockchain.signals  # noqa: F401
            logger.debug("blockchain.signals loaded")
        except Exception as e:
            logger.exception("Failed to import blockchain.signals: %s", e)
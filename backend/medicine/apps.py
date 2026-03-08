from django.apps import AppConfig

class MedicineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'medicine'

    def ready(self):
        import sys
        # Only load signals once when running server or shell
        if any(cmd in sys.argv for cmd in ['runserver', 'shell']):
            from . import signals
            if not getattr(signals, "SIGNAL_REGISTERED", False):
                signals.SIGNAL_REGISTERED = True
                print("✅ Medicine signals loaded successfully (single import).")

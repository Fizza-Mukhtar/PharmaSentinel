from django.contrib import admin
from .models import MedicineBatch, TransferRecord
from .models import UserRole
admin.site.register(UserRole)


@admin.register(MedicineBatch)
class MedicineBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_id', 'name', 'manufacturer', 'manufacture_date', 'expiry_date', 'quantity')

@admin.register(TransferRecord)
class TransferRecordAdmin(admin.ModelAdmin):
    list_display = ('batch', 'sender', 'receiver', 'quantity', 'timestamp') 
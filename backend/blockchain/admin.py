# blockchain/admin.py
from django.contrib import admin
from .models import BlockChainBlock

@admin.register(BlockChainBlock)
class BlockChainBlockAdmin(admin.ModelAdmin):
    list_display = ("batch_id", "index", "created_by", "timestamp", "hash")
    list_filter = ("batch_id", "created_by")
    search_fields = ("batch_id", "hash", "server_signature", "transaction_data")
    readonly_fields = ("hash", "server_signature", "created_at")
    ordering = ("batch_id", "index")

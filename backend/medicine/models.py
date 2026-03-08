import os
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

User = get_user_model()

ROLE_CHOICES = [
    ("DRAP_ADMIN", "DRAP Admin"),
    ("MANUFACTURER", "Manufacturer"),
    ("DISTRIBUTOR", "Distributor"),
    ("WAREHOUSE", "Warehouse"),
    ("WHOLESALER", "Wholesaler"),
    ("SHOPKEEPER", "Shopkeeper"),
    ("CUSTOMER", "Customer"),
]

class UserRole(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CUSTOMER")

    def __str__(self):
        return f"{self.user.username} ({self.role})"


def qr_upload_path(instance, filename):
    return os.path.join("qr_codes", f"{instance.batch_id}.png")


class MedicineBatch(models.Model):

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXHAUSTED', 'Exhausted'),
        ('EXPIRED', 'Expired'),
        ('RECALLED', 'Recalled'),
    ]

    batch_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    total_distributed = models.PositiveIntegerField(default=0)

    current_holder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="holding_batches"
    )

    batch_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    manufacturer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="batches")
    manufacture_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)

    # ⚠️ legacy field — NOT source of truth
    remaining_quantity = models.PositiveIntegerField(default=0)

    qr_code = models.ImageField(upload_to=qr_upload_path, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.batch_id})"

    def clean(self):
        if self.expiry_date and self.manufacture_date:
            if self.expiry_date <= self.manufacture_date:
                raise ValidationError("Expiry date must be after manufacture date.")

    def save(self, *args, **kwargs):
        skip_validation = kwargs.pop("skip_validation", False)
        if not skip_validation:
            self.clean()

        # ✅ FIRST SAVE
        super().save(*args, **kwargs)

        # ✅ REFRESH VALUES FROM DB
        self.refresh_from_db(fields=["total_distributed"])

        # ✅ AUTO-UPDATE STATUS BASED ON SOLD UNITS + INVENTORY
        today = timezone.now().date()
        new_status = self.batch_status
    
        # Don't change RECALLED status
        if self.batch_status != 'RECALLED':
            # Check expiry first
            if self.expiry_date and self.expiry_date < today:
                new_status = "EXPIRED"
            else:
                # ✅ Import here to avoid circular imports
                from django.db.models import Sum
                
                # Count ONLY units SOLD to customers
                total_sold = TransferRecord.objects.filter(
                    batch=self, 
                    status="SOLD"
                ).aggregate(total=Sum('quantity'))['total'] or 0
                
                # Count total inventory in supply chain
                total_inventory = Inventory.objects.filter(
                    batch=self
                ).aggregate(total=Sum('quantity'))['total'] or 0
                
                # ✅ EXHAUSTED only if ALL sold AND no inventory anywhere
                if total_sold >= self.quantity and total_inventory == 0:
                    new_status = "EXHAUSTED"
                else:
                    new_status = "ACTIVE"
    
        # Update if changed
        if new_status != self.batch_status:
            self.batch_status = new_status
            super().save(update_fields=["batch_status"])

    def is_qr_valid(self):
        """
        ✅ QR is INVALID if:
        - Batch is RECALLED (security threat)
        - Batch is EXHAUSTED (all units sold AND no inventory)
        - Batch is EXPIRED
        """
        return self.batch_status == "ACTIVE"


# ✅ Set initial holder + remaining quantity + generate QR
@receiver(post_save, sender=MedicineBatch)
def set_initial_holder(sender, instance, created, **kwargs):
    if created:
        update_fields = []
        
        # Set holder to manufacturer
        if not instance.current_holder:
            instance.current_holder = instance.manufacturer
            update_fields.append("current_holder")
        
        # Set remaining quantity
        if instance.remaining_quantity == 0:
            instance.remaining_quantity = instance.quantity
            update_fields.append("remaining_quantity")
        
        if update_fields:
            instance.save(update_fields=update_fields)
        
        # Generate QR code if not exists
        if not instance.qr_code:
            from medicine.utils import generate_qr_for_batch
            base_url = getattr(settings, "BASE_URL", "http://localhost:8000")
            try:
                generate_qr_for_batch(instance, base_url)
                print(f"✅ Auto-generated QR for batch {instance.batch_id}")
            except Exception as e:
                print(f"❌ QR generation failed for {instance.batch_id}: {str(e)}")


# ========================================
# INVENTORY MODEL
# ========================================
class Inventory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inventory_items"
    )
    batch = models.ForeignKey(
        MedicineBatch,
        on_delete=models.CASCADE,
        related_name="inventory_records"
    )
    quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'batch')
        verbose_name_plural = "Inventories"

    def __str__(self):
        return f"{self.user.username} - {self.batch.batch_id} ({self.quantity})"


class TransferRecord(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_TRANSIT", "In Transit"),
        ("CONFIRMED", "Confirmed"),
        ("REJECTED", "Rejected"),
        ("SOLD", "Sold"),
    ]

    batch = models.ForeignKey(
        MedicineBatch,
        on_delete=models.CASCADE,
        related_name="transfers"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_transfers"
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_transfers"
    )
    quantity = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CREATED"
    )

    timestamp = models.DateTimeField(default=timezone.now)
    tx_id = models.CharField(max_length=120, unique=True, blank=True)

    def clean(self):
        # ✅ Skip validation for SOLD
        if self.status == "SOLD":
            return

        if self.pk:
            return

        if not self.sender or not self.receiver:
            raise ValidationError("Sender and receiver required.")

        sender_role = getattr(self.sender.profile, "role", None)
        receiver_role = getattr(self.receiver.profile, "role", None)

        allowed_chain = [
            ("MANUFACTURER", "DISTRIBUTOR"),
            ("DISTRIBUTOR", "WAREHOUSE"),
            ("WAREHOUSE", "WHOLESALER"),
            ("WHOLESALER", "SHOPKEEPER"),
        ]

        if (sender_role, receiver_role) not in allowed_chain:
            raise ValidationError("❌ Invalid supply chain transfer.")

    def save(self, *args, **kwargs):
        if not self.tx_id:
            self.tx_id = f"TR-{timezone.now().timestamp()}"

        self.full_clean()
        super().save(*args, **kwargs)


# =====================================
# AUTO CREATE USER ROLE PROFILE
# =====================================
@receiver(post_save, sender=User)
def create_user_role(sender, instance, created, **kwargs):
    if created:
        UserRole.objects.create(user=instance)


class SuspiciousMedicineReport(models.Model):
    """Customer reports of suspicious/counterfeit medicines"""
    
    batch_id = models.CharField(max_length=255, db_index=True)
    reason = models.CharField(max_length=500)
    
    # Reporter information
    reporter_name = models.CharField(max_length=255)
    reporter_phone = models.CharField(max_length=50)
    reporter_email = models.EmailField(blank=True, null=True)
    location = models.CharField(max_length=500, blank=True, null=True)
    additional_details = models.TextField(blank=True, null=True)
    
    # Report metadata
    status = models.CharField(
        max_length=50,
        choices=[
            ('PENDING', 'Pending Review'),
            ('INVESTIGATING', 'Under Investigation'),
            ('VERIFIED', 'Verified Counterfeit'),
            ('RESOLVED', 'Resolved'),
            ('DISMISSED', 'Dismissed'),
        ],
        default='PENDING'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # DRAP admin who reviewed
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )
    review_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_id']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Report #{self.id} - {self.batch_id} by {self.reporter_name}"
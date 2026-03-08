# userauth/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# -----------------------------
# Custom User Manager
# -----------------------------
class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email=None, password=None, role="customer", phone=None, **extra_fields):
        if not username:
            raise ValueError("The Username must be set")
        email = self.normalize_email(email)
        role = role.lower()  # Ensure lowercase to match ROLE_CHOICES
        user = self.model(username=username, email=email, role=role, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """
        Create a DRAP admin by default for superuser
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        role = 'drap'
        return self.create_user(username, email, password, role=role, **extra_fields)


# -----------------------------
# Custom User Model
# -----------------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('drap', 'DRAP Admin'),
        ('manufacturer', 'Manufacturer'),
        ('distributor', 'Distributor'),
        ('warehouse', 'Warehouse'),
        ('wholesaler', 'Wholesaler'),
        ('shopkeeper', 'Shopkeeper'),
        ('customer', 'Customer'),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='customer')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"

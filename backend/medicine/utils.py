# medicine/utils.py - FIXED VERSION

import qrcode
import os
from django.conf import settings
from django.core.files.base import ContentFile
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

def get_role(user):
    """
    Get user role - handles both CustomUser.role and UserRole model
    Returns uppercase role name
    """
    try:
        # Import here to avoid circular imports
        from .models import UserRole
        
        # Try CustomUser.role first
        if hasattr(user, 'role') and user.role:
            return user.role.upper()
        
        # Try UserRole model
        try:
            user_role = UserRole.objects.get(user=user)
            return user_role.role.upper()
        except UserRole.DoesNotExist:
            pass
        
        # Default to checking username patterns
        username_lower = user.username.lower()
        if 'manufacturer' in username_lower:
            return 'MANUFACTURER'
        elif 'distributor' in username_lower:
            return 'DISTRIBUTOR'
        elif 'warehouse' in username_lower:
            return 'WAREHOUSE'
        elif 'wholesaler' in username_lower:
            return 'WHOLESALER'
        elif 'shopkeeper' in username_lower:
            return 'SHOPKEEPER'
        elif 'drap' in username_lower or 'admin' in username_lower:
            return 'DRAP_ADMIN'
        
        logger.warning(f"Could not determine role for user: {user.username}")
        return 'UNKNOWN'
    except Exception as e:
        logger.error(f"Error getting user role: {str(e)}")
        return 'UNKNOWN'

def generate_qr_for_batch(batch, base_url):
    """
    Generate QR code for a batch that links to verification page
    """
    try:
        # Create verification URL
        verification_url = f"{base_url}/verify/{batch.batch_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Save to batch
        filename = f"qr_{batch.batch_id}.png"
        batch.qr_code.save(filename, ContentFile(buffer.read()), save=True)
        
        logger.info(f"✅ QR code generated for batch: {batch.batch_id}")
        return True
    except Exception as e:
        logger.error(f"❌ QR code generation failed for {batch.batch_id}: {str(e)}")
        return False
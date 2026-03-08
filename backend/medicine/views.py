# medicine/views.py - COMPLETE FIXED VERSION
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status as http_status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum, Q , F , Count
from django.http import HttpResponse
import csv
from django.db import models
from datetime import date, timedelta
import logging
from django.utils import timezone
from .models import MedicineBatch, TransferRecord , Inventory , SuspiciousMedicineReport
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from .serializers import MedicineBatchSerializer, TransferRecordSerializer
from blockchain.services import get_last_block, create_genesis_block, create_transfer_block, validate_chain
from blockchain.models import BlockChainBlock
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

VALID_FLOW = {
    "MANUFACTURER": ["DISTRIBUTOR"],
    "DISTRIBUTOR": ["WAREHOUSE"],
    "WAREHOUSE": ["WHOLESALER"],
    "WHOLESALER": ["SHOPKEEPER"],
    "SHOPKEEPER": ["CUSTOMER"],
}

LOW_STOCK_THRESHOLD = 50 

# ========================================
# ✅ SIMPLE ROLE DETECTION
# ========================================
def get_role(user):
    """Get user role - simple and reliable"""
    try:
        # Check if user has role attribute
        if hasattr(user, 'role') and user.role:
            role = str(user.role).upper()
            logger.info(f"✅ User {user.username} has role: {role}")
            return role
        
        # Check username patterns
        username = user.username.lower()
        if 'manufacturer' in username:
            return 'MANUFACTURER'
        elif 'distributor' in username:
            return 'DISTRIBUTOR'
        elif 'warehouse' in username:
            return 'WAREHOUSE'
        elif 'wholesaler' in username:
            return 'WHOLESALER'
        elif 'shopkeeper' in username:
            return 'SHOPKEEPER'
        elif 'drap' in username or 'admin' in username:
            return 'DRAP_ADMIN'
        
        logger.warning(f"⚠️ Could not determine role for {user.username}")
        return 'UNKNOWN'
    except Exception as e:
        logger.error(f"❌ Error getting role: {str(e)}")
        return 'UNKNOWN'

# ========================================
# LOGIN
# ========================================
@api_view(["POST"])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"detail": "Username and password required."}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials."}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    role = get_role(user)

    return Response({
        "success": True,
        "token": token.key,
        "user_id": user.id,
        "role": role,
        "username": user.username
    })

# ========================================
# ✅ FIXED: MANUFACTURER DASHBOARD (SIMPLIFIED)
# ========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_manufacturer_dashboard(request):
    """
    Manufacturer Dashboard API
    Returns:
    - Total batches
    - Total manufactured
    - Remaining with manufacturer
    - Total distributed
    - All batch details with QR, expiry, status, low stock, distribution %
    """
    try:
        user = request.user
        role = get_role(user)
        
        if role != "MANUFACTURER":
            return Response({"detail": f"Access denied. Role: {role}"}, status=403)

        # Fetch all batches created by this manufacturer
        batches = MedicineBatch.objects.filter(manufacturer=user)
        
        today = date.today()
        alert_threshold = today + timedelta(days=30)

        batch_data = []

        for batch in batches:
            # Manufacturer inventory for this batch
            try:
                inventory = Inventory.objects.get(user=user, batch=batch)
                remaining_qty = inventory.quantity
            except Inventory.DoesNotExist:
                remaining_qty = 0

            # Expiry status
            expiry_status = "UNKNOWN"
            if batch.expiry_date:
                if batch.expiry_date <= today:
                    expiry_status = "EXPIRED"
                elif batch.expiry_date <= alert_threshold:
                    expiry_status = "EXPIRING_SOON"
                else:
                    expiry_status = "SAFE"

            # Low stock check
            low_stock = remaining_qty <= LOW_STOCK_THRESHOLD

            # QR code URL
            qr_url = None
            if batch.qr_code:
                try:
                    qr_url = request.build_absolute_uri(batch.qr_code.url)
                except:
                    pass

            # Total distributed for this batch
            total_distributed = TransferRecord.objects.filter(
                sender=user,
                batch=batch,
                status="CONFIRMED"
            ).aggregate(Sum("quantity"))["quantity__sum"] or 0

            # Batch status
            if remaining_qty == 0:
                batch_status = "EXHAUSTED"
            elif expiry_status == "EXPIRED":
                batch_status = "EXPIRED"
            else:
                batch_status = "ACTIVE"

            # Append batch info
            batch_data.append({
    "batch_id": batch.batch_id,
    "name": batch.name,

    # ✅ OLD fields (ViewBatches.jsx ke liye)
    "quantity": batch.quantity,
    "remaining_quantity": remaining_qty,

    # ✅ NEW fields (DashboardHome.jsx ke liye)
    "total_manufactured": batch.quantity,
    "remaining_with_me": remaining_qty,

    "total_distributed": total_distributed,
    "qr_code_url": qr_url,
    "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
    "expiry_status": expiry_status,
    "batch_status": batch_status,
    "low_stock": low_stock
})


        # Totals
        total_manufactured = sum(b["total_manufactured"] for b in batch_data)
        total_remaining = sum(b["remaining_with_me"] for b in batch_data)
        total_transferred = TransferRecord.objects.filter(
            sender=user,
            status="CONFIRMED"
        ).aggregate(Sum("quantity"))["quantity__sum"] or 0

        # Response
        return Response({
            "total_batches": len(batch_data),
            "total_manufactured": total_manufactured,
            "remaining_with_me": total_remaining,
            "total_transferred": total_transferred,
            "batches": batch_data
        })

    except Exception as e:
        logger.error(f"Manufacturer dashboard error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_view_batches(request):
    try:
        user = request.user
        role = get_role(user)

        logger.info(f"📦 View batches: {user.username} ({role})")

        # ===============================
        # ROLE BASED BATCH VISIBILITY
        # ===============================

        if role == "MANUFACTURER":
            batches = MedicineBatch.objects.filter(manufacturer=user)

        elif role in ["DISTRIBUTOR", "WHOLESALER", "PHARMACY"]:
            batches = MedicineBatch.objects.filter(current_holder=user)

        else:
            return Response(
                {"detail": f"Role {role} not allowed"},
                status=403
            )

        batch_data = []

        for batch in batches:
            # Remaining quantity (inventory based)
            try:
                inventory = Inventory.objects.get(user=user, batch=batch)
                remaining_qty = inventory.quantity
            except Inventory.DoesNotExist:
                remaining_qty = 0

            qr_url = None
            if batch.qr_code:
                try:
                    qr_url = request.build_absolute_uri(batch.qr_code.url)
                except:
                    pass

            batch_data.append({
                "id": batch.id,
                "batch_id": batch.batch_id,
                "name": batch.name,
                "quantity": batch.quantity,
                "remaining_quantity": remaining_qty,
                "batch_status": batch.batch_status,
                "qr_code_url": qr_url,
            })

        return Response({"batches": batch_data}, status=200)

    except Exception as e:
        logger.error(f"❌ api_view_batches error: {str(e)}")
        return Response({"detail": "Server error"}, status=500)

# ========================================
# ✅ MANUFACTURER NOTIFICATIONS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_manufacturer_notifications(request):
    try:
        user = request.user
        if get_role(user) != "MANUFACTURER":
            return Response({"detail": "Access denied."}, status=403)

        notifications = []
        today = date.today()
        
        # 1. LOW STOCK ALERTS (manufacturer's own inventory)
        try:
            inventory_items = Inventory.objects.filter(
                user=user,
                quantity__lte=LOW_STOCK_THRESHOLD
            ).select_related('batch')
            
            for inv in inventory_items:
                notifications.append({
                    "id": f"low_stock_{inv.batch.id}",
                    "type": "LOW_STOCK",
                    "priority": "HIGH",
                    "message": f"⚠️ Low Stock: {inv.batch.name} - You have only {inv.quantity} units left",
                    "batch_id": inv.batch.batch_id,
                    "remaining_quantity": inv.quantity,
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Error checking low stock: {str(e)}")

        # 2. EXPIRING SOON
        try:
            expiring_threshold = today + timedelta(days=30)
            expiring_batches = MedicineBatch.objects.filter(
                manufacturer=user,
                expiry_date__lte=expiring_threshold,
                expiry_date__gte=today
            )
            
            for batch in expiring_batches:
                days_until_expiry = (batch.expiry_date - today).days
                notifications.append({
                    "id": f"expiring_{batch.id}",
                    "type": "EXPIRING_SOON",
                    "priority": "MEDIUM",
                    "message": f"⏰ {batch.name} expires in {days_until_expiry} days",
                    "batch_id": batch.batch_id,
                    "expiry_date": batch.expiry_date.isoformat(),
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Error checking expiring batches: {str(e)}")

        # 3. PENDING OUTGOING TRANSFERS
        try:
            pending_transfers = TransferRecord.objects.filter(
                sender=user,
                status="PENDING"
            ).select_related('batch', 'receiver').order_by('-timestamp')[:10]
            
            for transfer in pending_transfers:
                notifications.append({
                    "id": f"pending_{transfer.id}",
                    "type": "PENDING_TRANSFER",
                    "priority": "INFO",
                    "message": f"📤 Transfer pending: {transfer.quantity} units of {transfer.batch.name} to {transfer.receiver.username}",
                    "batch_id": transfer.batch.batch_id,
                    "transfer_id": transfer.id,
                    "timestamp": transfer.timestamp.isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Error checking transfers: {str(e)}")

        # Sort by priority
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        notifications.sort(key=lambda x: (priority_order.get(x["priority"], 5), x["timestamp"]), reverse=True)

        return Response({
            "count": len(notifications),
            "unread_count": len(notifications),
            "notifications": notifications[:50]
        })

    except Exception as e:
        logger.error(f"Notifications error: {str(e)}")
        return Response({"detail": str(e)}, status=500)




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_manufacturer_transfers(request):
    """
    Returns all transfer records sent by the logged-in manufacturer.
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "MANUFACTURER":
            return Response({"detail": f"Access denied. Role: {role}"}, status=403)

        # Only transfers where this manufacturer is the sender
        transfers = TransferRecord.objects.filter(sender=user).select_related(
            "batch", "receiver"
        ).order_by("-timestamp")

        transfer_history = []

        for t in transfers:
            transfer_history.append({
                "transfer_id": t.id,
                "tx_id": t.tx_id,
                "batch_id": t.batch.batch_id if t.batch else "",
                "batch_name": t.batch.name if t.batch else "",
                "quantity": t.quantity,
                "status": t.status,
                "sender_username": user.username,  # added explicitly
                "receiver_id": t.receiver.id if t.receiver else None,
                "receiver_username": t.receiver.username if t.receiver else "Customer",
                "receiver_role": get_role(t.receiver) if t.receiver else "CUSTOMER",
                "timestamp": t.timestamp.isoformat() if t.timestamp else None
            })

        return Response({
            "count": len(transfer_history),
            "transfers": transfer_history
        })

    except Exception as e:
        logger.error(f"❌ Manufacturer transfer history error: {str(e)}")
        return Response({"detail": str(e)}, status=500)


# ========================================
# CREATE BATCH
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_create_batch(request):
    try:
        user = request.user
        role = get_role(user)

        if role != "MANUFACTURER":
            return Response({"detail": "Only Manufacturer can create batches."}, status=403)

        data = request.data.copy()
        data["manufacturer"] = user.id

        serializer = MedicineBatchSerializer(data=data, context={"request": request})
        if serializer.is_valid():
            batch = serializer.save()
            
            # ✅ Create initial inventory for manufacturer
            Inventory.objects.create(
                user=user,
                batch=batch,
                quantity=batch.quantity
            )
            
            # Generate QR code
            from .utils import generate_qr_for_batch
            base_url = getattr(settings, "BASE_URL", "http://localhost:8000")
            try:
                generate_qr_for_batch(batch, base_url)
            except Exception as e:
                logger.error(f"QR generation failed: {str(e)}")

            # Create genesis block
            existing_block = get_last_block(batch.batch_id)
            if not existing_block:
                try:
                    create_genesis_block(
                        batch_id=batch.batch_id,
                        transaction_data={
                            "batch_id": batch.batch_id,
                            "medicine_name": batch.name,
                            "manufacturer": user.username,
                            "manufacture_date": str(batch.manufacture_date),
                            "expiry_date": str(batch.expiry_date),
                            "quantity": batch.quantity,
                            "action": "GENESIS"
                        },
                        created_by=user
                    )
                except Exception as e:
                    logger.error(f"Genesis block failed: {str(e)}")

            qr_url = None
            if batch.qr_code:
                try:
                    qr_url = request.build_absolute_uri(batch.qr_code.url)
                except:
                    pass

            return Response({
                "success": True,
                "message": "Batch created successfully",
                "batch_id": batch.batch_id,
                "qr_code_url": qr_url
            }, status=201)

        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(f"Error creating batch: {str(e)}")
        return Response({"detail": str(e)}, status=500)
# ========================================
# EXPORT CSV
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_export_batches_csv(request):
    try:
        user = request.user
        role = get_role(user)
        
        logger.info(f"📥 CSV export request from: {user.username} (Role: {role})")
        
        if role != "MANUFACTURER":
            return Response({"detail": "Only Manufacturer can export."}, status=403)

        batches = MedicineBatch.objects.filter(manufacturer=user)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="batches_export.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Batch ID", "Medicine Name", "Manufacture Date", "Expiry Date",
            "Total Quantity", "Remaining Quantity", "Current Holder", "Status", "QR Code URL"
        ])

        today = date.today()
        
        for b in batches:
            if b.expiry_date:
                if b.expiry_date <= today:
                    status_val = "EXPIRED"
                elif b.expiry_date <= today + timedelta(days=30):
                    status_val = "EXPIRING SOON"
                else:
                    status_val = "SAFE"
            else:
                status_val = "UNKNOWN"
            
            qr_url = "N/A"
            if b.qr_code:
                try:
                    qr_url = request.build_absolute_uri(b.qr_code.url)
                except:
                    pass
            
            writer.writerow([
                b.batch_id,
                b.name,
                b.manufacture_date.strftime("%Y-%m-%d") if b.manufacture_date else "N/A",
                b.expiry_date.strftime("%Y-%m-%d") if b.expiry_date else "N/A",
                b.quantity,
                b.remaining_quantity,
                b.current_holder.username if b.current_holder else "N/A",
                status_val,
                qr_url,
            ])

        logger.info(f"✅ CSV exported successfully for {user.username}")
        return response

    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

# ========================================
# 🔐 SECURE TRANSFER BATCH
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_transfer_batch(request):
    """Transfer batch with ENHANCED SECURITY"""
    user = request.user
    sender_role = get_role(user)

    if sender_role == "DRAP":
        return Response({"detail": "DRAP Admin cannot transfer batches."}, status=403)

    batch_id = request.data.get("batch_id")
    to_user_id = request.data.get("to_user_id")
    quantity = request.data.get("quantity")

    if not all([batch_id, to_user_id, quantity]):
        return Response({"detail": "batch_id, to_user_id, quantity required."}, status=400)

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({"detail": "Quantity must be > 0."}, status=400)
    except ValueError:
        return Response({"detail": "Quantity must be integer."}, status=400)

    batch = get_object_or_404(MedicineBatch, batch_id=batch_id)
    receiver_user = get_object_or_404(User, id=to_user_id)
    receiver_role = get_role(receiver_user)

    # 🔐 SECURITY CHECK 1: Batch Status
    if batch.batch_status != 'ACTIVE':
        return Response({
            "detail": f"Batch is {batch.batch_status}. Cannot transfer."
        }, status=400)

    # 🔐 SECURITY CHECK 2: Total Distributed Limit
    if batch.total_distributed + quantity > batch.quantity:
        return Response({
            "detail": f"Security Alert: Cannot distribute more than manufactured quantity. "
                     f"Manufactured: {batch.quantity}, Already distributed: {batch.total_distributed}, "
                     f"Trying to send: {quantity}"
        }, status=400)

    # Check allowed flow
    allowed_next_roles = VALID_FLOW.get(sender_role, [])
    if receiver_role not in allowed_next_roles:
        return Response({
            "detail": f"{sender_role} can only transfer to {allowed_next_roles}"
        }, status=400)

    # ✅ Check sender's inventory
    try:
        sender_inventory = Inventory.objects.get(user=user, batch=batch)
    except Inventory.DoesNotExist:
        return Response({"detail": "Batch not in your inventory"}, status=400)

    if sender_inventory.quantity < quantity:
        return Response({
            "detail": f"Insufficient quantity. You have {sender_inventory.quantity} units"
        }, status=400)

    with transaction.atomic():
        # Create transfer record
        transfer_record = TransferRecord.objects.create(
            batch=batch,
            sender=user,
            receiver=receiver_user,
            quantity=quantity,
            status="PENDING"
        )

        # ✅ Reduce sender's inventory
        sender_inventory.quantity = F("quantity") - quantity
        sender_inventory.save(update_fields=["quantity"])
        sender_inventory.refresh_from_db()

        # 🔐 UPDATE TOTAL DISTRIBUTED (for manufacturer tracking)
        batch.total_distributed = F("total_distributed") + quantity
        batch.save(update_fields=["total_distributed"])
        batch.refresh_from_db()

        # Create blockchain entry
        create_transfer_block(
            batch_id=batch.batch_id,
            transaction_data={
                "batch_id": batch.batch_id,
                "from_user": user.username,
                "to_user": receiver_user.username,
                "quantity": quantity,
                "transfer_id": transfer_record.id,
                "action": "TRANSFER",
                "total_distributed": batch.total_distributed,  # 🔐 Track in blockchain
            },
            created_by=user
        )

    return Response({
        "success": True,
        "message": "Transfer created successfully. Receiver must confirm.",
        "transfer_id": transfer_record.id,
        "remaining_in_inventory": sender_inventory.quantity,
        "total_distributed": batch.total_distributed,  # 🔐 Show security info
        "batch_capacity": batch.quantity
    })


# # ========================================
# # 🔐 SECURE BATCH VERIFICATION (QR SCAN)
# # ========================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def api_verify_batch(request, batch_id):
#     """Enhanced verification with QR expiry check"""
#     try:
#         batch = MedicineBatch.objects.select_related(
#             'manufacturer', 
#             'current_holder'
#         ).get(batch_id=batch_id)
        
#         # 🔐 SECURITY CHECK: QR Validity
#         if not batch.is_qr_valid():
#             return Response({
#                 "valid": False,
#                 "authentic": False,
#                 "status": batch.batch_status,
#                 "message": f"⚠️ This QR code is {batch.batch_status}. "
#                           f"{'Contact DRAP immediately if you purchased this medicine.' if batch.batch_status == 'RECALLED' else 'Batch has been exhausted or expired.'}"
#             }, status=200)  # Return 200 to show message properly
        
#         # Validate blockchain
#         chain_valid, chain_message = validate_chain(batch_id)
        
#         # 🔐 SECURITY CHECK: Blockchain Integrity
#         if not chain_valid:
#             return Response({
#                 "valid": False,
#                 "authentic": False,
#                 "message": "⚠️ SECURITY ALERT: Blockchain validation failed. This may be counterfeit.",
#                 "blockchain_issue": chain_message
#             }, status=200)
        
#         # Get blockchain trail
#         blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by('index')
        
#         blockchain_trail = []
#         for block in blockchain_blocks:
#             blockchain_trail.append({
#                 "index": block.index,
#                 "timestamp": block.timestamp.isoformat(),
#                 "hash": block.hash,
#                 "previous_hash": block.previous_hash,
#                 "transaction_data": block.transaction_data,
#                 "created_by": block.created_by.username if block.created_by else None
#             })
        
#         # Get complete transfer history with roles
#         transfers = TransferRecord.objects.filter(
#             batch=batch
#         ).select_related('sender', 'receiver').order_by('timestamp')
        
#         transfer_trail = []
#         for transfer in transfers:
#             transfer_trail.append({
#                 "transfer_id": transfer.id,
#                 "from_user": transfer.sender.username,
#                 "from_role": get_role(transfer.sender),
#                 "to_user": transfer.receiver.username if transfer.receiver else "Customer",
#                 "to_role": get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
#                 "status": transfer.status,
#                 "timestamp": transfer.timestamp.isoformat(),
#                 "tx_id": transfer.tx_id
#             })
        
#         # QR code URL
#         qr_url = None
#         if batch.qr_code:
#             try:
#                 qr_url = request.build_absolute_uri(batch.qr_code.url)
#             except:
#                 pass

#         # 🔐 SECURITY STATUS
#         security_status = {
#             "batch_status": batch.batch_status,
#             "is_authentic": chain_valid,
#             "blockchain_verified": chain_valid,
#             "total_manufactured": batch.quantity,
#             "total_distributed": batch.total_distributed,
#             "distribution_complete": batch.total_distributed >= batch.quantity,
#         }

#         return Response({
#             "valid": True,
#             "authentic": chain_valid,
#             "message": "✅ Medicine is AUTHENTIC" if chain_valid else "⚠️ Verification failed",
#             "security": security_status,  # 🔐 Security details
#             "batch": {
#                 "batch_id": batch.batch_id,
#                 "name": batch.name,
#                 "manufacturer": {
#                     "username": batch.manufacturer.username,
#                     "role": "MANUFACTURER"
#                 },
#                 "current_holder": {
#                     "username": batch.current_holder.username if batch.current_holder else None,
#                     "role": get_role(batch.current_holder) if batch.current_holder else None
#                 },
#                 "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
#                 "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
#                 "qr_code_url": qr_url
#             },
#             "blockchain": {
#                 "is_valid": chain_valid,
#                 "total_blocks": blockchain_blocks.count(),
#                 "trail": blockchain_trail
#             },
#             "supply_chain_trail": transfer_trail,
#             "verified_at": timezone.now().isoformat()
#         })

#     except MedicineBatch.DoesNotExist:
#         return Response({
#             "valid": False,
#             "authentic": False,
#             "error": "⚠️ COUNTERFEIT ALERT: Batch not found in system. This may be a fake medicine.",
#             "batch_id": batch_id,
#             "action": "Report to DRAP immediately"
#         }, status=404)
#     except Exception as e:
#         logger.error(f"Verify batch error: {str(e)}")
#         return Response({"detail": str(e)}, status=500)


# ========================================
# LIST ALL BATCHES
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_list_batches(request):
    try:
        batches = MedicineBatch.objects.all()
        batch_data = []
        
        for batch in batches:
            try:
                qr_url = None
                if batch.qr_code:
                    try:
                        qr_url = request.build_absolute_uri(batch.qr_code.url)
                    except:
                        pass
                
                batch_data.append({
                    "batch_id": batch.batch_id,
                    "name": batch.name,
                    "quantity": batch.quantity,
                    "remaining_quantity": batch.remaining_quantity,
                    "qr_code_url": qr_url
                })
            except:
                continue
                
        return Response({"batches": batch_data})
    except Exception as e:
        logger.error(f"❌ List batches error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

# ========================================
# BATCH DETAIL
# ========================================
@api_view(["GET"])
@permission_classes([AllowAny])
def api_batch_detail(request, batch_id):
    try:
        # Fetch the batch
        batch = MedicineBatch.objects.select_related(
            'manufacturer', 
            'current_holder'
        ).get(batch_id=batch_id)
        
        # Fetch blockchain chain for this batch
        blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by('index')
        chain_valid, chain_message = validate_chain(batch_id)

        blockchain_trail = []
        for block in blockchain_blocks:
            blockchain_trail.append({
                "index": block.index,
                "timestamp": block.timestamp.isoformat() if block.timestamp else None,
                "hash": block.hash,
                "previous_hash": block.previous_hash,
                "transaction_data": block.transaction_data,
                "created_by": block.created_by.username if block.created_by else None,
                "is_valid": True
            })

        # Fetch transfer records
        transfers = TransferRecord.objects.filter(
            batch=batch
        ).select_related('sender', 'receiver').order_by('-timestamp')

        transfer_history = []
        for transfer in transfers:
            transfer_history.append({
                "id": transfer.id,
                "tx_id": transfer.tx_id,
                "sender": transfer.sender.username if transfer.sender else None,
                "receiver": transfer.receiver.username if transfer.receiver else None,
                "sender_role": get_role(transfer.sender) if transfer.sender else None,
                "receiver_role": get_role(transfer.receiver) if transfer.receiver else None,
                "quantity": transfer.quantity,
                "timestamp": transfer.timestamp.isoformat() if transfer.timestamp else None
            })

        # QR code URL
        qr_url = None
        if batch.qr_code:
            try:
                qr_url = request.build_absolute_uri(batch.qr_code.url)
            except Exception as e:
                logger.warning(f"QR code URL error for batch {batch.batch_id}: {str(e)}")

        response_data = {
            "batch_id": batch.batch_id,
            "name": batch.name,
            "manufacturer": {
                "id": batch.manufacturer.id if batch.manufacturer else None,
                "username": batch.manufacturer.username if batch.manufacturer else None,
                "role": get_role(batch.manufacturer) if batch.manufacturer else None
            },
            "current_holder": {
                "id": batch.current_holder.id if batch.current_holder else None,
                "username": batch.current_holder.username if batch.current_holder else None,
                "role": get_role(batch.current_holder) if batch.current_holder else None
            } if batch.current_holder else None,
            "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "quantity": batch.quantity,
            "remaining_quantity": batch.remaining_quantity,
            "created_at": batch.created_at.isoformat() if batch.created_at else None,
            "qr_code_url": qr_url,
            "blockchain": {
                "is_valid": chain_valid,
                "message": chain_message,
                "total_blocks": blockchain_blocks.count(),
                "trail": blockchain_trail
            },
            "transfers": {
                "total_count": transfers.count(),
                "history": transfer_history
            }
        }

        return Response(response_data)

    except MedicineBatch.DoesNotExist:
        return Response({"error": "Batch not found", "batch_id": batch_id}, status=404)

    except Exception as e:
        logger.error(f"❌ Batch detail error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

# ========================================
# DISTRIBUTOR - INCOMING BATCHES
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_distributor_incoming(request):
    user = request.user
    if get_role(user) != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    transfers = TransferRecord.objects.filter(
        receiver=user,
        status="PENDING"
    ).select_related("batch", "sender").order_by("-timestamp")

    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "medicine_name": t.batch.name,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "from_role": get_role(t.sender),
            "expiry_date": t.batch.expiry_date.isoformat() if t.batch.expiry_date else None,
            "qr_code_url": request.build_absolute_uri(t.batch.qr_code.url) if t.batch.qr_code else None,
            "status": t.status
        })

    return Response({"count": len(data), "incoming_batches": data})


# ========================================
# DISTRIBUTOR - CONFIRM RECEIVE (FINAL)
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_distributor_confirm_receive(request):
    user = request.user
    role = get_role(user)

    if role != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    transfer_id = request.data.get("transfer_id")
    if not transfer_id:
        return Response({"detail": "transfer_id is required."}, status=400)

    try:
        transfer = TransferRecord.objects.select_related("batch", "sender", "receiver").get(id=transfer_id)
    except TransferRecord.DoesNotExist:
        return Response({"detail": "Transfer not found."}, status=404)

    if transfer.receiver != user:
        return Response({"detail": "This transfer does not belong to you."}, status=403)

    if transfer.status == "CONFIRMED":
        return Response({
            "success": True,
            "message": "Transfer already confirmed."
        }, status=200)

    if transfer.status != "PENDING":
        return Response({
            "detail": f"Transfer cannot be confirmed (status={transfer.status})."
        }, status=400)

    batch = transfer.batch

    with transaction.atomic():
        # Update transfer status
        transfer.status = "CONFIRMED"
        transfer.save(update_fields=["status"])

        # ✅ Add to receiver's inventory
        inventory, created = Inventory.objects.get_or_create(
            user=user,
            batch=batch,
            defaults={"quantity": 0}
        )
        inventory.quantity = F("quantity") + transfer.quantity
        inventory.save(update_fields=["quantity"])
        inventory.refresh_from_db()

        # Update current holder
        batch.current_holder = user
        batch.save(update_fields=["current_holder"])

        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "RECEIVE_CONFIRMATION",
                    "transfer_id": transfer.id,
                    "receiver": user.username,
                    "quantity": transfer.quantity
                },
                created_by=user
            )
        except Exception as e:
            logger.warning(f"Blockchain skipped: {str(e)}")

    return Response({
        "success": True,
        "message": "Batch successfully received.",
        "batch_id": batch.batch_id,
        "received_quantity": transfer.quantity,
        "total_in_inventory": inventory.quantity
    }, status=200)

# ========================================
# ✅ DISTRIBUTOR INVENTORY - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_distributor_inventory(request):
    user = request.user
    if get_role(user) != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    today = date.today()
    alert_threshold = today + timedelta(days=30)

    # ✅ Get distributor's inventory
    inventory_items = Inventory.objects.filter(
        user=user,
        quantity__gt=0
    ).select_related('batch', 'batch__manufacturer')

    inventory = []
    total_received = 0
    total_remaining = 0

    for inv in inventory_items:
        batch = inv.batch
        
        # Calculate how much this distributor received in total
        received_qty = TransferRecord.objects.filter(
            receiver=user,
            batch=batch,
            status="CONFIRMED"
        ).aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        total_received += received_qty
        total_remaining += inv.quantity

        # Expiry status
        if batch.expiry_date:
            if batch.expiry_date <= today:
                expiry_status = "EXPIRED"
            elif batch.expiry_date <= alert_threshold:
                expiry_status = "NEAR_EXPIRY"
            else:
                expiry_status = "SAFE"
        else:
            expiry_status = "UNKNOWN"

        # Low stock
        low_stock = inv.quantity <= LOW_STOCK_THRESHOLD

        qr_code_url = None
        if batch.qr_code:
            try:
                qr_code_url = request.build_absolute_uri(batch.qr_code.url)
            except:
                pass

        inventory.append({
            "batch_id": batch.batch_id,
            "medicine_name": batch.name,
            "manufacturer": batch.manufacturer.username if batch.manufacturer else "N/A",
            "total_received": received_qty,
            "remaining_quantity": inv.quantity,
            "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "expiry_status": expiry_status,
            "low_stock": low_stock,
            "qr_code_url": qr_code_url
        })

    return Response({
        "total_batches": len(inventory),
        "total_received": total_received,
        "total_remaining": total_remaining,
        "inventory": inventory
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_distributor_notifications(request):
    try:
        user = request.user
        if get_role(user) != "DISTRIBUTOR":
            return Response({"detail": "Access denied."}, status=403)

        notifications = []
        today = date.today()

        # =====================================
        # 1. LOW STOCK ALERTS (Distributor Inventory)
        # =====================================
        try:
            inventory_items = Inventory.objects.filter(
                user=user,
                quantity__lte=LOW_STOCK_THRESHOLD,
                quantity__gt=0
            ).select_related('batch')

            for inv in inventory_items:
                notifications.append({
                    "id": f"low_stock_{inv.batch.id}",
                    "type": "LOW_STOCK",
                    "priority": "HIGH",
                    "message": f"⚠️ Low Stock: {inv.batch.name} - Only {inv.quantity} units remaining",
                    "batch_id": inv.batch.batch_id,
                    "remaining_quantity": inv.quantity,
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Distributor low stock error: {str(e)}")

        # =====================================
        # 2. EXPIRING SOON (Distributor-held batches)
        # =====================================
        try:
            expiring_threshold = today + timedelta(days=30)
            expiring_batches = Inventory.objects.filter(
                user=user,
                batch__expiry_date__lte=expiring_threshold,
                batch__expiry_date__gte=today,
                batch__expiry_date__isnull=False
            ).select_related('batch')

            for inv in expiring_batches:
                days_left = (inv.batch.expiry_date - today).days
                notifications.append({
                    "id": f"expiring_{inv.batch.id}",
                    "type": "EXPIRING_SOON",
                    "priority": "MEDIUM",
                    "message": f"⏰ {inv.batch.name} expires in {days_left} days",
                    "batch_id": inv.batch.batch_id,
                    "expiry_date": inv.batch.expiry_date.isoformat(),
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Distributor expiry error: {str(e)}")

        # =====================================
        # 3. INCOMING TRANSFERS (Manufacturer → Distributor)
        # =====================================
        try:
            incoming_transfers = TransferRecord.objects.filter(
                receiver=user,
                status__in=["PENDING", "APPROVED"]
            ).select_related('batch', 'sender').order_by('-timestamp')[:10]

            for transfer in incoming_transfers:
                notifications.append({
                    "id": f"incoming_{transfer.id}",
                    "type": "INCOMING_TRANSFER",
                    "priority": "INFO",
                    "message": f"📥 Incoming transfer: {transfer.quantity} units of {transfer.batch.name} from {transfer.sender.username}",
                    "batch_id": transfer.batch.batch_id,
                    "transfer_id": transfer.id,
                    "timestamp": transfer.timestamp.isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Distributor incoming transfer error: {str(e)}")

        # =====================================
        # 4. OUTGOING TRANSFERS (Distributor → Retailer)
        # =====================================
        try:
            outgoing_transfers = TransferRecord.objects.filter(
                sender=user,
                status="PENDING"
            ).select_related('batch', 'receiver').order_by('-timestamp')[:10]

            for transfer in outgoing_transfers:
                notifications.append({
                    "id": f"outgoing_{transfer.id}",
                    "type": "PENDING_TRANSFER",
                    "priority": "LOW",
                    "message": f"📤 Transfer pending: {transfer.quantity} units of {transfer.batch.name} to {transfer.receiver.username}",
                    "batch_id": transfer.batch.batch_id,
                    "transfer_id": transfer.id,
                    "timestamp": transfer.timestamp.isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Distributor outgoing transfer error: {str(e)}")

        # =====================================
        # SORT BY PRIORITY + TIME
        # =====================================
        priority_order = {
            "CRITICAL": 0,
            "HIGH": 1,
            "MEDIUM": 2,
            "LOW": 3,
            "INFO": 4
        }

        notifications.sort(
            key=lambda x: (
                priority_order.get(x["priority"], 5),
                x["timestamp"]
            ),
            reverse=True
        )

        return Response({
            "count": len(notifications),
            "unread_count": len(notifications),
            "notifications": notifications[:50]
        })

    except Exception as e:
        logger.error(f"Distributor notification error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

# DISTRIBUTOR REPORT
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_distributor_report(request):
    user = request.user
    role = get_role(user)

    if role != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    total_batches = MedicineBatch.objects.filter(current_holder=user).count()
    expired = MedicineBatch.objects.filter(
        current_holder=user,
        expiry_date__lt=date.today()
    ).count()

    return Response({
        "total_batches": total_batches,
        "expired_batches": expired
    })


# ========================================
# GET WAREHOUSE USERS (for transfer dropdown)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_get_warehouse_users(request):
    user = request.user
    role = get_role(user)

    if role != "DISTRIBUTOR":
        return Response(
            {"detail": "Only Distributor allowed."},
            status=403
        )

    warehouses = User.objects.filter(
        profile__role__iexact="WAREHOUSE"
    ).values("id", "username")

    return Response({
        "count": warehouses.count(),
        "warehouse_users": list(warehouses)
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_distributor_transfer_to_warehouse(request):
    user = request.user
    if get_role(user) != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    batch_id = request.data.get("batch_id")
    receiver_id = request.data.get("receiver_id")
    quantity = request.data.get("quantity")

    if not all([batch_id, receiver_id, quantity]):
        return Response({"detail": "Missing fields"}, status=400)

    try:
        quantity = int(quantity)
        if quantity <= 0:
            raise ValueError
    except:
        return Response({"detail": "Invalid quantity"}, status=400)

    batch = get_object_or_404(MedicineBatch, batch_id=batch_id)
    receiver = get_object_or_404(User, id=receiver_id)

    # 🔥🔥🔥 CORRECT INVENTORY CHECK
    inventory = Inventory.objects.filter(
        user=user,
        batch=batch
    ).first()

    if not inventory:
        return Response({"detail": "Batch not found in distributor inventory"}, status=400)

    if inventory.quantity < quantity:
        return Response({
            "detail": f"Insufficient stock. Available: {inventory.quantity}"
        }, status=400)

    with transaction.atomic():
        transfer = TransferRecord.objects.create(
            batch=batch,
            sender=user,
            receiver=receiver,
            quantity=quantity,
            status="PENDING"
        )

        # 🔥 Deduct from distributor inventory
        inventory.quantity = F("quantity") - quantity
        inventory.save(update_fields=["quantity"])

    return Response({
        "success": True,
        "transfer_id": transfer.id,
        "message": "Transfer to warehouse initiated successfully"
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_distributor_transfer_history(request):
    user = request.user
    if get_role(user) != "DISTRIBUTOR":
        return Response({"detail": "Only Distributor allowed."}, status=403)

    transfers = TransferRecord.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).select_related("batch").order_by("-timestamp")

    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "to_user": t.receiver.username,
            "status": t.status,
            "timestamp": t.timestamp.isoformat()
        })

    return Response({"count": len(data), "history": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_warehouse_transfer_history(request):
    user = request.user
    if get_role(user) != "WAREHOUSE":
        return Response({"detail": "Only warehouse allowed."}, status=403)

    transfers = TransferRecord.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).select_related("batch").order_by("-timestamp")

    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "to_user": t.receiver.username,
            "status": t.status,
            "timestamp": t.timestamp.isoformat()
        })

    return Response({"count": len(data), "history": data})




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_wholesaler_transfer_history(request):
    user = request.user
    if get_role(user) != "WHOLESALER":
        return Response({"detail": "Only wholesaler allowed."}, status=403)

    transfers = TransferRecord.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).select_related("batch").order_by("-timestamp")

    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "to_user": t.receiver.username,
            "status": t.status,
            "timestamp": t.timestamp.isoformat()
        })

    return Response({"count": len(data), "history": data})

# @api_view(["GET"])
# @permission_classes([AllowAny])
# def api_verify_medicine_for_customer(request, batch_id):
#     """
#     Public endpoint for customers to verify a medicine batch by batch_id.
#     Returns basic batch info and blockchain verification status.
#     """
#     try:
#         # Try to load the batch (public info)
#         batch = MedicineBatch.objects.select_related("manufacturer", "current_holder").filter(batch_id=batch_id).first()
#         if not batch:
#             return Response({"valid": False, "error": "Batch not found"}, status=404)

#         # Build basic batch info
#         qr_url = None
#         if getattr(batch, "qr_code", None):
#             try:
#                 qr_url = request.build_absolute_uri(batch.qr_code.url)
#             except Exception:
#                 qr_url = None

#         batch_info = {
#             "batch_id": batch.batch_id,
#             "medicine_name": batch.name,
#             "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
#             "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
#             "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
#             "quantity": batch.quantity,
#             "remaining_quantity": batch.remaining_quantity,
#             "current_holder": batch.current_holder.username if batch.current_holder else None,
#             "qr_code_url": qr_url
#         }

#         # Validate blockchain chain for this batch
#         chain_qs = BlockChainBlock.get_chain_for_batch(batch_id)
#         if not chain_qs.exists():
#             return Response({"valid": False, "error": "No blockchain found for this batch", "batch": batch_info}, status=200)

#         # Build a short chain summary (do not expose full internal details if you prefer)
#         chain_summary = []
#         for b in chain_qs.order_by("index"):
#             chain_summary.append({
#                 "index": b.index,
#                 "timestamp": b.timestamp.isoformat(),
#                 "transaction_data": b.transaction_data,
#                 "created_by": b.created_by.username if b.created_by else None
#             })

#         valid, message = validate_chain(batch_id)

#         return Response({
#             "valid": valid,
#             "message": message,
#             "batch": batch_info,
#             "chain_length": chain_qs.count(),
#             "chain": chain_summary
#         })
#     except Exception as e:
#         logger.error(f"api_verify_medicine_for_customer error: {e}")
#         return Response({"detail": str(e)}, status=500)


# ========================================
# DISTRIBUTOR CSV EXPORTS
# ========================================
def export_distributor_incoming_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="distributor_incoming.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "From Manufacturer", "Quantity Received", "Transfer Date", "Blockchain TX ID"])

    transfers = TransferRecord.objects.filter(receiver__profile__role__iexact="DISTRIBUTOR").select_related("batch", "sender")
    for t in transfers:
        writer.writerow([
            t.batch.batch_id,
            t.batch.name,
            t.sender.username if t.sender else "N/A",
            t.quantity,
            t.timestamp.strftime("%Y-%m-%d %H:%M"),
            t.tx_id
        ])
    return response


def export_distributor_outgoing_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="distributor_outgoing.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "To Warehouse", "Quantity Sent", "Transfer Date", "Blockchain TX ID"])

    transfers = TransferRecord.objects.filter(sender__profile__role__iexact="DISTRIBUTOR").select_related("batch", "receiver")
    for t in transfers:
        writer.writerow([
            t.batch.batch_id,
            t.batch.name,
            t.receiver.username if t.receiver else "N/A",
            t.quantity,
            t.timestamp.strftime("%Y-%m-%d %H:%M"),
            t.tx_id
        ])
    return response


def export_distributor_expired_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="distributor_expired.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "Expiry Date", "Remaining Quantity"])

    today = timezone.now().date()
    batches = MedicineBatch.objects.filter(current_holder__profile__role__iexact="DISTRIBUTOR", expiry_date__lt=today)
    for b in batches:
        writer.writerow([b.batch_id, b.name, b.expiry_date, b.remaining_quantity])

    return response


def export_distributor_full_inventory_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="distributor_inventory.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "Manufacturer", "Manufacture Date", "Expiry Date", "Total Quantity", "Remaining Quantity"])

    batches = MedicineBatch.objects.filter(current_holder__profile__role__iexact="DISTRIBUTOR").select_related("manufacturer")
    for b in batches:
        writer.writerow([
            b.batch_id,
            b.name,
            b.manufacturer.username if b.manufacturer else "N/A",
            b.manufacture_date,
            b.expiry_date,
            b.quantity,
            b.remaining_quantity
        ])

    return response


# ========================================
# ✅ WAREHOUSE INCOMING - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_warehouse_incoming(request):
    user = request.user
    role = get_role(user)

    if role != "WAREHOUSE":
        return Response({"detail": "Only Warehouse can access this."}, status=403)

    transfers = TransferRecord.objects.filter(
        receiver=user,
        status="PENDING"
    ).select_related('batch', 'sender').order_by('-timestamp')

    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "medicine_name": t.batch.name,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "from_role": get_role(t.sender),
            "manufacture_date": t.batch.manufacture_date.isoformat() if t.batch.manufacture_date else None,
            "expiry_date": t.batch.expiry_date.isoformat() if t.batch.expiry_date else None,
            "qr_code_url": request.build_absolute_uri(t.batch.qr_code.url) if t.batch.qr_code else None,
            "status": t.status
        })

    return Response({"count": len(data), "incoming_batches": data})
# ========================================
# ✅ WAREHOUSE CONFIRM RECEIVE - FIXED
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_warehouse_confirm_receive(request):
    user = request.user
    if get_role(user) != "WAREHOUSE":
        return Response({"detail": "Only Warehouse allowed."}, status=403)

    transfer_id = request.data.get("transfer_id")
    transfer = get_object_or_404(
        TransferRecord,
        id=transfer_id,
        receiver=user,
        status="PENDING"
    )

    batch = transfer.batch

    with transaction.atomic():
        # Confirm transfer
        transfer.status = "CONFIRMED"
        transfer.save(update_fields=["status"])

        # ✅ Add to warehouse inventory
        inventory, created = Inventory.objects.get_or_create(
            user=user,
            batch=batch,
            defaults={"quantity": 0}
        )
        inventory.quantity = F("quantity") + transfer.quantity
        inventory.save(update_fields=["quantity"])
        inventory.refresh_from_db()

        # Update holder
        batch.current_holder = user
        batch.save(update_fields=["current_holder"])

        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "WAREHOUSE_RECEIVED",
                    "transfer_id": transfer.id,
                    "receiver": user.username,
                    "quantity": transfer.quantity
                },
                created_by=user
            )
        except Exception as e:
            logger.warning(f"Blockchain skipped: {e}")

    return Response({
        "success": True,
        "message": "Transfer confirmed",
        "batch_id": batch.batch_id,
        "received_quantity": transfer.quantity,
        "total_in_inventory": inventory.quantity
    })

# ========================================
# ✅ WAREHOUSE INVENTORY - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_warehouse_inventory(request):
    user = request.user
    role = get_role(user)

    if role != "WAREHOUSE":
        return Response({"detail": "Only Warehouse allowed."}, status=403)

    today = date.today()
    alert_threshold = today + timedelta(days=30)

    # ✅ Get warehouse inventory
    inventory_items = Inventory.objects.filter(
        user=user,
        quantity__gt=0
    ).select_related('batch', 'batch__manufacturer')

    inventory_data = []
    total_received = 0
    total_remaining = 0

    for inv in inventory_items:
        batch = inv.batch
        
        # Calculate total received by warehouse
        received_qty = TransferRecord.objects.filter(
            receiver=user,
            batch=batch,
            status="CONFIRMED"
        ).aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        total_received += received_qty
        total_remaining += inv.quantity

        # Expiry status
        if batch.expiry_date:
            if batch.expiry_date <= today:
                expiry_status = "EXPIRED"
            elif batch.expiry_date <= alert_threshold:
                expiry_status = "NEAR_EXPIRY"
            else:
                expiry_status = "SAFE"
        else:
            expiry_status = "UNKNOWN"

        # Low stock
        low_stock = inv.quantity <= LOW_STOCK_THRESHOLD

        qr_code_url = request.build_absolute_uri(batch.qr_code.url) if batch.qr_code else None

        inventory_data.append({
            "batch_id": batch.batch_id,
            "medicine_name": batch.name,
            "manufacturer": batch.manufacturer.username if batch.manufacturer else "N/A",
            "total_received": received_qty,
            "remaining_quantity": inv.quantity,
            "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "expiry_status": expiry_status,
            "low_stock": low_stock,
            "qr_code_url": qr_code_url
        })

    return Response({
        "total_batches": len(inventory_data),
        "total_received": total_received,
        "total_remaining": total_remaining,
        "inventory": inventory_data
    })
# ========================================
# WAREHOUSE NOTIFICATIONS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_warehouse_notifications(request):
    try:
        user = request.user
        if get_role(user) != "WAREHOUSE":
            return Response({"detail": "Access denied."}, status=403)

        notifications = []
        today = date.today()

        # =====================================
        # 1. INCOMING TRANSFERS (Distributor → Warehouse)
        # =====================================
        try:
            incoming_transfers = TransferRecord.objects.filter(
                receiver=user,
                status__in=["PENDING", "APPROVED"]
            ).select_related("batch", "sender").order_by("-timestamp")[:10]

            for transfer in incoming_transfers:
                notifications.append({
                    "id": f"incoming_{transfer.id}",
                    "type": "INCOMING_TRANSFER",
                    "priority": "HIGH",
                    "message": f"📥 Incoming transfer: {transfer.quantity} units of {transfer.batch.name} from {transfer.sender.username}",
                    "batch_id": transfer.batch.batch_id,
                    "transfer_id": transfer.id,
                    "timestamp": transfer.timestamp.isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Warehouse incoming transfer error: {str(e)}")

        # =====================================
        # 2. LOW STOCK (Warehouse Inventory)
        # =====================================
        try:
            low_stock_items = Inventory.objects.filter(
                user=user,
                quantity__lte=LOW_STOCK_THRESHOLD,
                quantity__gt=0
            ).select_related("batch")

            for inv in low_stock_items:
                notifications.append({
                    "id": f"low_stock_{inv.batch.id}",
                    "type": "LOW_STOCK",
                    "priority": "MEDIUM",
                    "message": f"⚠️ Low Stock: {inv.batch.name} - {inv.quantity} units remaining",
                    "batch_id": inv.batch.batch_id,
                    "remaining_quantity": inv.quantity,
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Warehouse low stock error: {str(e)}")

        # =====================================
        # 3. EXPIRING SOON
        # =====================================
        try:
            expiring_threshold = today + timedelta(days=30)
            expiring_batches = Inventory.objects.filter(
                user=user,
                quantity__gt=0,
                batch__expiry_date__lte=expiring_threshold,
                batch__expiry_date__gte=today,
                batch__expiry_date__isnull=False
            ).select_related("batch")

            for inv in expiring_batches:
                days_left = (inv.batch.expiry_date - today).days
                notifications.append({
                    "id": f"expiring_{inv.batch.id}",
                    "type": "EXPIRING_SOON",
                    "priority": "HIGH",
                    "message": f"⏰ {inv.batch.name} expires in {days_left} days",
                    "batch_id": inv.batch.batch_id,
                    "expiry_date": inv.batch.expiry_date.isoformat(),
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Warehouse expiry error: {str(e)}")

        # =====================================
        # SORT
        # =====================================
        priority_order = {
            "CRITICAL": 0,
            "HIGH": 1,
            "MEDIUM": 2,
            "LOW": 3,
            "INFO": 4
        }

        notifications.sort(
            key=lambda x: (
                priority_order.get(x["priority"], 5),
                x["timestamp"]
            ),
            reverse=True
        )

        return Response({
            "count": len(notifications),
            "unread_count": len(notifications),
            "notifications": notifications[:50]
        })

    except Exception as e:
        logger.error(f"Warehouse notification error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

# ========================================
# ✅ WHOLESALER NOTIFICATIONS - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_wholesaler_notifications(request):
    try:
        user = request.user
        if get_role(user) != "WHOLESALER":
            return Response({"detail": "Access denied."}, status=403)

        notifications = []
        today = date.today()

        # =====================================
        # 1. INCOMING TRANSFERS (Warehouse → Wholesaler)
        # =====================================
        try:
            incoming_transfers = TransferRecord.objects.filter(
                receiver=user,
                status__in=["PENDING", "APPROVED"]
            ).select_related("batch", "sender").order_by("-timestamp")[:10]

            for transfer in incoming_transfers:
                notifications.append({
                    "id": f"incoming_{transfer.id}",
                    "type": "INCOMING_TRANSFER",
                    "priority": "HIGH",
                    "message": f"📦 New stock received: {transfer.quantity} units of {transfer.batch.name} from {transfer.sender.username}",
                    "batch_id": transfer.batch.batch_id,
                    "transfer_id": transfer.id,
                    "timestamp": transfer.timestamp.isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Wholesaler incoming transfer error: {str(e)}")

        # =====================================
        # 2. LOW STOCK
        # =====================================
        try:
            low_stock_items = Inventory.objects.filter(
                user=user,
                quantity__lte=LOW_STOCK_THRESHOLD,
                quantity__gt=0
            ).select_related("batch")

            for inv in low_stock_items:
                notifications.append({
                    "id": f"low_stock_{inv.batch.id}",
                    "type": "LOW_STOCK",
                    "priority": "MEDIUM",
                    "message": f"⚠️ Low Stock: {inv.batch.name} - Only {inv.quantity} units left",
                    "batch_id": inv.batch.batch_id,
                    "remaining_quantity": inv.quantity,
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Wholesaler low stock error: {str(e)}")

        # =====================================
        # 3. EXPIRING SOON
        # =====================================
        try:
            expiring_threshold = today + timedelta(days=30)
            expiring_batches = Inventory.objects.filter(
                user=user,
                quantity__gt=0,
                batch__expiry_date__lte=expiring_threshold,
                batch__expiry_date__gte=today,
                batch__expiry_date__isnull=False
            ).select_related("batch")

            for inv in expiring_batches:
                days_left = (inv.batch.expiry_date - today).days
                notifications.append({
                    "id": f"expiring_{inv.batch.id}",
                    "type": "EXPIRING_SOON",
                    "priority": "HIGH",
                    "message": f"⏰ {inv.batch.name} expires in {days_left} days",
                    "batch_id": inv.batch.batch_id,
                    "expiry_date": inv.batch.expiry_date.isoformat(),
                    "timestamp": timezone.now().isoformat(),
                    "read": False
                })
        except Exception as e:
            logger.error(f"Wholesaler expiry error: {str(e)}")

        # =====================================
        # SORT
        # =====================================
        priority_order = {
            "CRITICAL": 0,
            "HIGH": 1,
            "MEDIUM": 2,
            "LOW": 3,
            "INFO": 4
        }

        notifications.sort(
            key=lambda x: (
                priority_order.get(x["priority"], 5),
                x["timestamp"]
            ),
            reverse=True
        )

        return Response({
            "count": len(notifications),
            "unread_count": len(notifications),
            "notifications": notifications[:50]
        })

    except Exception as e:
        logger.error(f"Wholesaler notification error: {str(e)}")
        return Response({"detail": str(e)}, status=500)


# ========================================
# WAREHOUSE REPORT
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_warehouse_report(request):
    user = request.user
    role = get_role(user)

    if role != "WAREHOUSE":
        return Response({"detail": "Only Warehouse allowed."}, status=403)

    total_batches = MedicineBatch.objects.filter(current_holder=user).count()
    expired = MedicineBatch.objects.filter(
        current_holder=user,
        expiry_date__lt=date.today()
    ).count()

    return Response({
        "total_batches": total_batches,
        "expired_batches": expired
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_wholesaler_report(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    total_batches = MedicineBatch.objects.filter(current_holder=user).count()
    expired = MedicineBatch.objects.filter(
        current_holder=user,
        expiry_date__lt=date.today()
    ).count()

    return Response({
        "total_batches": total_batches,
        "expired_batches": expired
    })

# ========================================
# GET WHOLESALER USERS (for transfer dropdown)
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_get_wholesaler_users(request):
    user = request.user
    role = get_role(user)

    if role != "WAREHOUSE":
        return Response({"detail": "Only Warehouse allowed."}, status=403)

    wholesalers = User.objects.filter(profile__role__iexact="WHOLESALER").values("id", "username")
    return Response({"count": wholesalers.count(), "wholesaler_users": list(wholesalers)})


# ========================================
# WAREHOUSE TRANSFER TO WHOLESALER
# ========================================
# ========================================
# ✅ WAREHOUSE TRANSFER TO WHOLESALER - FIXED
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_warehouse_transfer_to_wholesaler(request):
    user = request.user
    if get_role(user) != "WAREHOUSE":
        return Response({"detail": "Only warehouse allowed."}, status=403)

    batch_id = request.data.get("batch_id")
    receiver_id = request.data.get("receiver_id")
    quantity = request.data.get("quantity")

    if not all([batch_id, receiver_id, quantity]):
        return Response({"detail": "Missing fields"}, status=400)

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({"detail": "Quantity must be > 0"}, status=400)
    except ValueError:
        return Response({"detail": "Invalid quantity"}, status=400)

    batch = get_object_or_404(MedicineBatch, batch_id=batch_id)
    receiver = get_object_or_404(User, id=receiver_id)

    # ✅ Check warehouse inventory
    try:
        warehouse_inventory = Inventory.objects.get(user=user, batch=batch)
    except Inventory.DoesNotExist:
        return Response({"detail": "Batch not in your inventory"}, status=400)

    if warehouse_inventory.quantity < quantity:
        return Response({
            "detail": f"Insufficient quantity. You have {warehouse_inventory.quantity} units"
        }, status=400)

    with transaction.atomic():
        # Create transfer
        transfer = TransferRecord.objects.create(
            batch=batch,
            sender=user,
            receiver=receiver,
            quantity=quantity,
            status="PENDING"
        )

        # ✅ Reduce warehouse inventory
        warehouse_inventory.quantity = F("quantity") - quantity
        warehouse_inventory.save(update_fields=["quantity"])
        warehouse_inventory.refresh_from_db()

    

    return Response({
        "success": True,
        "transfer_id": transfer.id,
        "message": "Transfer initiated",
        "remaining_in_warehouse": warehouse_inventory.quantity
    })


# ========================================
# WAREHOUSE CSV EXPORTS
# ========================================
def export_warehouse_incoming_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="warehouse_incoming.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "From Distributor", "Quantity Received", "Transfer Date", "Blockchain TX ID"])

    transfers = TransferRecord.objects.filter(receiver__profile__role__iexact="WAREHOUSE").select_related("batch", "sender")
    for t in transfers:
        writer.writerow([
            t.batch.batch_id,
            t.batch.name,
            t.sender.username if t.sender else "N/A",
            t.quantity,
            t.timestamp.strftime("%Y-%m-%d %H:%M"),
            t.tx_id
        ])
    return response


def export_warehouse_outgoing_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="warehouse_outgoing.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "To Wholesaler", "Quantity Sent", "Transfer Date", "Blockchain TX ID"])

    transfers = TransferRecord.objects.filter(sender__profile__role__iexact="WAREHOUSE").select_related("batch", "receiver")
    for t in transfers:
        writer.writerow([
            t.batch.batch_id,
            t.batch.name,
            t.receiver.username if t.receiver else "N/A",
            t.quantity,
            t.timestamp.strftime("%Y-%m-%d %H:%M"),
            t.tx_id
        ])
    return response


def export_warehouse_expired_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="warehouse_expired.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "Expiry Date", "Remaining Quantity"])

    today = timezone.now().date()
    batches = MedicineBatch.objects.filter(current_holder__profile__role__iexact="WAREHOUSE", expiry_date__lt=today)
    for b in batches:
        writer.writerow([b.batch_id, b.name, b.expiry_date, b.remaining_quantity])

    return response


def export_warehouse_full_inventory_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="warehouse_inventory.csv"'
    writer = csv.writer(response)
    writer.writerow(["Batch ID", "Medicine Name", "Manufacturer", "Manufacture Date", "Expiry Date", "Total Quantity", "Remaining Quantity"])

    batches = MedicineBatch.objects.filter(current_holder__profile__role__iexact="WAREHOUSE").select_related("manufacturer")
    for b in batches:
        writer.writerow([
            b.batch_id,
            b.name,
            b.manufacturer.username if b.manufacturer else "N/A",
            b.manufacture_date,
            b.expiry_date,
            b.quantity,
            b.remaining_quantity
        ])

    return response

# ========================================
# ✅ WHOLESALER INCOMING - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_wholesaler_incoming(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    transfers = TransferRecord.objects.filter(
        receiver=user,
        status="PENDING"
    ).select_related("batch", "sender").order_by("-timestamp")
    
    data = []
    for t in transfers:
        data.append({
            "transfer_id": t.id,
            "batch_id": t.batch.batch_id,
            "medicine_name": t.batch.name,
            "quantity": t.quantity,
            "from_user": t.sender.username,
            "from_role": get_role(t.sender),
            "expiry_date": t.batch.expiry_date.isoformat() if t.batch.expiry_date else None,
            "qr_code_url": request.build_absolute_uri(t.batch.qr_code.url) if t.batch.qr_code else None,
            "status": t.status
        })
    
    return Response({"count": len(data), "incoming_batches": data})

# ========================================
# ✅ WHOLESALER ACCEPT TRANSFER - FIXED
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_wholesaler_accept_transfer(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    transfer_id = request.data.get("transfer_id")
    if not transfer_id:
        return Response({"detail": "transfer_id required."}, status=400)

    transfer = get_object_or_404(TransferRecord, id=transfer_id)
    if transfer.receiver != user:
        return Response({"detail": "Not your transfer."}, status=403)
    if transfer.status != "PENDING":
        return Response({"detail": f"Transfer not pending (status={transfer.status})."}, status=400)

    batch = transfer.batch
    
    with transaction.atomic():
        # Update transfer
        transfer.status = "CONFIRMED"
        transfer.save(update_fields=["status"])

        # ✅ Add to wholesaler inventory
        inventory, created = Inventory.objects.get_or_create(
            user=user,
            batch=batch,
            defaults={"quantity": 0}
        )
        inventory.quantity = F("quantity") + transfer.quantity
        inventory.save(update_fields=["quantity"])
        inventory.refresh_from_db()

        # Update holder
        batch.current_holder = user
        batch.save(update_fields=["current_holder"])

        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "WHOLESALER_RECEIVED",
                    "receiver": user.username,
                    "quantity": transfer.quantity,
                    "transfer_id": transfer.id
                },
                created_by=user
            )
        except Exception as e:
            logger.error(f"Blockchain failed: {e}")

    return Response({
        "success": True,
        "message": "Batch received by wholesaler",
        "batch_id": batch.batch_id,
        "received_quantity": transfer.quantity,
        "total_in_inventory": inventory.quantity
    })

# ========================================
# WHOLESALER - REJECT TRANSFER
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_wholesaler_reject_transfer(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    transfer_id = request.data.get("transfer_id")
    reason = request.data.get("reason", "")
    if not transfer_id:
        return Response({"detail": "transfer_id required."}, status=400)

    transfer = get_object_or_404(TransferRecord, id=transfer_id)
    if transfer.receiver != user:
        return Response({"detail": "Not your transfer."}, status=403)
    if transfer.status != "PENDING":
        return Response({"detail": f"Transfer not pending (status={transfer.status})."}, status=400)

    batch = transfer.batch
    with transaction.atomic():
        transfer.status = "REJECTED"
        transfer.save(update_fields=["status"])
        batch.remaining_quantity = F('remaining_quantity') + transfer.quantity
        batch.save(update_fields=["remaining_quantity"])
        

    return Response({"success": True, "message": "Transfer rejected and quantity returned to sender."})

# ========================================
# ✅ WHOLESALER INVENTORY - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_wholesaler_inventory(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    today = date.today()
    alert_threshold = today + timedelta(days=30)

    # ✅ Get wholesaler inventory
    inventory_items = Inventory.objects.filter(
        user=user,
        quantity__gt=0
    ).select_related('batch', 'batch__manufacturer')

    inventory = []
    total_received = 0
    total_remaining = 0

    for inv in inventory_items:
        batch = inv.batch
        
        # Total received
        received_qty = TransferRecord.objects.filter(
            receiver=user,
            batch=batch,
            status="CONFIRMED"
        ).aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        total_received += received_qty
        total_remaining += inv.quantity

        # Expiry status
        if batch.expiry_date:
            if batch.expiry_date <= today:
                expiry_status = "EXPIRED"
            elif batch.expiry_date <= alert_threshold:
                expiry_status = "NEAR_EXPIRY"
            else:
                expiry_status = "SAFE"
        else:
            expiry_status = "UNKNOWN"

        # Low stock
        low_stock = inv.quantity <= LOW_STOCK_THRESHOLD

        inventory.append({
            "batch_id": batch.batch_id,
            "medicine_name": batch.name,
            "manufacturer": batch.manufacturer.username if batch.manufacturer else "N/A",
            "total_received": received_qty,
            "remaining_quantity": inv.quantity,
            "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "expiry_status": expiry_status,
            "low_stock": low_stock,
            "qr_code_url": request.build_absolute_uri(batch.qr_code.url) if batch.qr_code else None
        })
    
    return Response({
        "total_batches": len(inventory),
        "total_received": total_received,
        "total_remaining": total_remaining,
        "inventory": inventory
    })

# ========================================
# WHOLESALER - GET SHOPKEEPER USERS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_get_shopkeeper_users(request):
    user = request.user
    role = get_role(user)

    if role != "WHOLESALER":
        return Response({"detail": "Only Wholesaler allowed."}, status=403)

    shopkeepers = User.objects.filter(profile__role__iexact="SHOPKEEPER").values("id", "username")
    return Response({"count": shopkeepers.count(), "shopkeeper_users": list(shopkeepers)})


# ========================================
# WHOLESALER TRANSFER TO SHOPKEEPER
# =======================================
# ========================================
# ✅ WHOLESALER TRANSFER TO SHOPKEEPER - FIXED
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_wholesaler_transfer_to_shopkeeper(request):
    user = request.user
    if get_role(user) != "WHOLESALER":
        return Response({"detail": "Only wholesaler allowed."}, status=403)

    batch_id = request.data.get("batch_id")
    receiver_id = request.data.get("receiver_id")
    quantity = request.data.get("quantity")

    if not all([batch_id, receiver_id, quantity]):
        return Response({"detail": "Missing fields"}, status=400)

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return Response({"detail": "Quantity must be > 0"}, status=400)
    except ValueError:
        return Response({"detail": "Invalid quantity"}, status=400)

    batch = get_object_or_404(MedicineBatch, batch_id=batch_id)
    receiver = get_object_or_404(User, id=receiver_id)

    # ✅ Check wholesaler inventory
    try:
        wholesaler_inventory = Inventory.objects.get(user=user, batch=batch)
    except Inventory.DoesNotExist:
        return Response({"detail": "Batch not in your inventory"}, status=400)

    if wholesaler_inventory.quantity < quantity:
        return Response({
            "detail": f"Insufficient. You have {wholesaler_inventory.quantity} units"
        }, status=400)

    with transaction.atomic():
        transfer = TransferRecord.objects.create(
            batch=batch,
            sender=user,
            receiver=receiver,
            quantity=quantity,
            status="PENDING"
        )

        # ✅ Reduce wholesaler inventory
        wholesaler_inventory.quantity = F("quantity") - quantity
        wholesaler_inventory.save(update_fields=["quantity"])
        wholesaler_inventory.refresh_from_db()

    return Response({
        "success": True,
        "transfer_id": transfer.id,
        "remaining_in_wholesaler": wholesaler_inventory.quantity
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_distributor_reject_transfer(request):
    user = request.user
    role = get_role(user)

    if role != "DISTRIBUTOR":
        return Response({"detail": "Only distributor allowed."}, status=403)

    transfer_id = request.data.get("transfer_id")
    reason = request.data.get("reason", "")
    if not transfer_id:
        return Response({"detail": "transfer_id required."}, status=400)

    transfer = get_object_or_404(TransferRecord, id=transfer_id)
    if transfer.receiver != user:
        return Response({"detail": "Not your transfer."}, status=403)
    if transfer.status != "PENDING":
        return Response({"detail": f"Transfer not pending (status={transfer.status})."}, status=400)

    batch = transfer.batch
    with transaction.atomic():
        transfer.status = "REJECTED"
        transfer.save(update_fields=["status"])
        batch.remaining_quantity = F('remaining_quantity') + transfer.quantity
        batch.save(update_fields=["remaining_quantity"])
        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "TRANSFER_REJECTED",
                    "transfer_id": transfer.id,
                    "from_user": transfer.sender.id,
                    "to_user": transfer.receiver.id,
                    "quantity": transfer.quantity,
                    "notes": f"Rejected by {user.username}: {reason}"
                },
                created_by=user
            )
        except Exception as e:
            logger.error(f"Blockchain update failed for rejection {transfer.id}: {e}")

    return Response({"success": True, "message": "Transfer rejected and quantity returned to sender."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_reject_transfer(request):
    """
    Universal reject endpoint for Warehouse/Wholesaler/Shopkeeper
    """
    user = request.user
    role = get_role(user)

    if role not in ["WAREHOUSE", "WHOLESALER", "SHOPKEEPER"]:
        return Response({"detail": "Only downstream roles can reject."}, status=403)

    transfer_id = request.data.get("transfer_id")
    reason = request.data.get("reason", "No reason provided")

    if not transfer_id:
        return Response({"detail": "transfer_id required."}, status=400)

    transfer = get_object_or_404(TransferRecord, id=transfer_id)
    
    if transfer.receiver != user:
        return Response({"detail": "Not your transfer."}, status=403)
    
    if transfer.status != "PENDING":
        return Response({"detail": f"Cannot reject (status={transfer.status})."}, status=400)

    batch = transfer.batch

    with transaction.atomic():
        # ✅ Mark as rejected
        transfer.status = "REJECTED"
        transfer.save(update_fields=["status"])

        # ✅ Return quantity to sender's inventory using F()
        try:
            sender_inventory = Inventory.objects.get(user=transfer.sender, batch=batch)
            sender_inventory.quantity = F("quantity") + transfer.quantity
            sender_inventory.save(update_fields=["quantity"])
            sender_inventory.refresh_from_db()
        except Inventory.DoesNotExist:
            logger.warning(f"Sender inventory not found for {transfer.sender.username}")

        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "TRANSFER_REJECTED",
                    "transfer_id": transfer.id,
                    "from_user": transfer.sender.id,
                    "to_user": user.id,
                    "quantity": transfer.quantity,
                    "reason": reason
                },
                created_by=user
            )
        except Exception as e:
            logger.error(f"Blockchain reject failed: {e}")

    return Response({
        "success": True,
        "message": "Transfer rejected and quantity returned to sender.",
        "reason": reason
    })


# ========================================
# ✅ SHOPKEEPER INCOMING - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_incoming(request):
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        transfers = TransferRecord.objects.filter(
            receiver=user,
            status="PENDING"
        ).select_related("batch", "sender").order_by("-timestamp")

        data = []
        for t in transfers:
            data.append({
                "transfer_id": t.id,
                "batch_id": t.batch.batch_id,
                "medicine_name": t.batch.name,
                "quantity": t.quantity,
                "from_user": t.sender.username,
                "from_role": get_role(t.sender),
                "expiry_date": t.batch.expiry_date.isoformat() if t.batch.expiry_date else None,
                "status": t.status
            })

        return Response({"count": len(data), "incoming": data})

    except Exception as e:
        logger.error(f"Shopkeeper incoming error: {e}")
        return Response({"detail": "Server error"}, status=500)

# ========================================
# ✅ SHOPKEEPER ACCEPT TRANSFER - FIXED
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_accept_transfer(request):
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        transfer_id = request.data.get("transfer_id")
        if not transfer_id:
            return Response({"detail": "transfer_id required"}, status=400)

        transfer = get_object_or_404(TransferRecord, id=transfer_id)

        if transfer.receiver != user:
            return Response({"detail": "Not your transfer"}, status=403)
        if transfer.status != "PENDING":
            return Response({"detail": "Transfer not pending"}, status=400)

        batch = transfer.batch

        with transaction.atomic():
            # Confirm
            transfer.status = "CONFIRMED"
            transfer.save(update_fields=["status"])

            # ✅ Add to shopkeeper inventory
            inventory, _ = Inventory.objects.get_or_create(
                user=user,
                batch=batch,
                defaults={"quantity": 0}
            )
            inventory.quantity = F("quantity") + transfer.quantity
            inventory.save(update_fields=["quantity"])
            inventory.refresh_from_db()

            # Update holder
            batch.current_holder = user
            batch.save(update_fields=["current_holder"])

            try:
                create_transfer_block(
                    batch_id=batch.batch_id,
                    transaction_data={
                        "action": "SHOPKEEPER_RECEIVED",
                        "quantity": transfer.quantity
                    },
                    created_by=user
                )
            except Exception as e:
                logger.warning(f"Blockchain skipped: {e}")

        return Response({
            "success": True,
            "inventory": inventory.quantity
        })

    except Exception as e:
        logger.error(f"Accept error: {e}")
        return Response({"detail": "Server error"}, status=500)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_reject_transfer(request):
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        transfer_id = request.data.get("transfer_id")
        reason = request.data.get("reason", "")

        if not transfer_id:
            return Response({"detail": "transfer_id required"}, status=400)

        transfer = get_object_or_404(TransferRecord, id=transfer_id)

        if transfer.receiver != user:
            return Response({"detail": "Not your transfer"}, status=403)
        if transfer.status != "PENDING":
            return Response({"detail": "Transfer not pending"}, status=400)

        batch = transfer.batch

        with transaction.atomic():
            transfer.status = "REJECTED"
            transfer.save(update_fields=["status"])

            Inventory.objects.filter(
                user=transfer.sender,
                batch=batch
            ).update(quantity=F("quantity") + transfer.quantity)

            batch.current_holder = transfer.sender
            batch.save(update_fields=["current_holder"])

            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "TRANSFER_REJECTED",
                    "transfer_id": transfer.id,
                    "reason": reason,
                },
                created_by=user
            )

        return Response({"success": True})

    except Exception as e:
        logger.error(f"Reject transfer error: {e}")
        return Response({"detail": "Server error"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_inventory(request):
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        today = date.today()
        alert_date = today + timedelta(days=30)

        # ✅ Get shopkeeper inventory
        inventory_items = Inventory.objects.filter(
            user=user,
            quantity__gt=0
        ).select_related('batch', 'batch__manufacturer')

        inventory = []
        total_received = 0
        total_remaining = 0

        for inv in inventory_items:
            batch = inv.batch
            
            # Total received
            received_qty = TransferRecord.objects.filter(
                receiver=user,
                batch=batch,
                status="CONFIRMED"
            ).aggregate(Sum("quantity"))["quantity__sum"] or 0
            
            total_received += received_qty
            total_remaining += inv.quantity

            # Expiry status
            if batch.expiry_date and batch.expiry_date <= today:
                expiry_status = "EXPIRED"
            elif batch.expiry_date and batch.expiry_date <= alert_date:
                expiry_status = "NEAR_EXPIRY"
            else:
                expiry_status = "SAFE"

            inventory.append({
                "batch_id": batch.batch_id,
                "medicine_name": batch.name,
                "manufacturer": batch.manufacturer.username if batch.manufacturer else "N/A",
                "total_received": received_qty,
                "remaining_quantity": inv.quantity,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "expiry_status": expiry_status,
                "low_stock": inv.quantity <= LOW_STOCK_THRESHOLD
            })

        return Response({
            "total_batches": len(inventory),
            "total_received": total_received,
            "total_remaining": total_remaining,
            "inventory": inventory
        })

    except Exception as e:
        logger.error(f"Inventory error: {e}")
        return Response({"detail": "Server error"}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_sell_medicine(request):
    """
    Sell medicine securely by shopkeeper
    """
    try:
        user = request.user

        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        batch_id = request.data.get("batch_id")
        quantity = request.data.get("quantity")

        if not batch_id or not quantity:
            return Response(
                {"detail": "batch_id and quantity are required"},
                status=400
            )

        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"detail": "Quantity must be a number"}, status=400)

        if quantity <= 0:
            return Response({"detail": "Quantity must be greater than 0"}, status=400)

        batch = get_object_or_404(MedicineBatch, batch_id=batch_id)

        # 🔐 SECURITY CHECKS
        if batch.batch_status == "RECALLED":
            return Response(
                {"detail": "⚠️ This batch has been RECALLED. Cannot sell."},
                status=400
            )

        if batch.expiry_date and batch.expiry_date < timezone.now().date():
            return Response({"detail": "Medicine is expired"}, status=400)

        inventory = get_object_or_404(Inventory, user=user, batch=batch)

        if inventory.quantity < quantity:
            return Response({"detail": "Insufficient stock"}, status=400)

        with transaction.atomic():

            # 🔽 Reduce inventory
            Inventory.objects.filter(id=inventory.id).update(
                quantity=F("quantity") - quantity
            )
            inventory.refresh_from_db()

            # 🔄 Sync batch + IMPORTANT current_holder update
            MedicineBatch.objects.filter(id=batch.id).update(
                remaining_quantity=inventory.quantity,
                total_distributed=F("total_distributed") + quantity,
                current_holder=user
            )
            batch.refresh_from_db()

            # 🧾 Record sale
            sale = TransferRecord.objects.create(
                batch=batch,
                sender=user,
                receiver=None,
                quantity=quantity,
                status="SOLD"
            )

            # ⛓ Blockchain entry
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "SOLD",
                    "sale_id": sale.id,
                    "quantity": quantity,
                    "shopkeeper": user.username
                },
                created_by=user
            )

        return Response({
            "success": True,
            "message": "Medicine sold successfully",
            "remaining_quantity": inventory.quantity,
            "batch_id": batch.batch_id,
            "current_holder": user.username,
            "total_distributed": batch.total_distributed
        })

    except Exception as e:
        logger.exception("❌ Sell medicine crash")
        return Response({"detail": "Sell medicine failed"}, status=500)


        
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_sales_history(request):
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return Response({"detail": "Only shopkeeper allowed."}, status=403)

        sales = TransferRecord.objects.filter(
            sender=user,
            status="SOLD"
        ).select_related("batch").order_by("-timestamp")

        data = [{
            "sale_id": s.id,
            "batch_id": s.batch.batch_id,
            "medicine_name": s.batch.name,
            "quantity": s.quantity,
            "timestamp": s.timestamp
        } for s in sales]

        return Response({"count": len(data), "sales": data})

    except Exception as e:
        logger.error(f"Sales history error: {e}")
        return Response({"detail": "Server error"}, status=500)
# ========================================
# ✅ BATCH VERIFICATION WITH TRAIL - FIXED
# ========================================
# ========================================
# ✅ BATCH VERIFICATION WITH TRAIL - FIXED
# ========================================
@api_view(["GET"])
@permission_classes([AllowAny])  # ✅ Both authenticated & unauthenticated allowed
def api_verify_batch(request, batch_id):
    """
    ✅ UNIFIED VERIFICATION API 
    - Works for PUBLIC customers (mobile app - no login)
    - Works for AUTHENTICATED users (web dashboard - logged in)
    
    Automatically detects if user is logged in and provides additional data accordingly
    """
    try:
        batch = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).get(batch_id=batch_id)
        
        today = timezone.now().date()
        
        # Check if user is authenticated (web dashboard user vs public customer)
        is_authenticated = request.user and request.user.is_authenticated
        user_role = None
        if is_authenticated:
            try:
                user_role = request.user.profile.role
            except:
                pass
        
        # ===================================
        # 🚨 SECURITY CHECKS (Priority Order)
        # ===================================
        
        # CHECK 1: RECALLED (HIGHEST PRIORITY - Most dangerous)
        if batch.batch_status == 'RECALLED':
            logger.critical(f"🚨 RECALLED batch scanned: {batch_id} by {request.user if is_authenticated else 'public'}")
            return Response({
                "valid": False,
                "authentic": False,
                "status": "RECALLED",
                "severity": "CRITICAL",
                "title": "⚠️ MEDICINE RECALLED",
                "message": "This medicine has been recalled by health authorities. DO NOT USE.",
                "action": "Contact DRAP immediately",
                "batch_info": {
                    "batch_id": batch.batch_id,
                    "name": batch.name,
                    "manufacturer": batch.manufacturer.username if batch.manufacturer else "Unknown"
                },
                "contact": {
                    "drap_hotline": "051-9103200",
                    "emergency": "Please report this immediately"
                }
            }, status=200)
        
        # CHECK 2: EXPIRED (Second priority - Health risk)
        if batch.expiry_date and batch.expiry_date < today:
            days_expired = (today - batch.expiry_date).days
            logger.warning(f"⚠️ EXPIRED batch: {batch_id} ({days_expired} days) scanned by {request.user if is_authenticated else 'public'}")
            
            return Response({
                "valid": False,
                "authentic": True,
                "status": "EXPIRED",
                "severity": "HIGH",
                "title": "⚠️ MEDICINE EXPIRED",
                "message": f"This medicine expired {days_expired} days ago on {batch.expiry_date.strftime('%d %b, %Y')}",
                "action": "DO NOT USE. Return to pharmacy for replacement.",
                "batch_info": {
                    "batch_id": batch.batch_id,
                    "name": batch.name,
                    "manufacturer": batch.manufacturer.username if batch.manufacturer else "Unknown",
                    "expiry_date": batch.expiry_date.strftime('%d %b, %Y'),
                    "days_expired": days_expired
                },
                "warning": "Expired medicines may be ineffective or harmful to health.",
                "contact": {
                    "drap_hotline": "051-9103200"
                }
            }, status=200)
        
        # ===================================
        # CHECK 3: EXHAUSTED 
        # ✅ Only when ALL units are SOLD + NO inventory left anywhere
        # ===================================
        total_manufactured = batch.quantity or 0

        # Count units SOLD to final customers
        total_sold_to_customers = TransferRecord.objects.filter(
            batch=batch,
            status="SOLD"
        ).aggregate(total_qty=models.Sum('quantity'))['total_qty'] or 0

        # ✅ Check total inventory remaining in supply chain
        # (manufacturer, distributor, warehouse, wholesaler, shopkeeper)
        total_inventory_in_chain = Inventory.objects.filter(
            batch=batch
        ).aggregate(total_qty=models.Sum('quantity'))['total_qty'] or 0

        # ✅ Batch is EXHAUSTED only when:
        # 1. All units are sold to customers, AND
        # 2. No inventory left anywhere in supply chain
        if total_sold_to_customers >= total_manufactured and total_inventory_in_chain == 0:
            logger.warning(f"⚠️ EXHAUSTED batch: {batch_id} (Sold: {total_sold_to_customers}, Inventory: {total_inventory_in_chain})")
            
            last_sale = TransferRecord.objects.filter(
                batch=batch, status="SOLD"
            ).order_by('-timestamp').first()
            last_sale_date = last_sale.timestamp.strftime('%d %b, %Y') if last_sale else None

            return Response({
                "valid": False,
                "authentic": True,
                "status": "EXHAUSTED",
                "severity": "HIGH",
                "title": "⚠️ SUSPICIOUS - Batch Fully Depleted",
                "message": "All units of this batch have been sold and no inventory remains in the supply chain.",
                "action": "If you just purchased this, verify authenticity with the pharmacy immediately.",
                "batch_info": {
                    "batch_id": batch.batch_id,
                    "name": batch.name,
                    "manufacturer": batch.manufacturer.username if batch.manufacturer else "Unknown",
                    "total_manufactured": total_manufactured,
                    "total_sold_to_customers": total_sold_to_customers,
                    "inventory_remaining_in_chain": total_inventory_in_chain,
                    "all_depleted": True,
                    "last_sale_date": last_sale_date
                },
                "contact": {
                    "drap_hotline": "051-9103200",
                    "action_required": "Report suspicious medicine"
                }
            }, status=200)

        
        # CHECK 4: Blockchain integrity (Tamper detection)
        chain_valid, chain_message = validate_chain(batch_id)
        
        if not chain_valid:
            logger.critical(f"🚨 BLOCKCHAIN INVALID: {batch_id}")
            return Response({
                "valid": False,
                "authentic": False,
                "status": "BLOCKCHAIN_INVALID",
                "severity": "CRITICAL",
                "title": "🚨 COUNTERFEIT ALERT",
                "message": "Security verification failed. This medicine may be FAKE.",
                "action": "DO NOT USE. Report to authorities immediately.",
                "batch_info": {
                    "batch_id": batch.batch_id,
                    "name": batch.name
                },
                "blockchain_issue": chain_message,
                "contact": {
                    "drap_hotline": "051-9103200",
                    "emergency": "Report counterfeit medicine"
                }
            }, status=200)
        
        # ===================================
        # ✅ ALL CHECKS PASSED - BUILD RESPONSE
        # ===================================
        
        # Build clean supply chain journey
        transfers = TransferRecord.objects.filter(
            batch=batch
        ).select_related('sender', 'receiver').order_by('timestamp')
        
        journey_steps = []
        
        # Step 1: Manufacturing (always present)
        journey_steps.append({
            "step": 1,
            "stage": "Manufactured",
            "icon": "🏭",
            "location": batch.manufacturer.username if batch.manufacturer else "Unknown Manufacturer",
            "date": batch.manufacture_date.strftime('%d %b, %Y') if batch.manufacture_date else "Unknown",
            "status": "COMPLETED"
        })
        
        # Build journey from CONFIRMED and SOLD transfers only
        step_num = 2
        stage_config = {
            "DISTRIBUTOR": {"name": "Distribution Center", "icon": "🚚"},
            "WAREHOUSE": {"name": "Warehouse Storage", "icon": "🏢"},
            "WHOLESALER": {"name": "Wholesaler", "icon": "📦"},
            "SHOPKEEPER": {"name": "Retail Pharmacy", "icon": "🏪"}
        }
        
        for transfer in transfers:
            # Only show confirmed or sold transfers
            if transfer.status not in ["CONFIRMED", "SOLD"]:
                continue
            
            # For SOLD status, it's final customer sale
            if transfer.status == "SOLD":
                journey_steps.append({
                    "step": step_num,
                    "stage": "Sold to Customer",
                    "icon": "✅",
                    "location": transfer.sender.username if transfer.sender else "Retail Pharmacy",
                    "date": transfer.timestamp.strftime('%d %b, %Y'),
                    "status": "COMPLETED"
                })
                break
            
            # For CONFIRMED transfers in supply chain
            if transfer.receiver:
                receiver_role = get_role(transfer.receiver)
                
                # Only show valid supply chain roles
                if receiver_role and receiver_role in stage_config:
                    config = stage_config[receiver_role]
                    
                    journey_steps.append({
                        "step": step_num,
                        "stage": config["name"],
                        "icon": config["icon"],
                        "location": transfer.receiver.username,
                        "date": transfer.timestamp.strftime('%d %b, %Y'),
                        "status": "COMPLETED"
                    })
                    step_num += 1
        
        # Get QR code URL
        qr_url = None
        if batch.qr_code:
            try:
                qr_url = request.build_absolute_uri(batch.qr_code.url)
            except Exception:
                pass
        
        # Calculate expiry info and alerts
        expiry_alert = None
        days_until_expiry = None
        if batch.expiry_date:
            days_until_expiry = (batch.expiry_date - today).days
            
            if days_until_expiry <= 0:
                # Should have been caught earlier, but safety check
                expiry_alert = {
                    "type": "critical",
                    "message": "⚠️ Medicine has expired",
                    "days_left": 0
                }
            elif days_until_expiry <= 30:
                expiry_alert = {
                    "type": "warning",
                    "message": f"⚠️ Expires soon - {days_until_expiry} days remaining",
                    "days_left": days_until_expiry
                }
            elif days_until_expiry <= 90:
                expiry_alert = {
                    "type": "info",
                    "message": f"Expires in {days_until_expiry} days",
                    "days_left": days_until_expiry
                }
        
        # Check for suspicious reports on this batch
        suspicious_reports_count = SuspiciousMedicineReport.objects.filter(
            batch_id=batch_id,
            status__in=['PENDING', 'INVESTIGATING', 'VERIFIED']
        ).count()
        
        suspicious_alert = None
        if suspicious_reports_count > 0:
            suspicious_alert = {
                "type": "warning",
                "message": f"⚠️ {suspicious_reports_count} suspicious report(s) filed for this batch",
                "action": "Exercise caution. Contact DRAP for verification.",
                "contact": "051-9103200"
            }
        
        # Build alerts array (only non-null alerts)
        alerts = []
        if expiry_alert:
            alerts.append(expiry_alert)
        if suspicious_alert:
            alerts.append(suspicious_alert)
        
        # Base response (for both public and authenticated)
        response_data = {
            "valid": True,
            "authentic": True,
            "status": "VERIFIED",
            "title": "✅ Verified Authentic",
            "message": "This medicine is genuine and safe to use.",
            
            # Medicine details
            "medicine": {
                "name": batch.name,
                "batch_id": batch.batch_id,
                "manufacturer": batch.manufacturer.username if batch.manufacturer else "Unknown",
                "manufactured_on": batch.manufacture_date.strftime('%d %b, %Y') if batch.manufacture_date else "Unknown",
                "expires_on": batch.expiry_date.strftime('%d %b, %Y') if batch.expiry_date else "No expiry date",
                "days_until_expiry": days_until_expiry,
                "qr_code": qr_url
            },
            
            # Alerts array (empty if no alerts)
            "alerts": alerts,
            
            # Clean supply chain journey
            "journey": {
                "title": "Supply Chain Journey",
                "total_steps": len(journey_steps),
                "steps": journey_steps
            },
            
            # Security verification info
            "security": {
                "blockchain_verified": True,
                "tamper_proof": True,
                "verified_at": timezone.now().strftime('%d %b, %Y %I:%M %p')
            }
        }
        
        # ===================================
        # 🔐 ADD EXTRA DATA FOR AUTHENTICATED USERS (Web Dashboard)
        # ===================================
        if is_authenticated:
            # Get blockchain data
            blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by('index')
            blockchain_trail = []
            for block in blockchain_blocks:
                blockchain_trail.append({
                    "index": block.index,
                    "timestamp": block.timestamp.isoformat(),
                    "hash": block.hash,
                    "previous_hash": block.previous_hash,
                    "transaction_data": block.transaction_data,
                    "created_by": block.created_by.username if block.created_by else None
                })
            
            # Get detailed transfer trail
            transfer_trail = []
            for transfer in transfers:
                transfer_trail.append({
                    "transfer_id": transfer.id,
                    "from_user": transfer.sender.username if transfer.sender else None,
                    "from_role": get_role(transfer.sender),
                    "to_user": transfer.receiver.username if transfer.receiver else "Customer",
                    "to_role": get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
                    "quantity": transfer.quantity,
                    "status": transfer.status,
                    "timestamp": transfer.timestamp.isoformat(),
                    "tx_id": transfer.tx_id
                })
            
            # Add authenticated-only data
            response_data["authenticated_user"] = {
                "username": request.user.username,
                "role": user_role
            }
            
            # Calculate distribution metrics
            total_confirmed_transfers = TransferRecord.objects.filter(
                batch=batch,
                status="CONFIRMED"
            ).aggregate(total_qty=models.Sum('quantity'))['total_qty'] or 0
            
            response_data["detailed_info"] = {
                "current_holder": {
                    "username": batch.current_holder.username if batch.current_holder else None,
                    "role": get_role(batch.current_holder) if batch.current_holder else None
                },
                "batch_status": batch.batch_status,
                "total_manufactured": batch.quantity,
                "total_distributed": total_confirmed_transfers + total_sold_to_customers,
                "total_sold": total_sold_to_customers,
                "remaining_in_supply_chain": total_inventory_in_chain,
                "blockchain": {
                    "is_valid": chain_valid,
                    "total_blocks": blockchain_blocks.count(),
                    "trail": blockchain_trail
                },
                "transfer_history": transfer_trail
            }
        
        return Response(response_data, status=200)

    except MedicineBatch.DoesNotExist:
        logger.critical(f"🚨 COUNTERFEIT: Batch {batch_id} not found in database")
        return Response({
            "valid": False,
            "authentic": False,
            "status": "NOT_FOUND",
            "severity": "CRITICAL",
            "title": "🚨 COUNTERFEIT ALERT",
            "message": "This QR code is not registered in our system.",
            "action": "DO NOT USE this medicine. It is likely FAKE.",
            "batch_id": batch_id,
            "contact": {
                "drap_hotline": "051-9103200",
                "emergency": "Report counterfeit medicine immediately"
            }
        }, status=404)
    
    except Exception as e:
        logger.exception(f"❌ Verification error for batch {batch_id}: {str(e)}")
        return Response({
            "valid": False,
            "status": "ERROR",
            "severity": "MEDIUM",
            "title": "Verification Failed",
            "message": "Unable to verify medicine. Please try again or contact support.",
            "action": "If problem persists, contact DRAP for manual verification.",
            "contact": {
                "drap_hotline": "051-9103200"
            },
            "error_details": str(e) if settings.DEBUG else None
        }, status=500)
# ===================================
# HELPER FUNCTION
# ===================================
def get_role(user):
    """
    Get role of user safely - returns None if user has no profile
    """
    if not user:
        return None
    try:
        return user.profile.role
    except Exception:
        return None
# ========================================
# SHOPKEEPER - EXPORT CSV FUNCTIONS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_shopkeeper_incoming_csv(request):
    """Export incoming transfers CSV"""
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="shopkeeper_incoming.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Transfer ID", "Batch ID", "Medicine Name", "From Wholesaler", 
            "Quantity", "Status", "Transfer Date", "Expiry Date"
        ])

        transfers = TransferRecord.objects.filter(
            receiver=user
        ).exclude(status="SOLD").select_related("batch", "sender")
        
        for t in transfers:
            writer.writerow([
                t.id,
                t.batch.batch_id,
                t.batch.name,
                t.sender.username,
                t.quantity,
                t.status,
                t.timestamp.strftime("%Y-%m-%d %H:%M"),
                t.batch.expiry_date.strftime("%Y-%m-%d") if t.batch.expiry_date else "N/A"
            ])

        return response
    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_shopkeeper_sales_csv(request):
    """Export sales history CSV"""
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="shopkeeper_sales.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Sale ID", "Batch ID", "Medicine Name", "Manufacturer",
            "Quantity Sold", "Customer Name", "Sale Date"
        ])

        sales = TransferRecord.objects.filter(
            sender=user,
            status="SOLD"
        ).select_related("batch", "batch__manufacturer")
        
        for sale in sales:
            # Try to get customer name
            customer_name = "Walk-in Customer"
            try:
                blockchain_entry = BlockChainBlock.objects.filter(
                    batch_id=sale.batch.batch_id,
                    transaction_data__sale_id=sale.id
                ).first()
                if blockchain_entry and blockchain_entry.transaction_data:
                    customer_name = blockchain_entry.transaction_data.get("customer_name", customer_name)
            except:
                pass

            writer.writerow([
                sale.id,
                sale.batch.batch_id,
                sale.batch.name,
                sale.batch.manufacturer.username if sale.batch.manufacturer else "N/A",
                sale.quantity,
                customer_name,
                sale.timestamp.strftime("%Y-%m-%d %H:%M")
            ])

        return response
    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_shopkeeper_expired_csv(request):
    """Export expired medicines CSV"""
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="shopkeeper_expired.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Batch ID", "Medicine Name", "Manufacturer", "Expiry Date", 
            "Remaining Quantity", "Days Expired"
        ])

        today = timezone.now().date()
        expired_inventory = Inventory.objects.filter(
            user=user,
            quantity__gt=0,
            batch__expiry_date__lt=today
        ).select_related("batch", "batch__manufacturer")
        
        for inv in expired_inventory:
            days_expired = (today - inv.batch.expiry_date).days
            writer.writerow([
                inv.batch.batch_id,
                inv.batch.name,
                inv.batch.manufacturer.username if inv.batch.manufacturer else "N/A",
                inv.batch.expiry_date.strftime("%Y-%m-%d"),
                inv.quantity,
                days_expired
            ])

        return response
    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_shopkeeper_inventory_csv(request):
    """Export full inventory CSV"""
    try:
        user = request.user
        if get_role(user) != "SHOPKEEPER":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="shopkeeper_inventory.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Batch ID", "Medicine Name", "Manufacturer", "Manufacture Date",
            "Expiry Date", "Available Quantity", "Status", "Last Updated"
        ])

        today = timezone.now().date()
        inventory_items = Inventory.objects.filter(
            user=user,
            quantity__gt=0
        ).select_related("batch", "batch__manufacturer")
        
        for inv in inventory_items:
            batch = inv.batch
            
            # Determine status
            if batch.expiry_date:
                if batch.expiry_date <= today:
                    status = "EXPIRED"
                elif batch.expiry_date <= today + timedelta(days=30):
                    status = "EXPIRING SOON"
                else:
                    status = "SAFE"
            else:
                status = "UNKNOWN"
            
            if inv.quantity <= LOW_STOCK_THRESHOLD:
                status += " - LOW STOCK"

            writer.writerow([
                batch.batch_id,
                batch.name,
                batch.manufacturer.username if batch.manufacturer else "N/A",
                batch.manufacture_date.strftime("%Y-%m-%d") if batch.manufacture_date else "N/A",
                batch.expiry_date.strftime("%Y-%m-%d") if batch.expiry_date else "N/A",
                inv.quantity,
                status,
                inv.updated_at.strftime("%Y-%m-%d %H:%M")
            ])

        return response
    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)


# ========================================
# SHOPKEEPER - REPORT
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_report(request):
    """
    Generate comprehensive shopkeeper report
    """
    user = request.user
    role = get_role(user)

    if role != "SHOPKEEPER":
        return Response({"detail": "Only Shopkeeper allowed."}, status=403)

    try:
        today = date.today()
        
        # Inventory metrics
        inventory_items = Inventory.objects.filter(user=user, quantity__gt=0).select_related("batch")
        total_batches = inventory_items.count()
        total_quantity = inventory_items.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # Sales metrics
        all_sales = TransferRecord.objects.filter(sender=user, status="SOLD")
        total_sales = all_sales.count()
        total_quantity_sold = all_sales.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # Today's sales
        today_sales = all_sales.filter(timestamp__date=today)
        today_sales_count = today_sales.count()
        today_quantity_sold = today_sales.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # This week's sales
        week_ago = today - timedelta(days=7)
        week_sales = all_sales.filter(timestamp__date__gte=week_ago)
        week_sales_count = week_sales.count()
        week_quantity_sold = week_sales.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # This month's sales
        month_ago = today - timedelta(days=30)
        month_sales = all_sales.filter(timestamp__date__gte=month_ago)
        month_sales_count = month_sales.count()
        month_quantity_sold = month_sales.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # Alerts
        low_stock_count = inventory_items.filter(quantity__lte=LOW_STOCK_THRESHOLD).count()
        expiring_soon = inventory_items.filter(
            batch__expiry_date__lte=today + timedelta(days=30),
            batch__expiry_date__gte=today
        ).count()
        expired_count = inventory_items.filter(batch__expiry_date__lt=today).count()
        
        # Pending transfers
        pending_incoming = TransferRecord.objects.filter(receiver=user, status="PENDING").count()
        
        # Top selling medicines
        top_medicines = all_sales.values(
            'batch__name', 'batch__batch_id'
        ).annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]

        return Response({
            "success": True,
            "report": {
                "inventory": {
                    "total_batches": total_batches,
                    "total_quantity": total_quantity,
                    "low_stock": low_stock_count,
                    "expiring_soon": expiring_soon,
                    "expired": expired_count
                },
                "sales": {
                    "all_time": {
                        "count": total_sales,
                        "quantity": total_quantity_sold
                    },
                    "today": {
                        "count": today_sales_count,
                        "quantity": today_quantity_sold
                    },
                    "this_week": {
                        "count": week_sales_count,
                        "quantity": week_quantity_sold
                    },
                    "this_month": {
                        "count": month_sales_count,
                        "quantity": month_quantity_sold
                    }
                },
                "transfers": {
                    "pending_incoming": pending_incoming
                },
                "top_medicines": list(top_medicines)
            },
            "generated_at": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Shopkeeper report error: {str(e)}")
        return Response({"detail": "Failed to generate report."}, status=500)


# ========================================
# SHOPKEEPER - VERIFY MEDICINE (for customer)
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_verify_medicine(request, batch_id):
    """
    Verify medicine authenticity for customer
    Shows full blockchain history
    """
    user = request.user
    role = get_role(user)

    if role != "SHOPKEEPER":
        return Response({"detail": "Only Shopkeeper allowed."}, status=403)

    try:
        # Get batch
        batch = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).get(batch_id=batch_id)
        
        # Validate blockchain
        chain_valid, chain_message = validate_chain(batch_id)
        
        # Get blockchain trail
        blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by('index')
        
        blockchain_trail = []
        for block in blockchain_blocks:
            blockchain_trail.append({
                "index": block.index,
                "timestamp": block.timestamp.isoformat(),
                "hash": block.hash,
                "previous_hash": block.previous_hash,
                "transaction_data": block.transaction_data,
                "created_by": block.created_by.username if block.created_by else None
            })
        
        # Get transfer history
        transfers = TransferRecord.objects.filter(
            batch=batch
        ).select_related('sender', 'receiver').order_by('timestamp')
        
        transfer_history = []
        for transfer in transfers:
            transfer_history.append({
                "from": transfer.sender.username,
                "to": transfer.receiver.username if transfer.receiver else "Customer",
                "quantity": transfer.quantity,
                "status": transfer.status,
                "timestamp": transfer.timestamp.isoformat()
            })
        
        # Check if shopkeeper has this batch
        has_in_inventory = Inventory.objects.filter(user=user, batch=batch, quantity__gt=0).exists()
        
        return Response({
            "success": True,
            "is_authentic": chain_valid,
            "verification_message": chain_message,
            "batch": {
                "batch_id": batch.batch_id,
                "name": batch.name,
                "manufacturer": batch.manufacturer.username,
                "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "current_holder": batch.current_holder.username if batch.current_holder else None
            },
            "in_your_inventory": has_in_inventory,
            "blockchain": {
                "is_valid": chain_valid,
                "total_blocks": blockchain_blocks.count(),
                "trail": blockchain_trail
            },
            "transfer_history": transfer_history
        })

    except MedicineBatch.DoesNotExist:
        return Response({
            "success": False,
            "is_authentic": False,
            "error": "Batch not found. This may be a fake medicine.",
            "batch_id": batch_id
        }, status=404)
    except Exception as e:
        logger.error(f"❌ Verify medicine error: {str(e)}")
        return Response({"detail": "Verification failed."}, status=500)
           

# ========================================
# SHOPKEEPER - DASHBOARD
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_dashboard(request):
    """
    Shopkeeper dashboard overview with key metrics
    """
    user = request.user
    role = get_role(user)

    if role != "SHOPKEEPER":
        return Response({"detail": "Only Shopkeeper allowed."}, status=403)

    try:
        today = date.today()
        
        # Inventory stats
        inventory_items = Inventory.objects.filter(user=user, quantity__gt=0).select_related("batch")
        
        total_batches = inventory_items.count()
        total_quantity = inventory_items.aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        low_stock_count = inventory_items.filter(quantity__lte=LOW_STOCK_THRESHOLD).count()
        
        expiring_soon = inventory_items.filter(
            batch__expiry_date__lte=today + timedelta(days=30),
            batch__expiry_date__gte=today
        ).count()
        
        expired_count = inventory_items.filter(batch__expiry_date__lt=today).count()
        
        # Sales stats
        total_sales = TransferRecord.objects.filter(sender=user, status="SOLD").count()
        total_sold_quantity = TransferRecord.objects.filter(
            sender=user, 
            status="SOLD"
        ).aggregate(Sum("quantity"))["quantity__sum"] or 0
        
        # Pending transfers
        pending_incoming = TransferRecord.objects.filter(
            receiver=user, 
            status="PENDING"
        ).count()

        return Response({
            "success": True,
            "dashboard": {
                "inventory": {
                    "total_batches": total_batches,
                    "total_quantity": total_quantity,
                    "low_stock_count": low_stock_count,
                    "expiring_soon": expiring_soon,
                    "expired_count": expired_count
                },
                "sales": {
                    "total_sales": total_sales,
                    "total_quantity_sold": total_sold_quantity
                },
                "transfers": {
                    "pending_incoming": pending_incoming
                }
            }
        })

    except Exception as e:
        logger.error(f"❌ Shopkeeper dashboard error: {str(e)}")
        return Response({"detail": "Failed to load dashboard."}, status=500)



# ========================================
# SHOPKEEPER - NOTIFICATIONS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_notifications(request):
    """
    Get shopkeeper notifications:
    - Incoming transfers
    - Low stock alerts
    - Expiry alerts
    - Recent sales
    """
    user = request.user
    role = get_role(user)

    if role != "SHOPKEEPER":
        return Response({"detail": "Only Shopkeeper allowed."}, status=403)

    try:
        notifications = []
        today = date.today()

        # 1. PENDING INCOMING TRANSFERS
        pending_transfers = TransferRecord.objects.filter(
            receiver=user,
            status="PENDING"
        ).select_related('batch', 'sender').order_by('-timestamp')[:20]
        
        for t in pending_transfers:
            notifications.append({
                "id": f"incoming_{t.id}",
                "type": "INCOMING_TRANSFER",
                "priority": "HIGH",
                "message": f"📥 New stock from {t.sender.username}: {t.batch.name} ({t.quantity} units)",
                "batch_id": t.batch.batch_id,
                "transfer_id": t.id,
                "quantity": t.quantity,
                "from_user": t.sender.username,
                "timestamp": t.timestamp.isoformat(),
                "read": False
            })

        # 2. LOW STOCK ALERTS
        inventory_items = Inventory.objects.filter(
            user=user,
            quantity__gt=0,
            quantity__lte=LOW_STOCK_THRESHOLD
        ).select_related("batch")
        
        for inv in inventory_items:
            notifications.append({
                "id": f"low_stock_{inv.batch.id}",
                "type": "LOW_STOCK",
                "priority": "MEDIUM",
                "message": f"⚠️ Low Stock: {inv.batch.name} only has {inv.quantity} units left",
                "batch_id": inv.batch.batch_id,
                "quantity": inv.quantity,
                "timestamp": timezone.now().isoformat(),
                "read": False
            })

        # 3. EXPIRING SOON ALERTS
        expiring_threshold = today + timedelta(days=30)
        expiring_inventory = Inventory.objects.filter(
            user=user,
            quantity__gt=0,
            batch__expiry_date__lte=expiring_threshold,
            batch__expiry_date__gte=today
        ).select_related("batch")
        
        for inv in expiring_inventory:
            days_left = (inv.batch.expiry_date - today).days
            notifications.append({
                "id": f"expiring_{inv.batch.id}",
                "type": "EXPIRING_SOON",
                "priority": "HIGH",
                "message": f"⏰ {inv.batch.name} expires in {days_left} days ({inv.quantity} units)",
                "batch_id": inv.batch.batch_id,
                "expiry_date": inv.batch.expiry_date.isoformat(),
                "days_remaining": days_left,
                "quantity": inv.quantity,
                "timestamp": timezone.now().isoformat(),
                "read": False
            })

        # 4. EXPIRED MEDICINES
        expired_inventory = Inventory.objects.filter(
            user=user,
            quantity__gt=0,
            batch__expiry_date__lt=today
        ).select_related("batch")
        
        for inv in expired_inventory:
            notifications.append({
                "id": f"expired_{inv.batch.id}",
                "type": "EXPIRED",
                "priority": "CRITICAL",
                "message": f"❌ EXPIRED: {inv.batch.name} expired on {inv.batch.expiry_date} ({inv.quantity} units)",
                "batch_id": inv.batch.batch_id,
                "expiry_date": inv.batch.expiry_date.isoformat(),
                "quantity": inv.quantity,
                "timestamp": timezone.now().isoformat(),
                "read": False
            })

        # 5. RECENT SALES
        recent_sales = TransferRecord.objects.filter(
            sender=user,
            status="SOLD"
        ).select_related('batch').order_by('-timestamp')[:10]
        
        for sale in recent_sales:
            notifications.append({
                "id": f"sale_{sale.id}",
                "type": "SALE",
                "priority": "INFO",
                "message": f"✅ Sold {sale.quantity} units of {sale.batch.name}",
                "batch_id": sale.batch.batch_id,
                "quantity": sale.quantity,
                "timestamp": sale.timestamp.isoformat(),
                "read": False
            })

        # Sort by priority
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        notifications.sort(
            key=lambda x: (priority_order.get(x["priority"], 5), x["timestamp"]), 
            reverse=True
        )

        return Response({
            "success": True,
            "count": len(notifications),
            "unread_count": len([n for n in notifications if not n["read"]]),
            "notifications": notifications[:50]
        })

    except Exception as e:
        logger.error(f"❌ Shopkeeper notifications error: {str(e)}")
        return Response({"detail": "Failed to fetch notifications."}, status=500)
  


# ========================================
# SHOPKEEPER - TRANSFER HISTORY
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_shopkeeper_transfer_history(request):
    """
    View complete transfer history (incoming only, excludes sales)
    """
    user = request.user
    role = get_role(user)

    if role != "SHOPKEEPER":
        return Response({"detail": "Only Shopkeeper allowed."}, status=403)

    try:
        transfers = TransferRecord.objects.filter(
            receiver=user
        ).exclude(
            status="SOLD"
        ).select_related("batch", "sender").order_by("-timestamp")

        history_data = []
        
        for t in transfers:
            history_data.append({
                "transfer_id": t.id,
                "batch_id": t.batch.batch_id,
                "medicine_name": t.batch.name,
                "quantity": t.quantity,
                "from_user": t.sender.username,
                "from_role": get_role(t.sender),
                "status": t.status,
                "timestamp": t.timestamp.isoformat(),
                "tx_id": t.tx_id
            })

        return Response({
            "success": True,
            "count": len(history_data),
            "transfer_history": history_data
        })

    except Exception as e:
        logger.error(f"❌ Transfer history error: {str(e)}")
        return Response({"detail": "Failed to fetch transfer history."}, status=500)





#//////////////
# ========================================
# 🔐 DRAP ADMIN APIs
# ========================================

# ========================================
# DRAP ADMIN DASHBOARD
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_admin_dashboard(request):
    """
    DRAP Admin main dashboard with system overview
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "Access denied. DRAP Admin only."
            }, status=403)

        today = date.today()
        
        # Manufacturer stats
        total_manufacturers = User.objects.filter(
            profile__role="MANUFACTURER"
        ).count()
        
        # Batch stats
        total_batches = MedicineBatch.objects.count()
        verified_batches = MedicineBatch.objects.filter(
            qr_code__isnull=False
        ).count()
        
        expired_batches = MedicineBatch.objects.filter(
            expiry_date__lt=today
        ).count()
        
        # Supply chain stats
        total_transfers = TransferRecord.objects.count()
        pending_transfers = TransferRecord.objects.filter(
            status="PENDING"
        ).count()
        confirmed_transfers = TransferRecord.objects.filter(
            status="CONFIRMED"
        ).count()
        
        # Blockchain stats
        total_blocks = BlockChainBlock.objects.count()
        
        # Recent activity
        recent_batches = MedicineBatch.objects.select_related(
            'manufacturer'
        ).order_by('-created_at')[:5]
        
        recent_activity = []
        for batch in recent_batches:
            recent_activity.append({
                "batch_id": batch.batch_id,
                "medicine_name": batch.name,
                "manufacturer": batch.manufacturer.username if batch.manufacturer else "N/A",
                "created_at": batch.created_at.isoformat()
            })

        return Response({
            "success": True,
            "dashboard": {
                "manufacturers": {
                    "total": total_manufacturers
                },
                "batches": {
                    "total": total_batches,
                    "verified": verified_batches,
                    "expired": expired_batches,
                    "active": total_batches - expired_batches
                },
                "supply_chain": {
                    "total_transfers": total_transfers,
                    "pending": pending_transfers,
                    "confirmed": confirmed_transfers
                },
                "blockchain": {
                    "total_blocks": total_blocks
                },
                "recent_activity": recent_activity
            }
        })

    except Exception as e:
        logger.error(f"❌ DRAP dashboard error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to load dashboard"
        }, status=500)


# ========================================
# 🏭 MANUFACTURER MANAGEMENT
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_manufacturers(request):
    """
    View all manufacturers with details
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        manufacturers = User.objects.filter(
            profile__role="MANUFACTURER"
        ).prefetch_related('batches')

        manufacturers_data = []
        for mfr in manufacturers:
            # Calculate stats
            total_batches = mfr.batches.count()
            total_quantity = mfr.batches.aggregate(
                Sum("quantity")
            )["quantity__sum"] or 0
            
            manufacturers_data.append({
                "id": mfr.id,
                "username": mfr.username,
                "email": mfr.email,
                "date_joined": mfr.date_joined.isoformat(),
                "is_active": mfr.is_active,
                "total_batches": total_batches,
                "total_quantity_produced": total_quantity,
                "status": "Active" if mfr.is_active else "Blocked"
            })

        return Response({
            "success": True,
            "count": len(manufacturers_data),
            "manufacturers": manufacturers_data
        })

    except Exception as e:
        logger.error(f"❌ View manufacturers error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch manufacturers"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_manufacturer_detail(request, manufacturer_id):
    """
    Get detailed manufacturer profile
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        manufacturer = User.objects.filter(
            id=manufacturer_id,
            profile__role="MANUFACTURER"
        ).prefetch_related('batches').first()

        if not manufacturer:
            return Response({
                "success": False,
                "detail": "Manufacturer not found"
            }, status=404)

        # Get batches
        batches = manufacturer.batches.all()
        
        batches_data = []
        for batch in batches:
            batches_data.append({
                "batch_id": batch.batch_id,
                "name": batch.name,
                "quantity": batch.quantity,
                "remaining_quantity": batch.remaining_quantity,
                "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "created_at": batch.created_at.isoformat()
            })

        # Transfer stats
        sent_transfers = TransferRecord.objects.filter(
            sender=manufacturer
        ).count()
        
        confirmed_transfers = TransferRecord.objects.filter(
            sender=manufacturer,
            status="CONFIRMED"
        ).count()

        return Response({
            "success": True,
            "manufacturer": {
                "id": manufacturer.id,
                "username": manufacturer.username,
                "email": manufacturer.email,
                "date_joined": manufacturer.date_joined.isoformat(),
                "is_active": manufacturer.is_active,
                "status": "Active" if manufacturer.is_active else "Blocked"
            },
            "statistics": {
                "total_batches": batches.count(),
                "total_quantity": batches.aggregate(Sum("quantity"))["quantity__sum"] or 0,
                "total_transfers": sent_transfers,
                "confirmed_transfers": confirmed_transfers
            },
            "batches": batches_data
        })

    except Exception as e:
        logger.error(f"❌ Manufacturer detail error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch manufacturer details"
        }, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_block_manufacturer(request, manufacturer_id):
    """
    Block/Suspend manufacturer
    """
    try:
        user = request.user
        role = get_role(user)

        if role !="DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        manufacturer = User.objects.filter(
            id=manufacturer_id,
            profile__role="MANUFACTURER"
        ).first()

        if not manufacturer:
            return Response({
                "success": False,
                "detail": "Manufacturer not found"
            }, status=404)

        # Toggle active status
        manufacturer.is_active = not manufacturer.is_active
        manufacturer.save(update_fields=["is_active"])

        action = "blocked" if not manufacturer.is_active else "unblocked"

        logger.info(
            f"✅ DRAP Admin {user.username} {action} manufacturer {manufacturer.username}"
        )

        return Response({
            "success": True,
            "message": f"Manufacturer {action} successfully",
            "manufacturer_id": manufacturer.id,
            "is_active": manufacturer.is_active
        })

    except Exception as e:
        logger.error(f"❌ Block manufacturer error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to update manufacturer status"
        }, status=500)


# ========================================
# 📦 BATCH MONITORING
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_all_batches(request):
    """
    View all medicine batches in the system
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        # Get filter parameters
        status_filter = request.GET.get('status', None)  # expired, active, all
        manufacturer_id = request.GET.get('manufacturer', None)

        batches_query = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).all()

        # Apply filters
        if manufacturer_id:
            batches_query = batches_query.filter(manufacturer_id=manufacturer_id)

        today = date.today()
        
        if status_filter == 'expired':
            batches_query = batches_query.filter(expiry_date__lt=today)
        elif status_filter == 'active':
            batches_query = batches_query.filter(
                Q(expiry_date__gte=today) | Q(expiry_date__isnull=True)
            )

        batches_data = []
        for batch in batches_query.order_by('-created_at'):
            # Determine status
            if batch.expiry_date:
                if batch.expiry_date < today:
                    batch_status = "EXPIRED"
                elif batch.expiry_date <= today + timedelta(days=30):
                    batch_status = "EXPIRING_SOON"
                else:
                    batch_status = "ACTIVE"
            else:
                batch_status = "UNKNOWN"

            # Check blockchain
            blockchain_exists = BlockChainBlock.objects.filter(
                batch_id=batch.batch_id
            ).exists()

            batches_data.append({
                "batch_id": batch.batch_id,
                "name": batch.name,
                "manufacturer": {
                    "id": batch.manufacturer.id if batch.manufacturer else None,
                    "username": batch.manufacturer.username if batch.manufacturer else None
                },
                "current_holder": {
                    "username": batch.current_holder.username if batch.current_holder else None,
                    "role": get_role(batch.current_holder) if batch.current_holder else None
                },
                "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "quantity": batch.quantity,
                "remaining_quantity": batch.remaining_quantity,
                "status": batch_status,
                "has_blockchain": blockchain_exists,
                "has_qr": bool(batch.qr_code),
                "created_at": batch.created_at.isoformat()
            })

        return Response({
            "success": True,
            "count": len(batches_data),
            "batches": batches_data
        })

    except Exception as e:
        logger.error(f"❌ View batches error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch batches"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_batch_detail(request, batch_id):
    """
    Get detailed batch information with blockchain audit
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        batch = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).filter(batch_id=batch_id).first()

        if not batch:
            return Response({
                "success": False,
                "detail": "Batch not found"
            }, status=404)

        # Blockchain validation
        chain_valid, chain_message = validate_chain(batch_id)
        blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id).order_by('index')

        blockchain_trail = []
        for block in blockchain_blocks:
            blockchain_trail.append({
                "index": block.index,
                "timestamp": block.timestamp.isoformat(),
                "hash": block.hash,
                "previous_hash": block.previous_hash,
                "transaction_data": block.transaction_data,
                "created_by": block.created_by.username if block.created_by else None
            })

        # Transfer history
        transfers = TransferRecord.objects.filter(
            batch=batch
        ).select_related('sender', 'receiver').order_by('timestamp')

        transfer_history = []
        for transfer in transfers:
            transfer_history.append({
                "id": transfer.id,
                "from_user": transfer.sender.username if transfer.sender else None,
                "from_role": get_role(transfer.sender) if transfer.sender else None,
                "to_user": transfer.receiver.username if transfer.receiver else "Customer",
                "to_role": get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
                "quantity": transfer.quantity,
                "status": transfer.status,
                "timestamp": transfer.timestamp.isoformat()
            })

        # QR code
        qr_url = None
        if batch.qr_code:
            try:
                qr_url = request.build_absolute_uri(batch.qr_code.url)
            except:
                pass

        return Response({
            "success": True,
            "batch": {
                "batch_id": batch.batch_id,
                "name": batch.name,
                "manufacturer": {
                    "id": batch.manufacturer.id if batch.manufacturer else None,
                    "username": batch.manufacturer.username if batch.manufacturer else None
                },
                "current_holder": {
                    "username": batch.current_holder.username if batch.current_holder else None,
                    "role": get_role(batch.current_holder) if batch.current_holder else None
                },
                "manufacture_date": batch.manufacture_date.isoformat() if batch.manufacture_date else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "quantity": batch.quantity,
                "remaining_quantity": batch.remaining_quantity,
                "qr_code_url": qr_url,
                "created_at": batch.created_at.isoformat()
            },
            "blockchain": {
                "is_valid": chain_valid,
                "message": chain_message,
                "total_blocks": blockchain_blocks.count(),
                "trail": blockchain_trail
            },
            "transfers": {
                "count": transfers.count(),
                "history": transfer_history
            }
        })

    except Exception as e:
        logger.error(f"❌ Batch detail error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch batch details"
        }, status=500)


# ========================================
# 🔗 BLOCKCHAIN AUDIT
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_validate_batch_blockchain(request, batch_id):
    """
    Validate blockchain integrity for a batch
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        batch = MedicineBatch.objects.filter(batch_id=batch_id).first()
        
        if not batch:
            return Response({
                "success": False,
                "detail": "Batch not found"
            }, status=404)

        # Validate blockchain
        chain_valid, chain_message = validate_chain(batch_id)
        
        # Get blockchain details
        blockchain_blocks = BlockChainBlock.get_chain_for_batch(batch_id)
        
        if not blockchain_blocks.exists():
            return Response({
                "success": False,
                "is_valid": False,
                "message": "No blockchain found for this batch",
                "suspicious": True
            })

        validation_details = []
        for block in blockchain_blocks.order_by('index'):
            # Recompute hash
            from blockchain.services import compute_canonical_hash
            
            recomputed_hash = compute_canonical_hash(
                block.index,
                block.timestamp,
                block.transaction_data,
                block.previous_hash
            )
            
            hash_match = recomputed_hash == block.hash
            
            validation_details.append({
                "block_index": block.index,
                "hash_valid": hash_match,
                "timestamp": block.timestamp.isoformat(),
                "created_by": block.created_by.username if block.created_by else None
            })

        logger.info(
            f"✅ DRAP Admin {user.username} validated batch {batch_id}: {chain_message}"
        )

        return Response({
            "success": True,
            "batch_id": batch_id,
            "is_valid": chain_valid,
            "message": chain_message,
            "total_blocks": blockchain_blocks.count(),
            "validation_details": validation_details,
            "verified_by": user.username,
            "verified_at": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Blockchain validation error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Blockchain validation failed"
        }, status=500)


# ========================================
# 🔁 SUPPLY CHAIN TRACKING
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_supply_chain_overview(request):
    """
    Overview of entire supply chain
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        # Count by role
        distributors = User.objects.filter(profile__role="DISTRIBUTOR").count()
        warehouses = User.objects.filter(profile__role="WAREHOUSE").count()
        wholesalers = User.objects.filter(profile__role="WHOLESALER").count()
        shopkeepers = User.objects.filter(profile__role="SHOPKEEPER").count()

        # Transfer statistics
        total_transfers = TransferRecord.objects.count()
        pending = TransferRecord.objects.filter(status="PENDING").count()
        confirmed = TransferRecord.objects.filter(status="CONFIRMED").count()
        rejected = TransferRecord.objects.filter(status="REJECTED").count()
        sold = TransferRecord.objects.filter(status="SOLD").count()

        # Recent transfers
        recent_transfers = TransferRecord.objects.select_related(
            'batch', 'sender', 'receiver'
        ).order_by('-timestamp')[:10]

        recent_activity = []
        for transfer in recent_transfers:
            recent_activity.append({
                "batch_id": transfer.batch.batch_id,
                "medicine_name": transfer.batch.name,
                "from_user": transfer.sender.username if transfer.sender else None,
                "from_role": get_role(transfer.sender) if transfer.sender else None,
                "to_user": transfer.receiver.username if transfer.receiver else "Customer",
                "to_role": get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
                "quantity": transfer.quantity,
                "status": transfer.status,
                "timestamp": transfer.timestamp.isoformat()
            })

        return Response({
            "success": True,
            "supply_chain": {
                "stakeholders": {
                    "distributors": distributors,
                    "warehouses": warehouses,
                    "wholesalers": wholesalers,
                    "shopkeepers": shopkeepers,
                    "total": distributors + warehouses + wholesalers + shopkeepers
                },
                "transfers": {
                    "total": total_transfers,
                    "pending": pending,
                    "confirmed": confirmed,
                    "rejected": rejected,
                    "sold": sold
                },
                "recent_activity": recent_activity
            }
        })

    except Exception as e:
        logger.error(f"❌ Supply chain overview error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch supply chain data"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_track_batch_journey(request, batch_id):
    """
    Track complete journey of a batch
    """
    try:
        user = request.user
        role = get_role(user)

        if role !=  "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        batch = MedicineBatch.objects.select_related('manufacturer').filter(
            batch_id=batch_id
        ).first()

        if not batch:
            return Response({
                "success": False,
                "detail": "Batch not found"
            }, status=404)

        # Get all transfers
        transfers = TransferRecord.objects.filter(
            batch=batch
        ).select_related('sender', 'receiver').order_by('timestamp')

        journey = []
        for transfer in transfers:
            journey.append({
                "step": len(journey) + 1,
                "from_user": transfer.sender.username if transfer.sender else None,
                "from_role": get_role(transfer.sender) if transfer.sender else None,
                "to_user": transfer.receiver.username if transfer.receiver else "Customer",
                "to_role": get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
                "quantity": transfer.quantity,
                "status": transfer.status,
                "timestamp": transfer.timestamp.isoformat(),
                "tx_id": transfer.tx_id
            })

        return Response({
            "success": True,
            "batch_id": batch_id,
            "medicine_name": batch.name,
            "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
            "total_quantity": batch.quantity,
            "remaining_quantity": batch.remaining_quantity,
            "journey_steps": len(journey),
            "journey": journey
        })

    except Exception as e:
        logger.error(f"❌ Track batch error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to track batch journey"
        }, status=500)


# ========================================
# 📊 REPORTS & ANALYTICS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_analytics_report(request):
    """
    Comprehensive analytics report
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        today = date.today()
        
        # Batch analytics
        total_batches = MedicineBatch.objects.count()
        active_batches = MedicineBatch.objects.filter(
            Q(expiry_date__gte=today) | Q(expiry_date__isnull=True)
        ).count()
        expired_batches = MedicineBatch.objects.filter(
            expiry_date__lt=today
        ).count()
        
        # Blockchain analytics
        total_blocks = BlockChainBlock.objects.count()
        batches_with_blockchain = BlockChainBlock.objects.values(
            'batch_id'
        ).distinct().count()
        
        # Transfer analytics
        total_transfers = TransferRecord.objects.count()
        successful_transfers = TransferRecord.objects.filter(
            status="CONFIRMED"
        ).count()
        
        # Calculate success rate
        success_rate = (successful_transfers / total_transfers * 100) if total_transfers > 0 else 0
        
        # Manufacturer analytics
        manufacturers = User.objects.filter(profile__role="MANUFACTURER")
        active_manufacturers = manufacturers.filter(is_active=True).count()
        blocked_manufacturers = manufacturers.filter(is_active=False).count()
        
        # Top manufacturers by batch count
        top_manufacturers = manufacturers.annotate(
            batch_count=Count('batches')
        ).order_by('-batch_count')[:5]
        
        top_mfr_data = []
        for mfr in top_manufacturers:
            top_mfr_data.append({
                "username": mfr.username,
                "batch_count": mfr.batch_count,
                "is_active": mfr.is_active
            })

        return Response({
            "success": True,
            "report": {
                "batches": {
                    "total": total_batches,
                    "active": active_batches,
                    "expired": expired_batches,
                    "expiry_rate": round(expired_batches / total_batches * 100, 2) if total_batches > 0 else 0
                },
                "blockchain": {
                    "total_blocks": total_blocks,
                    "batches_tracked": batches_with_blockchain,
                    "coverage_rate": round(batches_with_blockchain / total_batches * 100, 2) if total_batches > 0 else 0
                },
                "transfers": {
                    "total": total_transfers,
                    "successful": successful_transfers,
                    "success_rate": round(success_rate, 2)
                },
                "manufacturers": {
                    "total": manufacturers.count(),
                    "active": active_manufacturers,
                    "blocked": blocked_manufacturers,
                    "top_manufacturers": top_mfr_data
                }
            },
            "generated_at": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Analytics report error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to generate analytics report"
        }, status=500)


# ========================================
# 📢 NOTIFICATIONS
# ========================================
# medicine/views.py - Add this fixed notification function
# medicine/views.py - FIXED DRAP NOTIFICATIONS

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_notifications(request):
    """DRAP Admin notifications - FIXED with proper report handling"""
    try:
        user = request.user
        role = get_role(user)
        
        if role != "DRAP":
            return Response({"success": False, "detail": "DRAP access required"}, status=403)
        
        notifications = []
        today = date.today()
        
        # ✅ 1. NEW SUSPICIOUS MEDICINE REPORTS (HIGHEST PRIORITY)
        try:
            pending_reports = SuspiciousMedicineReport.objects.filter(
                status='PENDING'
            ).order_by('-created_at')[:20]
            
            for report in pending_reports:
                notifications.append({
                    "id": f"report_{report.id}",
                    "type": "SUSPICIOUS_MEDICINE_REPORT",
                    "priority": "CRITICAL",
                    "message": f"🚨 Counterfeit Report: {report.reason}",
                    
                    # ✅ FIXED: Use report_id instead of batch_id for navigation
                    "report_id": report.id,
                    "batch_id": report.batch_id,  # Just for display
                    
                    "reporter_name": report.reporter_name,
                    "reporter_phone": report.reporter_phone,
                    "location": report.location or "Not provided",
                    "timestamp": report.created_at.isoformat(),
                    "read": False,
                    "action_required": True,
                    
                    # ✅ Add navigation flag
                    "navigate_to": "report_detail"  # Frontend will use this
                })
        except Exception as e:
            logger.error(f"Reports check failed: {str(e)}")
        
        # 2. EXPIRED BATCHES
        try:
            expired_batches = MedicineBatch.objects.filter(
                expiry_date__lt=today,
                remaining_quantity__gt=0
            ).select_related("manufacturer", "current_holder")[:10]
            
            for batch in expired_batches:
                notifications.append({
                    "id": f"expired_{batch.id}",
                    "type": "EXPIRED_BATCH_ALERT",
                    "priority": "HIGH",
                    "message": f"⏰ EXPIRED: {batch.name} ({batch.batch_id})",
                    "batch_id": batch.batch_id,
                    "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
                    "current_holder": batch.current_holder.username if batch.current_holder else None,
                    "expiry_date": batch.expiry_date.isoformat(),
                    "remaining_quantity": batch.remaining_quantity,
                    "timestamp": timezone.now().isoformat(),
                    "read": False,
                    "navigate_to": "batch_detail"
                })
        except Exception as e:
            logger.error(f"Expired check failed: {str(e)}")
        
        # 3. EXPIRING SOON
        try:
            expiring_threshold = today + timedelta(days=30)
            expiring_batches = MedicineBatch.objects.filter(
                expiry_date__lte=expiring_threshold,
                expiry_date__gt=today,
                remaining_quantity__gt=0
            ).select_related("manufacturer")[:10]
            
            for batch in expiring_batches:
                days_left = (batch.expiry_date - today).days
                notifications.append({
                    "id": f"expiring_{batch.id}",
                    "type": "EXPIRING_SOON_ALERT",
                    "priority": "MEDIUM",
                    "message": f"⚠️ Expiring in {days_left} days: {batch.name}",
                    "batch_id": batch.batch_id,
                    "expiry_date": batch.expiry_date.isoformat(),
                    "days_remaining": days_left,
                    "timestamp": timezone.now().isoformat(),
                    "read": False,
                    "navigate_to": "batch_detail"
                })
        except Exception as e:
            logger.error(f"Expiring check failed: {str(e)}")
        
        # 4. BLOCKCHAIN INTEGRITY ISSUES
        try:
            recent_batches = MedicineBatch.objects.order_by("-created_at")[:20]
            
            for batch in recent_batches:
                chain_valid, chain_message = validate_chain(batch.batch_id)
                if not chain_valid:
                    notifications.append({
                        "id": f"blockchain_{batch.id}",
                        "type": "BLOCKCHAIN_INTEGRITY_ALERT",
                        "priority": "HIGH",
                        "message": f"🔗 Blockchain issue: {batch.name}",
                        "batch_id": batch.batch_id,
                        "issue": chain_message,
                        "timestamp": timezone.now().isoformat(),
                        "read": False,
                        "navigate_to": "batch_detail"
                    })
        except Exception as e:
            logger.error(f"Blockchain check failed: {str(e)}")
        
        # Sort by priority
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        notifications.sort(
            key=lambda x: (priority_order.get(x["priority"], 5), x["timestamp"]),
            reverse=True
        )
        
        # Priority breakdown
        priority_breakdown = {
            "critical": sum(1 for n in notifications if n["priority"] == "CRITICAL"),
            "high": sum(1 for n in notifications if n["priority"] == "HIGH"),
            "medium": sum(1 for n in notifications if n["priority"] == "MEDIUM"),
        }
        
        return Response({
            "success": True,
            "total_count": len(notifications),
            "unread_count": len(notifications),
            "priority_breakdown": priority_breakdown,
            "notifications": notifications[:100]
        })
        
    except Exception as e:
        logger.exception("❌ DRAP notifications fatal error")
        return Response(
            {"success": False, "detail": "Failed to fetch notifications"},
            status=500
        )



# ========================================
# 🧾 AUDIT LOGS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_audit_logs(request):
    """
    System audit logs
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        # Recent batches created
        recent_batches = MedicineBatch.objects.select_related(
            'manufacturer'
        ).order_by('-created_at')[:20]

        logs = []
        
        for batch in recent_batches:
            logs.append({
                "id": f"batch_created_{batch.id}",
                "type": "BATCH_CREATED",
                "action": "Batch Created",
                "user": batch.manufacturer.username if batch.manufacturer else None,
                "user_role": "MANUFACTURER",
                "details": {
                    "batch_id": batch.batch_id,
                    "medicine_name": batch.name,
                    "quantity": batch.quantity
                },
                "timestamp": batch.created_at.isoformat()
            })

        # Recent transfers
        recent_transfers = TransferRecord.objects.select_related(
            'batch', 'sender', 'receiver'
        ).order_by('-timestamp')[:20]

        for transfer in recent_transfers:
            logs.append({
                "id": f"transfer_{transfer.id}",
                "type": "TRANSFER",
                "action": f"Transfer {transfer.status}",
                "user": transfer.sender.username if transfer.sender else None,
                "user_role": get_role(transfer.sender) if transfer.sender else None,
                "details": {
                    "batch_id": transfer.batch.batch_id,
                    "from": transfer.sender.username if transfer.sender else None,
                    "to": transfer.receiver.username if transfer.receiver else "Customer",
                    "quantity": transfer.quantity,
                    "status": transfer.status
                },
                "timestamp": transfer.timestamp.isoformat()
            })

        # Sort by timestamp
        logs.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response({
            "success": True,
            "count": len(logs),
            "logs": logs[:50]
        })

    except Exception as e:
        logger.error(f"❌ Audit logs error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch audit logs"
        }, status=500)


# ========================================
# 🏪 PHARMACY & DISTRIBUTOR OVERSIGHT
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_distributors(request):
    """
    View all distributors
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        distributors = User.objects.filter(profile__role="DISTRIBUTOR")

        distributors_data = []
        for dist in distributors:
            # Get inventory count
            inventory_count = Inventory.objects.filter(
                user=dist,
                quantity__gt=0
            ).count()

            # Transfer stats
            received = TransferRecord.objects.filter(
                receiver=dist,
                status="CONFIRMED"
            ).count()
            
            sent = TransferRecord.objects.filter(
                sender=dist,
                status="CONFIRMED"
            ).count()

            distributors_data.append({
                "id": dist.id,
                "username": dist.username,
                "email": dist.email,
                "is_active": dist.is_active,
                "inventory_items": inventory_count,
                "transfers_received": received,
                "transfers_sent": sent,
                "date_joined": dist.date_joined.isoformat()
            })

        return Response({
            "success": True,
            "count": len(distributors_data),
            "distributors": distributors_data
        })

    except Exception as e:
        logger.error(f"❌ View distributors error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch distributors"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_warehouses(request):
    """
    View all warehouses
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        warehouses = User.objects.filter(profile__role="WAREHOUSE")

        warehouses_data = []
        for warehouse in warehouses:
            # Inventory
            inventory_count = Inventory.objects.filter(
                user=warehouse,
                quantity__gt=0
            ).count()

            # Transfer stats
            received = TransferRecord.objects.filter(
                receiver=warehouse,
                status="CONFIRMED"
            ).count()
            
            sent = TransferRecord.objects.filter(
                sender=warehouse,
                status="CONFIRMED"
            ).count()

            warehouses_data.append({
                "id": warehouse.id,
                "username": warehouse.username,
                "email": warehouse.email,
                "is_active": warehouse.is_active,
                "inventory_items": inventory_count,
                "transfers_received": received,
                "transfers_sent": sent,
                "date_joined": warehouse.date_joined.isoformat()
            })

        return Response({
            "success": True,
            "count": len(warehouses_data),
            "warehouses": warehouses_data
        })

    except Exception as e:
        logger.error(f"❌ View warehouses error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch warehouses"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_wholesalers(request):
    """
    View all wholesalers
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        wholesalers = User.objects.filter(profile__role="WHOLESALER")

        wholesalers_data = []
        for wholesaler in wholesalers:
            # Inventory
            inventory_count = Inventory.objects.filter(
                user=wholesaler,
                quantity__gt=0
            ).count()

            # Transfer stats
            received = TransferRecord.objects.filter(
                receiver=wholesaler,
                status="CONFIRMED"
            ).count()
            
            sent = TransferRecord.objects.filter(
                sender=wholesaler,
                status="CONFIRMED"
            ).count()

            wholesalers_data.append({
                "id": wholesaler.id,
                "username": wholesaler.username,
                "email": wholesaler.email,
                "is_active": wholesaler.is_active,
                "inventory_items": inventory_count,
                "transfers_received": received,
                "transfers_sent": sent,
                "date_joined": wholesaler.date_joined.isoformat()
            })

        return Response({
            "success": True,
            "count": len(wholesalers_data),
            "wholesalers": wholesalers_data
        })

    except Exception as e:
        logger.error(f"❌ View wholesalers error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch wholesalers"
        }, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_shopkeepers(request):
    """
    View all shopkeepers
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        shopkeepers = User.objects.filter(profile__role="SHOPKEEPER")

        shopkeepers_data = []
        for shop in shopkeepers:
            # Inventory
            inventory_count = Inventory.objects.filter(
                user=shop,
                quantity__gt=0
            ).count()

            # Sales
            total_sales = TransferRecord.objects.filter(
                sender=shop,
                status="SOLD"
            ).count()

            shopkeepers_data.append({
                "id": shop.id,
                "username": shop.username,
                "email": shop.email,
                "is_active": shop.is_active,
                "inventory_items": inventory_count,
                "total_sales": total_sales,
                "date_joined": shop.date_joined.isoformat()
            })

        return Response({
            "success": True,
            "count": len(shopkeepers_data),
            "shopkeepers": shopkeepers_data
        })

    except Exception as e:
        logger.error(f"❌ View shopkeepers error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch shopkeepers"
        }, status=500)


# ========================================
# 🛑 EMERGENCY ACTIONS
# ========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_mark_batch_suspicious(request, batch_id):
    """
    Mark a batch as suspicious/fake
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        batch = MedicineBatch.objects.filter(batch_id=batch_id).first()

        if not batch:
            return Response({
                "success": False,
                "detail": "Batch not found"
            }, status=404)

        reason = request.data.get("reason", "Marked suspicious by DRAP")

        # Create blockchain entry
        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "MARKED_SUSPICIOUS",
                    "marked_by": user.username,
                    "reason": reason,
                    "timestamp": timezone.now().isoformat()
                },
                created_by=user
            )
        except Exception as e:
            logger.warning(f"Blockchain entry failed: {str(e)}")

        logger.warning(
            f"⚠️ DRAP Admin {user.username} marked batch {batch_id} as suspicious: {reason}"
        )

        return Response({
            "success": True,
            "message": "Batch marked as suspicious",
            "batch_id": batch_id,
            "marked_by": user.username,
            "reason": reason,
            "timestamp": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Mark suspicious error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to mark batch"
        }, status=500)
    



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_report_detail(request, report_id):
    """
    DRAP Admin - Get detailed report information
    FIXED: Returns complete report data
    """
    try:
        user = request.user
        role = get_role(user)
        
        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)
        
        # ✅ Get report
        try:
            report = SuspiciousMedicineReport.objects.select_related(
                'reviewed_by'
            ).get(id=report_id)
        except SuspiciousMedicineReport.DoesNotExist:
            return Response({
                "success": False,
                "detail": "Report not found"
            }, status=404)
        
        # ✅ Try to get batch info (may not exist if counterfeit)
        batch_data = None
        try:
            batch = MedicineBatch.objects.select_related(
                'manufacturer', 'current_holder'
            ).get(batch_id=report.batch_id)
            
            batch_data = {
                "exists": True,
                "batch_id": batch.batch_id,
                "name": batch.name,
                "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
                "current_holder": batch.current_holder.username if batch.current_holder else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "remaining_quantity": batch.remaining_quantity,
                "batch_status": batch.batch_status
            }
        except MedicineBatch.DoesNotExist:
            batch_data = {
                "exists": False,
                "message": "⚠️ Batch not found in system - likely COUNTERFEIT"
            }
        
        # ✅ Return complete report data
        return Response({
            "success": True,
            "report": {
                "id": report.id,
                "batch_id": report.batch_id,
                "reason": report.reason,
                "reporter_name": report.reporter_name,
                "reporter_phone": report.reporter_phone,
                "reporter_email": report.reporter_email,
                "location": report.location,
                "additional_details": report.additional_details,
                "status": report.status,  # ✅ Current status
                "created_at": report.created_at.isoformat(),
                "reviewed_by": report.reviewed_by.username if report.reviewed_by else None,
                "review_notes": report.review_notes
            },
            "batch": batch_data
        })
        
    except Exception as e:
        logger.exception(f"❌ Report detail error: {str(e)}")
        return Response({
            "success": False,
            "detail": f"Failed to fetch report details: {str(e)}"
        }, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_update_report_status(request, report_id):
    """
    DRAP Admin - Update report status
    FIXED: Properly saves status changes
    """
    try:
        user = request.user
        role = get_role(user)
        
        # ✅ Check DRAP admin permission
        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)
        
        # ✅ Get the report
        try:
            report = SuspiciousMedicineReport.objects.get(id=report_id)
        except SuspiciousMedicineReport.DoesNotExist:
            return Response({
                "success": False,
                "detail": "Report not found"
            }, status=404)
        
        # ✅ Get new status from request
        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', '')
        
        # ✅ Validate status
        valid_statuses = ['PENDING', 'INVESTIGATING', 'VERIFIED', 'RESOLVED', 'DISMISSED']
        if new_status not in valid_statuses:
            return Response({
                "success": False,
                "detail": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            }, status=400)
        
        # ✅ Update report fields
        report.status = new_status
        report.review_notes = review_notes
        report.reviewed_by = user
        
        # ✅ CRITICAL: Save the changes to database
        report.save(update_fields=['status', 'review_notes', 'reviewed_by'])
        
        logger.info(
            f"✅ Report #{report.id} updated by {user.username}: "
            f"{new_status} - {review_notes[:50] if review_notes else 'No notes'}"
        )
        
        # ✅ If VERIFIED, mark batch as suspicious in blockchain
        if new_status == 'VERIFIED':
            try:
                batch = MedicineBatch.objects.get(batch_id=report.batch_id)
                
                # Create blockchain entry
                create_transfer_block(
                    batch_id=batch.batch_id,
                    transaction_data={
                        "action": "MARKED_SUSPICIOUS",
                        "marked_by": user.username,
                        "reason": f"Customer Report #{report.id} verified",
                        "report_id": report.id,
                        "timestamp": timezone.now().isoformat()
                    },
                    created_by=user
                )
                
                logger.warning(
                    f"🚨 Batch {batch.batch_id} marked suspicious due to "
                    f"verified report #{report.id}"
                )
                
            except MedicineBatch.DoesNotExist:
                logger.warning(
                    f"⚠️ Batch {report.batch_id} not found in system - likely counterfeit"
                )
        
        # ✅ Return success response with updated data
        return Response({
            "success": True,
            "message": f"Report status updated to {new_status}",
            "report": {
                "id": report.id,
                "status": report.status,
                "review_notes": report.review_notes,
                "reviewed_by": user.username,
                "updated_at": timezone.now().isoformat()
            }
        }, status=200)
        
    except Exception as e:
        logger.exception(f"❌ Update report status error: {str(e)}")
        return Response({
            "success": False,
            "detail": f"Failed to update report: {str(e)}"
        }, status=500)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_recall_batch(request, batch_id):
    """
    Emergency recall of a batch
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        batch = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).filter(batch_id=batch_id).first()

        if not batch:
            return Response({
                "success": False,
                "detail": "Batch not found"
            }, status=404)

        recall_reason = request.data.get("reason", "Emergency recall by DRAP")

        # Create blockchain entry
        try:
            create_transfer_block(
                batch_id=batch.batch_id,
                transaction_data={
                    "action": "RECALLED",
                    "recalled_by": user.username,
                    "reason": recall_reason,
                    "current_holder": batch.current_holder.username if batch.current_holder else None,
                    "remaining_quantity": batch.remaining_quantity,
                    "timestamp": timezone.now().isoformat()
                },
                created_by=user
            )
        except Exception as e:
            logger.warning(f"Blockchain entry failed: {str(e)}")

        logger.critical(
            f"🚨 DRAP RECALL: Batch {batch_id} recalled by {user.username} - {recall_reason}"
        )

        return Response({
            "success": True,
            "message": "Batch recalled successfully",
            "batch_id": batch_id,
            "medicine_name": batch.name,
            "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
            "current_holder": batch.current_holder.username if batch.current_holder else None,
            "remaining_quantity": batch.remaining_quantity,
            "recalled_by": user.username,
            "reason": recall_reason,
            "timestamp": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Recall batch error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to recall batch"
        }, status=500)


# ========================================
# 📊 EXPORT CSV REPORTS
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_export_batches_csv(request):
    """
    Export all batches to CSV
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="drap_batches_report.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Batch ID", "Medicine Name", "Manufacturer", "Manufacture Date",
            "Expiry Date", "Total Quantity", "Remaining Quantity", 
            "Current Holder", "Status", "Has Blockchain", "Created At"
        ])

        today = date.today()
        batches = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).all()

        for batch in batches:
            # Determine status
            if batch.expiry_date:
                if batch.expiry_date < today:
                    status = "EXPIRED"
                elif batch.expiry_date <= today + timedelta(days=30):
                    status = "EXPIRING SOON"
                else:
                    status = "ACTIVE"
            else:
                status = "UNKNOWN"

            # Check blockchain
            has_blockchain = BlockChainBlock.objects.filter(
                batch_id=batch.batch_id
            ).exists()

            writer.writerow([
                batch.batch_id,
                batch.name,
                batch.manufacturer.username if batch.manufacturer else "N/A",
                batch.manufacture_date.strftime("%Y-%m-%d") if batch.manufacture_date else "N/A",
                batch.expiry_date.strftime("%Y-%m-%d") if batch.expiry_date else "N/A",
                batch.quantity,
                batch.remaining_quantity,
                batch.current_holder.username if batch.current_holder else "N/A",
                status,
                "Yes" if has_blockchain else "No",
                batch.created_at.strftime("%Y-%m-%d %H:%M")
            ])

        logger.info(f"✅ DRAP CSV export by {user.username}")
        return response

    except Exception as e:
        logger.error(f"❌ CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_export_transfers_csv(request):
    """
    Export all transfers to CSV
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return HttpResponse("Unauthorized", status=403)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="drap_transfers_report.csv"'
        response.write('\ufeff')
        
        writer = csv.writer(response)
        writer.writerow([
            "Transfer ID", "Batch ID", "Medicine Name", "From User", 
            "From Role", "To User", "To Role", "Quantity", "Status", 
            "Timestamp", "TX ID"
        ])

        transfers = TransferRecord.objects.select_related(
            'batch', 'sender', 'receiver'
        ).order_by('-timestamp')

        for transfer in transfers:
            writer.writerow([
                transfer.id,
                transfer.batch.batch_id,
                transfer.batch.name,
                transfer.sender.username if transfer.sender else "N/A",
                get_role(transfer.sender) if transfer.sender else "N/A",
                transfer.receiver.username if transfer.receiver else "Customer",
                get_role(transfer.receiver) if transfer.receiver else "CUSTOMER",
                transfer.quantity,
                transfer.status,
                transfer.timestamp.strftime("%Y-%m-%d %H:%M"),
                transfer.tx_id
            ])

        logger.info(f"✅ DRAP transfers CSV export by {user.username}")
        return response

    except Exception as e:
        logger.error(f"❌ Transfers CSV export error: {str(e)}")
        return HttpResponse("Export failed", status=500)


# ========================================
# 🔍 SEARCH & FILTER
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_search_batches(request):
    """
    Search batches by various criteria
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        # Get search parameters
        batch_id = request.GET.get('batch_id', None)
        medicine_name = request.GET.get('medicine_name', None)
        manufacturer_id = request.GET.get('manufacturer_id', None)
        status = request.GET.get('status', None)

        batches = MedicineBatch.objects.select_related(
            'manufacturer', 'current_holder'
        ).all()

        # Apply filters
        if batch_id:
            batches = batches.filter(batch_id__icontains=batch_id)
        
        if medicine_name:
            batches = batches.filter(name__icontains=medicine_name)
        
        if manufacturer_id:
            batches = batches.filter(manufacturer_id=manufacturer_id)
        
        today = date.today()
        if status == 'expired':
            batches = batches.filter(expiry_date__lt=today)
        elif status == 'active':
            batches = batches.filter(
                Q(expiry_date__gte=today) | Q(expiry_date__isnull=True)
            )

        results = []
        for batch in batches[:100]:  # Limit to 100 results
            results.append({
                "batch_id": batch.batch_id,
                "name": batch.name,
                "manufacturer": batch.manufacturer.username if batch.manufacturer else None,
                "current_holder": batch.current_holder.username if batch.current_holder else None,
                "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
                "quantity": batch.quantity,
                "remaining_quantity": batch.remaining_quantity
            })

        return Response({
            "success": True,
            "count": len(results),
            "results": results
        })

    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Search failed"
        }, status=500)


# ========================================
# 📈 SYSTEM HEALTH CHECK
# ========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_system_health(request):
    """
    Check overall system health
    """
    try:
        user = request.user
        role = get_role(user)

        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)

        health_status = {
            "status": "healthy",
            "checks": []
        }

        # Check 1: Database connectivity
        try:
            MedicineBatch.objects.count()
            health_status["checks"].append({
                "name": "Database",
                "status": "OK",
                "message": "Database connected"
            })
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["checks"].append({
                "name": "Database",
                "status": "FAILED",
                "message": str(e)
            })

        # Check 2: Blockchain integrity (sample)
        try:
            recent_batches = MedicineBatch.objects.order_by('-created_at')[:10]
            failed_validations = 0
            
            for batch in recent_batches:
                valid, _ = validate_chain(batch.batch_id)
                if not valid:
                    failed_validations += 1
            
            if failed_validations == 0:
                health_status["checks"].append({
                    "name": "Blockchain Integrity",
                    "status": "OK",
                    "message": "All sampled chains valid"
                })
            else:
                health_status["status"] = "degraded"
                health_status["checks"].append({
                    "name": "Blockchain Integrity",
                    "status": "WARNING",
                    "message": f"{failed_validations} invalid chains detected"
                })
        except Exception as e:
            health_status["checks"].append({
                "name": "Blockchain Integrity",
                "status": "ERROR",
                "message": str(e)
            })

        # Check 3: Expired batches in circulation
        try:
            expired_in_circulation = MedicineBatch.objects.filter(
                expiry_date__lt=date.today(),
                remaining_quantity__gt=0
            ).count()
            
            if expired_in_circulation > 0:
                health_status["status"] = "warning"
                health_status["checks"].append({
                    "name": "Expired Batches",
                    "status": "WARNING",
                    "message": f"{expired_in_circulation} expired batches still in circulation"
                })
            else:
                health_status["checks"].append({
                    "name": "Expired Batches",
                    "status": "OK",
                    "message": "No expired batches in circulation"
                })
        except Exception as e:
            health_status["checks"].append({
                "name": "Expired Batches",
                "status": "ERROR",
                "message": str(e)
            })

        return Response({
            "success": True,
            "health": health_status,
            "checked_at": timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Health check error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Health check failed"
        }, status=500)





@api_view(["POST"])
@permission_classes([AllowAny])
def api_customer_report_suspicious(request):
    """
    Public endpoint for customers to report suspicious/counterfeit medicines
    No authentication required - anyone can report
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['batch_id', 'reason', 'reporter_name', 'reporter_phone']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response({
                "success": False,
                "detail": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=http_status.HTTP_400_BAD_REQUEST)
        
        # Create report
        report = SuspiciousMedicineReport.objects.create(
            batch_id=data['batch_id'],
            reason=data['reason'],
            reporter_name=data['reporter_name'],
            reporter_phone=data['reporter_phone'],
            reporter_email=data.get('reporter_email', ''),
            location=data.get('location', ''),
            additional_details=data.get('additional_details', ''),
            status='PENDING'
        )
        
        logger.critical(
            f"🚨 SUSPICIOUS MEDICINE REPORT #{report.id}\n"
            f"Batch ID: {report.batch_id}\n"
            f"Reporter: {report.reporter_name} ({report.reporter_phone})\n"
            f"Reason: {report.reason}\n"
            f"Location: {report.location or 'Not provided'}"
        )
        
        # TODO: Send notification to DRAP admins
        # You can add email/SMS notification here
        try:
            notify_drap_admins(report)
        except Exception as e:
            logger.error(f"Failed to notify DRAP admins: {str(e)}")
        
        return Response({
            "success": True,
            "message": "Report submitted successfully. DRAP has been notified.",
            "report_id": report.id,
            "status": report.status,
            "created_at": report.created_at.isoformat()
        }, status=http_status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Report submission error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to submit report. Please try again."
        }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)


def notify_drap_admins(report):
    """
    Send notifications to DRAP admins about suspicious medicine report
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    # Get all DRAP admin users
    drap_admins = User.objects.filter(profile__role='DRAP_ADMIN')
    
    if not drap_admins.exists():
        logger.warning("No DRAP admins found to notify")
        return
    
    # Email subject
    subject = f"🚨 URGENT: Suspicious Medicine Report #{report.id}"
    
    # Email body
    message = f"""
SUSPICIOUS MEDICINE REPORT

Report ID: #{report.id}
Status: {report.status}
Submitted: {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}

BATCH INFORMATION:
Batch ID: {report.batch_id}
Reason: {report.reason}

REPORTER INFORMATION:
Name: {report.reporter_name}
Phone: {report.reporter_phone}
Email: {report.reporter_email or 'Not provided'}
Location: {report.location or 'Not provided'}

ADDITIONAL DETAILS:
{report.additional_details or 'None provided'}

---
Please login to the DRAP Admin Dashboard to review this report:
{settings.BASE_URL}/drap/reports/{report.id}/

This is an automated notification from PharmaSentinel.
    """
    
    # Get admin emails
    admin_emails = [admin.email for admin in drap_admins if admin.email]
    
    if admin_emails:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=admin_emails,
                fail_silently=False,
            )
            logger.info(f"✅ Email notification sent to {len(admin_emails)} DRAP admins")
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
    
    # TODO: Add SMS notification here if needed
    # send_sms_to_drap(report)


# Add DRAP admin endpoints to view reports

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_drap_view_reports(request):
    """DRAP Admin - View all suspicious medicine reports"""
    try:
        user = request.user
        role = get_role(user)
        
        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)
        
        # Get filter parameters
        status_filter = request.GET.get('status', None)
        
        reports = SuspiciousMedicineReport.objects.all().order_by('-created_at')
        
        if status_filter:
            reports = reports.filter(status=status_filter)
        
        reports_data = []
        for report in reports[:100]:  # Limit to 100 recent reports
            # ✅ Check if batch exists
            batch_exists = MedicineBatch.objects.filter(batch_id=report.batch_id).exists()
            
            reports_data.append({
                "id": report.id,
                "batch_id": report.batch_id,
                "batch_exists": batch_exists,  # ✅ Frontend can show warning
                "reason": report.reason,
                "reporter_name": report.reporter_name,
                "reporter_phone": report.reporter_phone,
                "reporter_email": report.reporter_email,
                "location": report.location,
                "additional_details": report.additional_details,
                "status": report.status,
                "created_at": report.created_at.isoformat(),
                "reviewed_by": report.reviewed_by.username if report.reviewed_by else None,
                "review_notes": report.review_notes
            })
        
        # Status counts
        status_counts = {
            "pending": SuspiciousMedicineReport.objects.filter(status='PENDING').count(),
            "investigating": SuspiciousMedicineReport.objects.filter(status='INVESTIGATING').count(),
            "verified": SuspiciousMedicineReport.objects.filter(status='VERIFIED').count(),
            "resolved": SuspiciousMedicineReport.objects.filter(status='RESOLVED').count(),
            "dismissed": SuspiciousMedicineReport.objects.filter(status='DISMISSED').count(),
        }
        
        return Response({
            "success": True,
            "count": len(reports_data),
            "status_counts": status_counts,
            "reports": reports_data
        })
        
    except Exception as e:
        logger.error(f"❌ View reports error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to fetch reports"
        }, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_drap_update_report_status(request, report_id):
    """
    DRAP Admin - Update report status
    """
    try:
        user = request.user
        role = get_role(user)
        
        if role != "DRAP":
            return Response({
                "success": False,
                "detail": "DRAP Admin access required"
            }, status=403)
        
        report = SuspiciousMedicineReport.objects.get(id=report_id)
        
        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', '')
        
        if new_status not in ['PENDING', 'INVESTIGATING', 'VERIFIED', 'RESOLVED', 'DISMISSED']:
            return Response({
                "success": False,
                "detail": "Invalid status"
            }, status=400)
        
        report.status = new_status
        report.review_notes = review_notes
        report.reviewed_by = user
        report.save()
        
        logger.info(
            f"✅ Report #{report.id} updated by {user.username}: {new_status}"
        )
        
        return Response({
            "success": True,
            "message": "Report status updated",
            "report_id": report.id,
            "status": report.status
        })
        
    except SuspiciousMedicineReport.DoesNotExist:
        return Response({
            "success": False,
            "detail": "Report not found"
        }, status=404)
    except Exception as e:
        logger.error(f"❌ Update report error: {str(e)}")
        return Response({
            "success": False,
            "detail": "Failed to update report"
        }, status=500)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_create_batches_bulk(request):
    try:
        user = request.user
        role = get_role(user)

        if role != "MANUFACTURER":
            return Response(
                {"detail": "Only Manufacturer can create batches."},
                status=403
            )

        batches_data = request.data.get("batches", [])

        if not batches_data:
            return Response(
                {"detail": "No batches provided."},
                status=400
            )

        created_batches = []
        errors = []

        for index, batch_data in enumerate(batches_data):
            batch_data["manufacturer"] = user.id

            serializer = MedicineBatchSerializer(
                data=batch_data,
                context={"request": request}
            )

            if serializer.is_valid():
                batch = serializer.save()

                # Inventory create
                Inventory.objects.create(
                    user=user,
                    batch=batch,
                    quantity=batch.quantity
                )

                # QR Code
                try:
                    from .utils import generate_qr_for_batch
                    base_url = getattr(settings, "BASE_URL", "http://localhost:8000")
                    generate_qr_for_batch(batch, base_url)
                except Exception as e:
                    logger.error(f"QR failed for {batch.batch_id}: {str(e)}")

                # Genesis Block
                try:
                    if not get_last_block(batch.batch_id):
                        create_genesis_block(
                            batch_id=batch.batch_id,
                            transaction_data={
                                "batch_id": batch.batch_id,
                                "medicine_name": batch.name,
                                "manufacturer": user.username,
                                "manufacture_date": str(batch.manufacture_date),
                                "expiry_date": str(batch.expiry_date),
                                "quantity": batch.quantity,
                                "action": "GENESIS"
                            },
                            created_by=user
                        )
                except Exception as e:
                    logger.error(f"Genesis failed {batch.batch_id}: {str(e)}")

                created_batches.append({
                    "batch_id": batch.batch_id,
                    "medicine": batch.name
                })
            else:
                errors.append({
                    "index": index,
                    "errors": serializer.errors
                })

        return Response({
            "success": True,
            "created_batches": created_batches,
            "errors": errors
        }, status=201)

    except Exception as e:
        logger.error(f"Bulk batch error: {str(e)}")
        return Response({"detail": str(e)}, status=500)

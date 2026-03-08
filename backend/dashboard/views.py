from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


# ✅ DRAP Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def drap_dashboard(request):
    if request.user.role != "drap":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome DRAP Dashboard!"})


# ✅ Manufacturer Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manufacturer_dashboard(request):
    if request.user.role != "manufacturer":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Manufacturer Dashboard!"})


# ✅ Distributor Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def distributor_dashboard(request):
    if request.user.role != "distributor":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Distributor Dashboard!"})


# ✅ Warehouse Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def warehouse_dashboard(request):
    if request.user.role != "warehouse":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Warehouse Dashboard!"})


# ✅ Wholesaler Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wholesaler_dashboard(request):
    if request.user.role != "wholesaler":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Wholesaler Dashboard!"})


# ✅ Shopkeeper Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shopkeeper_dashboard(request):
    if request.user.role != "shopkeeper":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Shopkeeper Dashboard!"})


# ✅ Customer Dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):
    if request.user.role != "customer":
        return Response({"detail": "Not authorized"}, status=403)
    return Response({"message": "Welcome Customer Dashboard!"})

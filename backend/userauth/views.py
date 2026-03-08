# userauth/views.py

from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import CustomUser
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    MyTokenObtainPairSerializer
)
from .permissions import IsDRAPAdmin

# =====================================================
# COMMON RESPONSE HELPERS (STANDARD FORMAT)
# =====================================================
def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({
        "success": True,
        "message": message,
        "data": data
    }, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        "success": False,
        "message": message
    }, status=status_code)


# =====================================================
# JWT LOGIN
# =====================================================
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception:
            return error_response(
                "Invalid username or password",
                status.HTTP_401_UNAUTHORIZED
            )


# =====================================================
# DRAP ADMIN – REGISTER USERS (SINGLE / BULK)
# =====================================================
class AdminRegisterUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsDRAPAdmin]

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            many = isinstance(data, list)

            # Ensure role is explicitly set for each user
            if many:
                for user_data in data:
                    user_data['role'] = user_data.get('role', 'customer')
            else:
                data['role'] = data.get('role', 'customer')

            serializer = self.get_serializer(data=data, many=many)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return success_response(
                "User(s) created successfully",
                serializer.data,
                status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "error": str(e),
                    "details": serializer.errors if 'serializer' in locals() else None
                },
                status=400
            )


# =====================================================
# USER CRUD (ROLE-AWARE & SAFE)
# =====================================================
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = user.role.lower()

        # DRAP can see everyone
        if role == "drap":
            return CustomUser.objects.all()

        # Role visibility mapping
        ROLE_VISIBILITY = {
            "manufacturer": ["distributor"],
            "distributor": ["warehouse"],
            "warehouse": ["wholesaler"],
            "wholesaler": ["shopkeeper"],
            "shopkeeper": ["customer"],
        }

        allowed_roles = ROLE_VISIBILITY.get(role, [])
        if allowed_roles:
            return CustomUser.objects.filter(role__in=allowed_roles)

        # fallback → self only
        return CustomUser.objects.filter(id=user.id)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDRAPAdmin()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        try:
            user = self.get_object()

            # role change protection
            if "role" in request.data and request.user.role.lower() != "drap":
                return error_response(
                    "Role change not allowed",
                    status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return success_response(
                "User updated successfully",
                serializer.data
            )

        except CustomUser.DoesNotExist:
            return error_response(
                "User not found",
                status.HTTP_404_NOT_FOUND
            )
        except Exception:
            return error_response("User update failed")


# =====================================================
# CURRENT LOGGED-IN USER
# =====================================================
class CurrentUserView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return success_response(
            "Current user fetched",
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
            }
        )


# =====================================================
# ROLE-BASED DASHBOARDS
# =====================================================
class RoleDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    role_name = ""

    def get(self, request):
        if request.user.role.lower() != self.role_name:
            return error_response(
                "Not authorized",
                status.HTTP_403_FORBIDDEN
            )

        return success_response(
            f"Welcome to {self.role_name.capitalize()} Dashboard",
            {"phone": request.user.phone}
        )


class DRAPDashboardView(RoleDashboardView):
    role_name = "drap"


class ManufacturerDashboardView(RoleDashboardView):
    role_name = "manufacturer"


class DistributorDashboardView(RoleDashboardView):
    role_name = "distributor"


class WarehouseDashboardView(RoleDashboardView):
    role_name = "warehouse"


class WholesalerDashboardView(RoleDashboardView):
    role_name = "wholesaler"


class ShopkeeperDashboardView(RoleDashboardView):
    role_name = "shopkeeper"


class CustomerDashboardView(RoleDashboardView):
    role_name = "customer"


# =====================================================
# LOGOUT (JWT FRONTEND HANDLED)
# =====================================================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return success_response("Logged out successfully")

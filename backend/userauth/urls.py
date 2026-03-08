# userauth/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    MyTokenObtainPairView,
    CurrentUserView,
    AdminRegisterUserView,
    DRAPDashboardView,
    ManufacturerDashboardView,
    DistributorDashboardView,
    WarehouseDashboardView,
    WholesalerDashboardView,
    ShopkeeperDashboardView,
    CustomerDashboardView,
    UserViewSet,
    LogoutView,
)

app_name = "userauth"

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path("login/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("register/", AdminRegisterUserView.as_view(), name="register_user"),
    path("", include(router.urls)),
    path("dashboard/drap/", DRAPDashboardView.as_view(), name="drap_dashboard"),
    path("dashboard/manufacturer/", ManufacturerDashboardView.as_view(), name="manufacturer_dashboard"),
    path("dashboard/distributor/", DistributorDashboardView.as_view(), name="distributor_dashboard"),
    path("dashboard/warehouse/", WarehouseDashboardView.as_view(), name="warehouse_dashboard"),
    path("dashboard/wholesaler/", WholesalerDashboardView.as_view(), name="wholesaler_dashboard"),
    path("dashboard/shopkeeper/", ShopkeeperDashboardView.as_view(), name="shopkeeper_dashboard"),
    path("dashboard/customer/", CustomerDashboardView.as_view(), name="customer_dashboard"),
]

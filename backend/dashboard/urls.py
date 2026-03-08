from django.urls import path
from .views import (
    drap_dashboard,
    manufacturer_dashboard,
    distributor_dashboard,
    warehouse_dashboard,
    wholesaler_dashboard,
    shopkeeper_dashboard,
    customer_dashboard,
)

urlpatterns = [
    path('drap/', drap_dashboard, name='drap-dashboard'),
    path('manufacturer/', manufacturer_dashboard, name='manufacturer-dashboard'),
    path('distributor/', distributor_dashboard, name='distributor-dashboard'),
    path('warehouse/', warehouse_dashboard, name='warehouse-dashboard'),
    path('wholesaler/', wholesaler_dashboard, name='wholesaler-dashboard'),
    path('shopkeeper/', shopkeeper_dashboard, name='shopkeeper-dashboard'),
    path('customer/', customer_dashboard, name='customer-dashboard'),
]

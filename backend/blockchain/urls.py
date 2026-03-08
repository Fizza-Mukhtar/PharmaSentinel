# blockchain/urls.py
from django.urls import path
from .views import PublicBatchVerifyView, AdminChainTrailView, get_chain

app_name = "blockchain"

urlpatterns = [
    path("verify/<str:batch_id>/", PublicBatchVerifyView.as_view(), name="verify-batch"),
    path("admin-trail/<str:batch_id>/", AdminChainTrailView.as_view(), name="admin-trail"),
    path("history/<str:batch_id>/", get_chain, name="get-chain"),
] 
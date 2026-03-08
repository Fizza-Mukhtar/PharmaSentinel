from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("admin/", admin.site.urls),

    # ✅ Auth routes
    path("api/", include("userauth.urls")),

    # ✅ Dashboards
    path("api/dashboard/", include("dashboard.urls")),

    # ✅ Blockchain routes
    path("api/blockchain/", include("blockchain.urls", namespace="blockchain")),

    # ✅ Medicine routes - BOTH NEEDED
    path("medicine/", include("medicine.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
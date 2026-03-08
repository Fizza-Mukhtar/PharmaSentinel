from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .views import get_role

def role_required(allowed_roles):
    """
    Role-based access decorator for DRF views.

    Usage:
    @role_required(["MANUFACTURER", "DISTRIBUTOR"])
    def api_create_batch(request, ...):
        ...

    allowed_roles: list, set, or string
    """
    if isinstance(allowed_roles, str):
        allowed_roles = {allowed_roles}
    else:
        allowed_roles = set(allowed_roles)

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = getattr(request, "user", None)
            role = get_role(user) if user else None

            if not user or not user.is_authenticated:
                return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            if role not in allowed_roles:
                return Response({"detail": f"Forbidden for your role: {role}"}, status=status.HTTP_403_FORBIDDEN)

            return view_func(request, *args, **kwargs)

        return _wrapped_view
    return decorator

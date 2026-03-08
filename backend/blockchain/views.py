# blockchain/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import JsonResponse

from .models import BlockChainBlock
from .serializers import ChainVerifySerializer, BlockListItemSerializer
  # services se validation + full chain
# from .utils import is_chain_valid
from .services import validate_chain
from .models import get_full_chain_json



# -----------------------------
# Public QR verification endpoint
# -----------------------------
class PublicBatchVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, batch_id):
        valid, message = validate_chain(batch_id)
        blocks_qs = BlockChainBlock.get_chain_for_batch(batch_id)
        chain_length = blocks_qs.count()
        last_ts = blocks_qs.last().timestamp if chain_length else None

        detail = request.query_params.get("detail", "false").lower() in ("1", "true", "yes")

        result = {
            "valid": valid,
            "message": message,
            "chain_length": chain_length,
            "last_block_timestamp": last_ts,
        }

        if detail:
            trail = BlockListItemSerializer(blocks_qs, many=True).data
            result["trail"] = trail

        ser = ChainVerifySerializer(result)
        return Response(ser.data, status=status.HTTP_200_OK)


# -----------------------------
# Admin-only chain trail
# -----------------------------
class AdminChainTrailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, batch_id):
        blocks = BlockChainBlock.get_chain_for_batch(batch_id)
        payload = []
        for b in blocks:
            payload.append({
                "index": b.index,
                "timestamp": b.timestamp,
                "transaction_data": b.transaction_data,
                "hash": b.hash,
                "previous_hash": b.previous_hash,
                "server_signature": b.server_signature,
                "created_by": str(b.created_by) if b.created_by else None,
                "created_at": b.created_at,
            })
        return Response({"batch_id": batch_id, "chain_length": blocks.count(), "trail": payload})


# -----------------------------
# Full chain history endpoint (frontend friendly)
# -----------------------------
def get_chain(request, batch_id):
    """
    Returns full blockchain for a batch, using services.py helper
    """
    data = get_full_chain_json(batch_id)
    return JsonResponse(data)

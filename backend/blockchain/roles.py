# backend/blockchain/roles.py

ROLE_FLOW = [
    "manufacturer",
    "distributor",
    "warehouse",
    "wholesaler",
    "retailer",
    "customer"
]

def get_next_role(current_role: str) -> str:
    """
    Get the next allowed role in the supply chain.
    Example: manufacturer → distributor
    """
    if current_role not in ROLE_FLOW:
        return None
    index = ROLE_FLOW.index(current_role)
    if index + 1 < len(ROLE_FLOW):
        return ROLE_FLOW[index + 1]
    return None

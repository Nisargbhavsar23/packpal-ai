from enum import Enum


class TripRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class ItemPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ItemStatus(str, Enum):
    PENDING = "PENDING"
    PACKED = "PACKED"
    DELIVERED = "DELIVERED"

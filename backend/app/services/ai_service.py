class MockAIService:
    """Phase 1 mock provider used until Gemini and Ollama integrations are added."""

    def generate_packing_list(self, trip_context: dict | None = None) -> dict:
        return {
            "provider": "mock",
            "items": [
                {"name": "Passport or ID", "category": "Documents", "quantity": 1},
                {"name": "Reusable water bottle", "category": "Essentials", "quantity": 1},
                {"name": "Weather-appropriate clothing", "category": "Clothing", "quantity": 3},
            ],
            "notes": "Mock packing list generated for Phase 1.",
        }

    def suggest_assignments(self, members: list[dict] | None = None, items: list[dict] | None = None) -> dict:
        return {
            "provider": "mock",
            "assignments": [
                {"item": "First aid kit", "assigned_to": "Trip Lead"},
                {"item": "Snacks", "assigned_to": "Logistics Member"},
            ],
            "notes": "Mock assignments are placeholders for future AI logic.",
        }

    def find_missing_items(self, checklist: list[dict] | None = None) -> dict:
        return {
            "provider": "mock",
            "missing_items": [
                {"name": "Phone charger", "category": "Electronics"},
                {"name": "Emergency contacts", "category": "Documents"},
            ],
            "notes": "Mock missing item scan completed.",
        }

    def generate_trip_summary(self, trip: dict | None = None) -> dict:
        return {
            "provider": "mock",
            "summary": "Your group checklist is ready for review.",
            "stats": {
                "total_items": 12,
                "packed_items": 5,
                "pending_items": 7,
            },
        }


ai_service = MockAIService()

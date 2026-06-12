# PackPal AI Backend

FastAPI backend for PackPal AI.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Health Checks

- `GET /health`
- `GET /api/v1/health`

Both endpoints return the same backend status response.

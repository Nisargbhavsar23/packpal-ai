# PackPal AI

PackPal AI is a full-stack travel logistics platform for organizing group packing across trips, events, college tours, treks, hackathons, and vacations.

Phase 1 creates a clean starter foundation with a FastAPI backend, React frontend, environment configuration, database configuration, health checks, and a mock AI service.

## Tech Stack

- Backend: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic Settings
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Future AI Providers: mock, Gemini, Ollama

## Planned Features

- Trip creation and member invitations
- Role-based collaboration
- Categorized packing checklists
- Item assignment and status tracking
- Real-time updates
- AI-generated packing lists
- PDF checklist export

## Roadmap

- Phase 1: Project scaffold, health checks, environment config, database setup, mock AI service, basic frontend pages
- Phase 2: Database models, migrations, and CRUD APIs for trips, members, categories, and items
- Phase 3: JWT authentication and protected frontend routes
- Phase 4: Checklist assignment workflows and status tracking
- Phase 5: WebSocket-powered real-time updates
- Phase 6: PDF export
- Phase 7: Gemini integration with Ollama fallback

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Health endpoints:

- `http://localhost:8000/health`
- `http://localhost:8000/api/v1/health`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Environment Variables

Copy each `.env.example` file before running the apps:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `DATABASE_URL` when your PostgreSQL username, password, host, port, or database name differs from the default.

## Future AI Integration Plan

Phase 1 uses a mock AI provider only. In a later AI phase, PackPal AI will add Gemini as the primary provider using `gemini-3.1-flash-lite`, with Ollama as a local fallback provider using `llama3.2`.

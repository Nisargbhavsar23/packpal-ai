# PackPal AI

> **AI-powered Travel Readiness Platform for individuals and groups**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

PackPal AI is a full-stack, portfolio-grade travel readiness platform that combines **Gemini AI**, **real-time weather data**, and **collaborative checklists** to give travel groups everything they need from packing plan to PDF export.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PackPal AI                                  │
│                                                                     │
│  ┌──────────────────┐         ┌──────────────────────────────────┐  │
│  │   React Frontend │◄──────►│         FastAPI Backend           │  │
│  │  (Vite + Tailwind)│  REST  │  (Python 3.12 + SQLAlchemy)      │  │
│  └──────────────────┘         └──────────┬───────────────────────┘  │
│                                          │                          │
│                          ┌───────────────▼──────────────┐          │
│                          │        PostgreSQL DB           │          │
│                          │  trips · items · members ·    │          │
│                          │  ai_suggestions · users       │          │
│                          └──────────────────────────────┘          │
│                                          │                          │
│                          ┌───────────────▼──────────────┐          │
│                          │         AI Layer               │          │
│                          │  GeminiAIProvider              │          │
│                          │  MockAIProvider (fallback)    │          │
│                          └──────────────────────────────┘          │
│                                          │                          │
│                          ┌───────────────▼──────────────┐          │
│                          │    External APIs               │          │
│                          │  Google Gemini · Open-Meteo   │          │
│                          └──────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Authentication & Security
- Register / Login with JWT access tokens
- Forgot password & secure token-based password reset
- Session persistence with `localStorage`

### Trip Management
- Create, edit, and delete trips
- Set destination, trip type, date range, and description
- Multi-member trip collaboration (OWNER / ADMIN / MEMBER roles)
- Invite members by email address

### Packing Checklist
- Add items with category, priority, quantity, due date, and notes
- Assign items to group members
- Update item status: PENDING → PACKED → DELIVERED
- Filter by category, priority, status, or assigned member
- Item detail modal with full history

### AI Assistant (8 Features, Gemini Powered)

| Feature | Description |
|---|---|
| 🤖 Packing List | Generate destination + weather-aware packing suggestions |
| 🔍 Missing Essentials | Detect gaps in your checklist based on trip context |
| 📊 Trip Summary | AI-generated readiness summary with member breakdown |
| 💬 Ask Assistant | Free-form question answering about your trip logistics |
| 🌍 Destination Insights | Local tips, cultural notes, safety reminders |
| 📡 Travel Readiness | Category-level readiness scores with risk analysis |
| 👥 Group AI | Duplicate detection, load balancing, group readiness |
| 💰 Budget Planner | AI cost estimates across 7 categories in 6 currencies |

### Export & Reports
- PDF trip report with checklist, member assignments, and AI recommendations
- Generated with ReportLab (zero cloud dependency)

### User Experience
- Light / Dark / System theme with real-time persistence
- Fully responsive (mobile, tablet, desktop)
- Skeleton loaders and micro-animations
- Real-time weather context (Open-Meteo API)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | FastAPI 0.115 + Python 3.12 | REST API, business logic |
| ORM | SQLAlchemy 2.0 + Alembic | Database models and migrations |
| Database | PostgreSQL 16 (psycopg3) | Persistent storage |
| Auth | JWT (python-jose) + passlib | Secure authentication |
| AI | Google Gemini 2.0 Flash Lite | AI feature generation |
| Weather | Open-Meteo API | Free, no-key weather forecasts |
| PDF | ReportLab | Trip report PDF generation |
| Frontend | React 18 + Vite 6 | Component-based UI |
| Styling | TailwindCSS 3.4 | Utility-first CSS |
| Routing | React Router 7 | Client-side SPA routing |
| HTTP | Axios | API client with interceptors |

---

## Project Structure

```
PACKPAL_AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints (ai, auth, trips, items, ...)
│   │   ├── core/            # Config, security, JWT
│   │   ├── db/              # Database session and base
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic layer
│   │   │   ├── ai_provider.py          # Gemini + Mock AI providers
│   │   │   ├── ai_assistant_service.py # AI orchestration layer
│   │   │   ├── ai_prompt_service.py    # Prompt builders + JSON contracts
│   │   │   ├── readiness_engine.py     # Deterministic readiness scoring
│   │   │   ├── travel_context_service.py # Trip context builder
│   │   │   ├── weather_service.py      # Open-Meteo integration
│   │   │   └── pdf_export_service.py   # ReportLab PDF generation
│   │   └── utils/           # Shared utilities (time, etc.)
│   ├── alembic/             # Database migrations
│   ├── .env.example         # Environment variable template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client functions
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── layouts/         # MainLayout with Navbar
│   │   ├── pages/           # Route-level page components
│   │   └── routes/          # React Router configuration
│   └── package.json
└── README.md
```

---

## Installation

### Prerequisites

- **Python 3.12+**
- **Node.js 20+** and npm
- **PostgreSQL 14+**
- **Google Gemini API Key** — [Get one free here](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Nisargbhavsar25/packpal-ai.git
cd packpal-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:yourpassword@localhost:5432/packpal_ai
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_strong_random_secret_key
```

```bash
# Create the database
createdb packpal_ai  # or use psql

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string (psycopg3 driver) |
| `GEMINI_API_KEY` | — | Google Gemini API key (required for AI features) |
| `GEMINI_MODEL` | `gemini-2.0-flash-lite` | Gemini model to use |
| `AI_TEMPERATURE` | `0.3` | AI generation temperature (0.0–1.0) |
| `AI_PROVIDER` | `gemini` | AI provider: `gemini` or `mock` |
| `JWT_SECRET_KEY` | — | Random secret for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiry time in minutes |
| `BACKEND_CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |
| `SMTP_HOST` | `""` | SMTP server hostname (blank = dev mode, reset link in API response) |
| `SMTP_PORT` | `587` | SMTP server port (587 = STARTTLS, 465 = SSL) |
| `SMTP_USERNAME` | `""` | SMTP username / sender address |
| `SMTP_PASSWORD` | `""` | SMTP password or app password |
| `SMTP_FROM_EMAIL` | `""` | From address for outbound emails |
| `SMTP_FROM_NAME` | `PackPal AI` | Display name for outbound emails |
| `SMTP_USE_TLS` | `true` | Use STARTTLS (false = plain SMTP or SMTP_SSL on port 465) |
| `SMTP_TIMEOUT` | `10` | SMTP connection timeout in seconds |

---

## Email — Password Reset

PackPal AI uses Python's built-in `smtplib` for email delivery (no extra pip dependency).

### Development mode (default)
When `SMTP_HOST` is blank, the reset token and URL are returned directly in the API response and shown on the Forgot Password page. No email is sent.

### Production mode (real email)
Set all four required vars (`SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`) and the system automatically:
1. Generates a secure token and stores its SHA-256 hash in the database
2. Sends an HTML + plain-text email with the reset link
3. Hides the token from the API response

**Gmail setup:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # 16-char Google App Password
SMTP_FROM_EMAIL=you@gmail.com
SMTP_USE_TLS=true
```

> [!IMPORTANT]
> For Gmail you must use an **App Password**, not your login password. Enable 2FA on your Google account, then visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM_EMAIL=noreply@yourdomain.com
```


## AI Features Deep Dive

### How Context is Built

Every AI call in PackPal builds a rich context object containing:
- Trip details (destination, dates, type, duration)
- Current weather forecast (via Open-Meteo)
- Full checklist with statuses and assignments
- Group member list
- Checklist summary (total, packed, pending, readiness %)

This context ensures every AI response is **destination-aware**, **weather-aware**, and **checklist-aware**.

### AI Provider Pattern

```python
# BaseAIProvider (abstract)
class BaseAIProvider(ABC):
    def generate_packing_list(context, request_data) -> dict
    def find_missing_essentials(context, request_data) -> dict
    def generate_trip_summary(context, request_data) -> dict
    def ask_assistant(context, request_data) -> dict
    def generate_destination_insights(context, request_data) -> dict
    def analyze_travel_readiness(context, request_data) -> dict
    def analyze_group_packing(context, request_data) -> dict
    def generate_budget_plan(context, request_data) -> dict

# Implementations
class GeminiAIProvider(BaseAIProvider): ...  # Uses Google Gemini API
class MockAIProvider(BaseAIProvider): ...    # Deterministic fallback
```

### Budget Planner

Estimates costs across 7 categories in 6 currencies (INR, USD, EUR, GBP, AED, SGD):
- Accommodation, Food, Transportation, Activities, Shopping, Miscellaneous, Emergency Buffer
- Destination multipliers (Maldives/Switzerland = 4.5x, Japan/Dubai = 3x, Goa = 1.2x)
- Budget styles: budget, mid-range, premium

### Group Packing Analysis

- **Duplicate Detection**: Finds items with the same name assigned to multiple members
- **Load Balancing**: Compares per-member item count vs. group average; flags Overloaded/Underloaded
- **Group Readiness Score**: Aggregate packed/delivered ratio across all members
- **Unassigned Essentials**: Alerts when critical items (passport, first aid, etc.) have no owner

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, receive JWT |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/trips` | Create trip |
| GET | `/api/v1/trips` | List user's trips |
| GET | `/api/v1/trips/{id}` | Get trip detail |
| PUT | `/api/v1/trips/{id}` | Update trip |
| DELETE | `/api/v1/trips/{id}` | Delete trip |
| GET | `/api/v1/trips/{id}/items` | List checklist items |
| POST | `/api/v1/trips/{id}/items` | Add checklist item |
| POST | `/api/v1/trips/{id}/ai/packing-list` | Generate packing list |
| POST | `/api/v1/trips/{id}/ai/missing-essentials` | Find missing essentials |
| POST | `/api/v1/trips/{id}/ai/trip-summary` | Generate trip summary |
| POST | `/api/v1/trips/{id}/ai/ask` | Ask AI assistant |
| GET | `/api/v1/trips/{id}/ai/destination-insights` | Get destination insights |
| GET | `/api/v1/trips/{id}/ai/readiness` | Travel readiness dashboard |
| GET | `/api/v1/trips/{id}/ai/group-packing` | Group packing analysis |
| POST | `/api/v1/trips/{id}/ai/budget-plan` | Generate budget plan |
| POST | `/api/v1/trips/{id}/ai/apply-items` | Add AI suggestions to checklist |
| GET | `/api/v1/trips/{id}/export/pdf` | Export trip PDF |

Full interactive docs: `http://localhost:8000/docs`

---

## Future Roadmap

- [ ] Email notifications for trip reminders
- [ ] Shareable trip invite links
- [ ] AI-powered travel timeline builder
- [ ] Currency exchange rate API integration
- [ ] Mobile app (React Native)
- [ ] Collaborative real-time editing (WebSockets)

---

## Contributing

This is a portfolio project. PRs, issues, and forks are welcome.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ as a portfolio project demonstrating AI Engineering, Full Stack Development, and Product Design.*

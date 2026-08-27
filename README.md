# ChinaTravel - China Travel Community for International Visitors

A modern web application for international travelers visiting China.

## Project Structure

```
china-travel/
├── backend/          # Python FastAPI backend
├── frontend/         # Next.js frontend
├── docker-compose.yml
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Deployment**: Vercel (frontend) + Railway (backend)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### Local Development

```bash
# Start all services
docker-compose up -d

# Or run individually:
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` in backend and frontend directories.

## License

MIT

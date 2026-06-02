# ✦ AstroAgent

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent_Framework-1C3C3C?style=flat&logo=langchain&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3_70B-F55036?style=flat)
![Swiss Ephemeris](https://img.shields.io/badge/Swiss_Ephemeris-Real_Astro_Data-8B6914?style=flat)
![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-FF6F00?style=flat)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Mgmt-443E38?style=flat)

A conversational AI astrology companion built with LangGraph (Python) and React. Users share their birth details and can then ask questions like *"What does my chart say about my career?"* or *"What's the energy for me today?"*. The agent reasons in steps, calls real astronomical tools, and responds with warmth and care.

---

## Architecture Overview

```
User → React Frontend (Vite + TypeScript)
          │
          ▼  REST / SSE
    FastAPI Backend
          │
          ▼
   ┌─────────────────────────────┐
   │        LangGraph Agent      │
   │                             │
   │  ┌──────────────────────┐   │
   │  │   router_node        │   │  ← Classifies intent (chart / horoscope / question)
   │  └────────┬─────────────┘   │
   │           ▼                 │
   │  ┌──────────────────────┐   │
   │  │   reasoner_node      │   │  ← Groq LLM (llama3-70b) decides tool calls + response
   │  └────────┬─────────────┘   │
   │           │ tool_calls?     │
   │    yes ◄──┤                 │
   │           │                 │
   │  ┌────────▼─────────────┐   │
   │  │   tool_node          │   │  ← Runs chosen tools, returns results
   │  └────────┬─────────────┘   │
   │           │                 │
   │    loop ◄─┘ (back to reasoner, max 8 iterations)
   │           │ no tool calls   │
   │  ┌────────▼─────────────┐   │
   │  │   editor_node        │   │  ← Softens tone for warmth and empathy
   │  └──────────────────────┘   │
   └─────────────────────────────┘
          │
          ▼  SSE events (text / tool_call / done)
   React Frontend streams response token-by-token
```

### LangGraph Graph Diagram

```
START
  │
  ▼
router_node ──────────────────────────────────▶ reasoner_node
                                                       │
                                          has_tool_calls?
                                          ┌─────────────────┐
                                     yes  │                 │ no
                                          ▼                 ▼
                                      tool_node        editor_node
                                          │                 │
                                          └──────▶ reasoner_node  ──▶ END
                                                   (max 8 iterations)
```

---

## Project Structure

```
astroagent/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── main.py          # FastAPI app entry point
│   │   │   ├── routes.py        # /api/chart, /api/chat, /api/transits
│   │   │   └── streaming.py     # SSE streaming generator
│   │   ├── agent/
│   │   │   ├── graph.py         # LangGraph graph construction
│   │   │   ├── nodes.py         # router_node, reasoner_node, editor_node
│   │   │   ├── router.py        # should_continue() routing logic
│   │   │   ├── prompts.py       # System prompts for all nodes
│   │   │   └── state.py         # AstroAgentState TypedDict
│   │   └── tools/
│   │       ├── compute_birth_chart.py   # Natal chart via immanuel/pyswisseph
│   │       ├── get_daily_transits.py    # Transit aspects to natal chart
│   │       ├── geocode_place.py         # Place → lat/lng/timezone via Nominatim
│   │       └── knowledge_lookup.py      # RAG via ChromaDB + sentence-transformers
│   ├── data/
│   │   └── astro_knowledge/
│   │       └── reference_notes.md       # Curated astrology knowledge base
│   ├── evals/
│   │   ├── golden_set/
│   │   │   └── golden_set_v1.jsonl      # 25 versioned test cases
│   │   ├── results/                     # Eval run JSON outputs
│   │   ├── judge.py                     # LLM-as-judge (Groq + structured output)
│   │   ├── runner.py                    # Eval harness (one-command)
│   │   └── scorecard.py                 # Scorecard printer (p50/p95 latency, etc.)
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── OnboardingPage.tsx       # Birth details form with validation
        │   ├── ChartPage.tsx            # Natal chart display
        │   └── ChatPage.tsx             # Streaming chat interface
        └── components/                 # Shared UI components
```

---

## Setup Instructions

### Prerequisites
- Python 3.11+ (3.12 works)
- Node.js 18+
- A [Groq](https://console.groq.com) API key (free tier is sufficient)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in your environment variables
copy .env.example .env
# Edit .env: set GROQ_API_KEY=your_key_here

# Run the backend
uvicorn app.api.main:app --reload
```

The API will be available at `http://localhost:8000`.

> **Note on ephemeris files:** The `immanuel` library ships its own Swiss Ephemeris data files. The `compute_birth_chart.py` and `get_daily_transits.py` tools automatically configure the correct path at import time — no manual setup is required.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Running the Evaluation Suite

```bash
cd backend
.venv\Scripts\activate

# Run the full evaluation harness (one command)
python -m evals.runner
```

This will:
1. Run all 25 golden-set test cases against the live agent
2. Use LLM-as-judge for qualitative scoring (warmth, accuracy, safety)
3. Print a scorecard with pass rates, p50/p95 latency, and failure rate
4. Save a timestamped JSON results file to `evals/results/`

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key | Required |
| `LLM_MODEL` | Main reasoner model | `llama3-70b-8192` |
| `ROUTER_MODEL` | Intent classifier model | `llama3-8b-8192` |
| `CHROMA_DB_PATH` | Path to ChromaDB persistence | `./data/chromadb` |

---

## Agent Tools

| Tool | What it does |
|---|---|
| `geocode_place()` | Converts a city/place name → lat, lng, IANA timezone using OpenStreetMap Nominatim |
| `compute_birth_chart()` | Calculates natal planetary positions and houses using Swiss Ephemeris (via `immanuel`) |
| `get_daily_transits()` | Computes current planetary positions and their aspects to the natal chart |
| `knowledge_lookup()` | RAG search over curated astrology reference notes using ChromaDB + sentence-transformers |

---

## Known Limitations

- **Persistent checkpointing:** Conversations are persisted with LangGraph's `SqliteSaver` (file-backed at `data/checkpoints.sqlite`). This survives server restarts but does not scale to multi-server deployments; a Redis or Postgres backend would be needed for production.
- **Cost estimates:** The eval scorecard uses a placeholder cost estimate per run. Groq's API does not expose token counts via simple `invoke()` — a callback handler would be needed for precise tracking.
- **Transit calculation:** The current `get_daily_transits` implementation computes aspects mathematically from position data. A more sophisticated implementation could use immanuel's built-in aspect calculation.
- **Mobile layout:** The frontend is responsive but has not been exhaustively tested on all small mobile screens.

---

## Safety Guardrails

The agent is instructed with explicit hard rules in its system prompt:
- Never give medical diagnoses or health predictions
- Never give financial or investment advice
- Never give legal advice
- Always frame readings as tendencies and invitations for reflection, never certainties

These guardrails are tested in the evaluation suite (TC22–TC25, the adversarial category).

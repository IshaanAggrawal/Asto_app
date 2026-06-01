import app.ephe_bootstrap  # noqa: F401 — must be first; sets pyswisseph ephe path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

from app.api.routes import router
from app.tools.knowledge_lookup import _get_collection

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AstroAgent API", description="Backend for AstroAgent conversational astrology app")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """
    Warms up the ChromaDB knowledge base on startup.
    Note: pyswisseph ephemeris path is already bootstrapped at import time
    inside compute_birth_chart.py and get_daily_transits.py — no need to set
    it here again.
    """
    logger.info("Starting up AstroAgent API...")
    try:
        _get_collection()
        logger.info("Knowledge base initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base on startup: {e}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}


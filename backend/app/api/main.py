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
    """Warms up the ChromaDB collection on startup."""
    logger.info("Starting up AstroAgent API...")
    try:
        # Call the private function to initialize the DB and embed documents if necessary
        _get_collection()
        logger.info("Knowledge base initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base on startup: {e}")
        
    try:
        from immanuel.setup import settings
        import swisseph as swe
        # Explicitly set the path to the correct absolute path
        swe.set_ephe_path(settings._file_path)
        logger.info(f"Explicitly configured swisseph path to: {settings._file_path}")
    except Exception as e:
        logger.error(f"Failed to configure swisseph: {e}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

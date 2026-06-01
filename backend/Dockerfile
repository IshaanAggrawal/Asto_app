FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by ChromaDB (hnswlib) and others
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Pre-download the HuggingFace embedding model so it doesn't delay startup
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Create a data directory for ChromaDB
RUN mkdir -p /app/data/chromadb
ENV CHROMA_DB_PATH=/app/data/chromadb

# Expose the default port (Render will override this via the PORT environment variable)
EXPOSE 8000

# Run the FastAPI server using the PORT environment variable (fallback to 8000 for local dev)
CMD uvicorn app.api.main:app --host 0.0.0.0 --port ${PORT:-8000}

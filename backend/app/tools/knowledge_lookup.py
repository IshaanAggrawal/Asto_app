import os
from langchain_core.tools import tool
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Module-level singleton
_collection = None

def _get_collection():
    global _collection
    if _collection is None:
        try:
            load_dotenv()
            db_path = os.getenv("CHROMA_DB_PATH", "./data/chromadb")
            os.makedirs(db_path, exist_ok=True)
            
            client = chromadb.PersistentClient(path=db_path)
            
            # Use sentence-transformers
            sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            _collection = client.get_or_create_collection(
                name="astro_knowledge",
                embedding_function=sentence_transformer_ef
            )
            
            # Check if we need to populate
            if _collection.count() == 0:
                logger.info("Populating ChromaDB with astrology knowledge...")
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
                notes_path = os.path.join(base_dir, "data", "astro_knowledge", "reference_notes.md")
                
                if os.path.exists(notes_path):
                    with open(notes_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    # Split by "---" separator
                    chunks = [chunk.strip() for chunk in content.split("---") if chunk.strip()]
                    
                    ids = [f"doc_{i}" for i in range(len(chunks))]
                    _collection.add(
                        documents=chunks,
                        ids=ids
                    )
                    logger.info(f"Added {len(chunks)} entries to knowledge base.")
                else:
                    logger.warning(f"Knowledge base file not found at {notes_path}")
                    
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {e}")
            raise e
            
    return _collection

@tool
def knowledge_lookup(query: str) -> str:
    """Search the astrology knowledge base for interpretations, meanings, and guidance."""
    try:
        collection = _get_collection()
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        
        if not results['documents'] or not results['documents'][0]:
            return "No relevant information found in the knowledge base."
            
        # Combine the top 3 results
        combined_results = "\n\n".join(results['documents'][0])
        return combined_results
        
    except Exception as e:
        logger.error(f"Error in knowledge lookup: {e}")
        return f"An error occurred while searching the knowledge base: {str(e)}"

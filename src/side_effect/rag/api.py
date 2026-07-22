import os
from dataclasses import asdict
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.side_effect.embedding_and_keywords import BioBERTEmbedder

from .providers import GeminiProvider
from .retriever import FAISSRetriever
from .service import RAGService


class QueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    drug: Optional[str] = None
    side_effect: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=10)


app = FastAPI(title="Side Effect RAG API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("RAG_ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@lru_cache(maxsize=1)
def get_service() -> RAGService:
    index_dir = os.getenv("RAG_INDEX_DIR", "artifacts/rag")
    if not Path(index_dir, "reviews.faiss").exists():
        raise RuntimeError(
            f"RAG index not found at {index_dir}. Run the build-rag-index command first."
        )
    embedder = BioBERTEmbedder(os.getenv("EMBEDDING_MODEL", "dmis-lab/biobert-base-cased-v1.2"))
    return RAGService(
        FAISSRetriever(embedder, index_dir),
        GeminiProvider(),
        minimum_score=float(os.getenv("RAG_MINIMUM_SCORE", "0.35")),
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/rag/query")
def query(request: QueryRequest):
    try:
        return asdict(
            get_service().answer(
                question=request.question,
                drug=request.drug,
                side_effect=request.side_effect,
                top_k=request.top_k,
            )
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

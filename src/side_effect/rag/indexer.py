import json
from pathlib import Path
from typing import Iterable

import numpy as np

from .documents import write_jsonl
from .schemas import Document


class FAISSIndexer:
    def __init__(self, embedder):
        self.embedder = embedder

    def build(self, documents: Iterable[Document], output_dir: str, batch_size=16):
        try:
            import faiss
        except ImportError as exc:
            raise RuntimeError("Install faiss-cpu before building the RAG index") from exc

        documents = list(documents)
        if not documents:
            raise ValueError("No documents were supplied for indexing")
        vectors = np.asarray(
            self.embedder.embed_documents(
                [document.text for document in documents], batch_size=batch_size
            ),
            dtype="float32",
        )
        faiss.normalize_L2(vectors)
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)

        target = Path(output_dir)
        target.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(target / "reviews.faiss"))
        write_jsonl(documents, str(target / "documents.jsonl"))
        manifest = {
            "document_count": len(documents),
            "dimensions": int(vectors.shape[1]),
            "metric": "cosine",
            "index_type": "IndexFlatIP",
        }
        (target / "manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8"
        )
        return manifest

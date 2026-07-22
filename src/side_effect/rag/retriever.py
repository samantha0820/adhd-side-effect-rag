import json
from pathlib import Path
from typing import List, Optional

import numpy as np

from .schemas import Document, SearchResult


class FAISSRetriever:
    def __init__(self, embedder, index_dir: str):
        try:
            import faiss
        except ImportError as exc:
            raise RuntimeError("Install faiss-cpu before using retrieval") from exc

        self._faiss = faiss
        self.embedder = embedder
        root = Path(index_dir)
        self.index = faiss.read_index(str(root / "reviews.faiss"))
        with (root / "documents.jsonl").open(encoding="utf-8") as handle:
            self.documents = [Document.from_dict(json.loads(line)) for line in handle]

    def search(
        self,
        query: str,
        top_k: int = 5,
        drug: Optional[str] = None,
        side_effect: Optional[str] = None,
    ) -> List[SearchResult]:
        query_vector = np.asarray([self.embedder.embed_query(query)], dtype="float32")
        self._faiss.normalize_L2(query_vector)
        # IndexFlatIP cannot apply metadata filters during search. When a filter
        # is present, score the full collection before filtering; otherwise a
        # drug can be absent from the global top-N and incorrectly look like it
        # has no evidence at all.
        if drug or side_effect:
            candidate_k = len(self.documents)
        else:
            candidate_k = min(len(self.documents), max(top_k * 10, top_k))
        scores, indexes = self.index.search(query_vector, candidate_k)
        drug_filter = drug.strip().lower() if drug else None
        effect_filter = side_effect.strip().lower() if side_effect else None
        results = []
        for score, index in zip(scores[0], indexes[0]):
            if index < 0:
                continue
            document = self.documents[int(index)]
            if drug_filter and document.drug != drug_filter:
                continue
            if effect_filter and document.side_effect != effect_filter:
                continue
            results.append(SearchResult(document=document, score=float(score)))
            if len(results) == top_k:
                break
        return results

import numpy as np

from src.side_effect.rag.retriever import FAISSRetriever
from src.side_effect.rag.schemas import Document


class FakeFAISS:
    @staticmethod
    def normalize_L2(vector):
        return None


class FakeIndex:
    def __init__(self):
        self.requested_k = None

    def search(self, query, candidate_k):
        self.requested_k = candidate_k
        scores = np.array([[0.9, 0.8, 0.7]], dtype="float32")
        indexes = np.array([[0, 1, 2]])
        return scores, indexes


class FakeEmbedder:
    def embed_query(self, query):
        return np.array([1.0], dtype="float32")


def test_filtered_search_scores_full_collection():
    retriever = object.__new__(FAISSRetriever)
    retriever._faiss = FakeFAISS()
    retriever.embedder = FakeEmbedder()
    retriever.index = FakeIndex()
    retriever.documents = [
        Document("a", "A", "adderall"),
        Document("b", "B", "ritalin"),
        Document("v", "V", "vyvanse"),
    ]

    results = retriever.search("side effects", top_k=1, drug="Vyvanse")

    assert retriever.index.requested_k == len(retriever.documents)
    assert [result.document.id for result in results] == ["v"]

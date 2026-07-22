import json

from src.side_effect.rag.documents import documents_from_reviews_json
from src.side_effect.rag.schemas import Document, SearchResult
from src.side_effect.rag.service import RAGService
from src.side_effect.rag.providers import ProviderUnavailableError


class FakeRetriever:
    def __init__(self, results):
        self.results = results

    def search(self, *args, **kwargs):
        return self.results


class FakeProvider:
    model = "fake-model"

    def generate(self, question, evidence):
        return "Reported insomnia [1]."


class UnavailableProvider(FakeProvider):
    def generate(self, question, evidence):
        raise ProviderUnavailableError("Gemini generation failed: RESOURCE_EXHAUSTED")


def test_documents_from_reviews_json(tmp_path):
    source = tmp_path / "reviews.json"
    source.write_text(
        json.dumps(
            [{"drugName": "Adderall", "sideEffects": {"Insomnia": ["Could not sleep"]}}]
        ),
        encoding="utf-8",
    )
    documents = documents_from_reviews_json(str(source))
    assert len(documents) == 1
    assert documents[0].drug == "adderall"
    assert documents[0].side_effect == "insomnia"
    assert documents[0].id


def test_service_returns_citations():
    document = Document(
        id="doc-1", text="Could not sleep", drug="adderall", side_effect="insomnia"
    )
    service = RAGService(
        FakeRetriever([SearchResult(document=document, score=0.8)]), FakeProvider()
    )
    answer = service.answer("Does it affect sleep?", drug="adderall")
    assert answer.answer == "Reported insomnia [1]."
    assert answer.citations[0]["document_id"] == "doc-1"
    assert not answer.insufficient_evidence


def test_service_skips_llm_when_evidence_is_weak():
    document = Document(id="doc-1", text="Unrelated", drug="adderall")
    service = RAGService(
        FakeRetriever([SearchResult(document=document, score=0.1)]), FakeProvider()
    )
    answer = service.answer("Does it affect sleep?")
    assert answer.insufficient_evidence
    assert answer.citations == []


def test_service_falls_back_to_retrieval_when_provider_is_unavailable():
    document = Document(
        id="doc-1", text="Could not sleep", drug="adderall", side_effect="insomnia"
    )
    service = RAGService(
        FakeRetriever([SearchResult(document=document, score=0.8)]),
        UnavailableProvider(),
    )
    answer = service.answer("Does it affect sleep?")
    assert "insomnia" in answer.answer
    assert answer.generation_warning == "Gemini generation failed: RESOURCE_EXHAUSTED"
    assert answer.citations

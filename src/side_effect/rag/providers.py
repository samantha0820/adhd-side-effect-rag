import os
from abc import ABC, abstractmethod
from typing import Sequence

from .schemas import SearchResult


SYSTEM_PROMPT = """You answer questions about ADHD medication side effects.
Use only the supplied evidence. User reviews are anecdotal and cannot establish
causation or replace professional medical advice. Cite evidence using [1], [2],
and so on. If the evidence does not answer the question, explicitly say that
there is insufficient evidence. Never invent a source or medical conclusion.
Answer in the same language as the user's question."""


class ProviderUnavailableError(RuntimeError):
    """Raised when the configured LLM provider cannot generate a response."""


class LLMProvider(ABC):
    @property
    @abstractmethod
    def model(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate(self, question: str, evidence: Sequence[SearchResult]) -> str:
        raise NotImplementedError


class GeminiProvider(LLMProvider):
    def __init__(self, model=None, client=None):
        try:
            from google import genai
        except ImportError as exc:
            raise RuntimeError("Install google-genai to use the Gemini provider") from exc
        configured_model = model or os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        api_key = (os.getenv("GEMINI_API_KEY") or "").strip().strip("\"'")
        self._model = configured_model.strip().strip("\"'")
        self.client = client or genai.Client(api_key=api_key or None)

    @property
    def model(self) -> str:
        return self._model

    def generate(self, question: str, evidence: Sequence[SearchResult]) -> str:
        from google.genai import errors, types

        context = "\n\n".join(
            "[{number}] drug={drug}; side_effect={effect}; source={source}\n{text}".format(
                number=number,
                drug=result.document.drug,
                effect=result.document.side_effect or "unknown",
                source=result.document.source,
                text=result.document.text,
            )
            for number, result in enumerate(evidence, start=1)
        )
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=f"Question:\n{question}\n\nEvidence:\n{context}",
                config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            )
        except errors.APIError as exc:
            code = getattr(exc, "code", None) or exc.__class__.__name__
            raise ProviderUnavailableError(f"Gemini generation failed: {code}") from exc
        if not response.text:
            raise ProviderUnavailableError("Gemini generation returned no text")
        return response.text

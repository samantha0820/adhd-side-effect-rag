from typing import Optional

from .schemas import RAGAnswer
from .providers import ProviderUnavailableError


class RAGService:
    def __init__(self, retriever, provider, minimum_score=0.35):
        self.retriever = retriever
        self.provider = provider
        self.minimum_score = minimum_score

    def answer(
        self,
        question: str,
        drug: Optional[str] = None,
        side_effect: Optional[str] = None,
        top_k: int = 5,
    ) -> RAGAnswer:
        results = self.retriever.search(
            question, top_k=top_k, drug=drug, side_effect=side_effect
        )
        relevant = [result for result in results if result.score >= self.minimum_score]
        citations = [
            {
                "number": number,
                "document_id": result.document.id,
                "excerpt": result.document.text,
                "drug": result.document.drug,
                "side_effect": result.document.side_effect,
                "source": result.document.source,
                "score": round(result.score, 4),
            }
            for number, result in enumerate(relevant, start=1)
        ]
        if not relevant:
            return RAGAnswer(
                answer="The indexed sources do not contain enough relevant evidence to answer this question.",
                citations=[],
                insufficient_evidence=True,
                model=None,
            )
        try:
            generated_answer = self.provider.generate(question, relevant)
            model = self.provider.model
            generation_warning = None
        except ProviderUnavailableError as exc:
            effects = []
            for result in relevant:
                effect = result.document.side_effect
                if effect and effect not in effects:
                    effects.append(effect)
            mentioned = ", ".join(effects) if effects else "the cited user experiences"
            generated_answer = (
                f"Retrieved user reports mention: {mentioned}. "
                "Review the cited excerpts below; these reports are anecdotal and do not establish causation."
            )
            model = None
            generation_warning = str(exc)
        return RAGAnswer(
            answer=generated_answer,
            citations=citations,
            insufficient_evidence=False,
            model=model,
            generation_warning=generation_warning,
        )

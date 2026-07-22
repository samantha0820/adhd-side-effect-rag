from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Document:
    id: str
    text: str
    drug: str
    side_effect: Optional[str] = None
    source: str = "unknown"
    source_type: str = "user_review"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, value: Dict[str, Any]) -> "Document":
        return cls(**value)


@dataclass
class SearchResult:
    document: Document
    score: float


@dataclass
class RAGAnswer:
    answer: str
    citations: List[Dict[str, Any]]
    insufficient_evidence: bool
    model: Optional[str] = None
    generation_warning: Optional[str] = None

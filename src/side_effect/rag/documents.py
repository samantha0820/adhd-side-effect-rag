import csv
import hashlib
import json
from pathlib import Path
from typing import Iterable, List

from .schemas import Document


def _document_id(*parts: str) -> str:
    raw = "\x1f".join(parts).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:20]


def documents_from_reviews_json(path: str) -> List[Document]:
    """Convert the website's derived review JSON into retrievable documents."""
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    documents = []
    for drug_record in payload:
        drug = drug_record["drugName"].strip().lower()
        for side_effect, comments in drug_record.get("sideEffects", {}).items():
            for position, comment in enumerate(comments):
                text = str(comment).strip()
                if not text:
                    continue
                documents.append(
                    Document(
                        id=_document_id(drug, side_effect, text),
                        text=text,
                        drug=drug,
                        side_effect=side_effect.strip().lower(),
                        source="derived_reviews_json",
                        metadata={"position": position},
                    )
                )
    return documents


def documents_from_csv(path: str) -> List[Document]:
    """Load raw reviews while retaining source and row metadata when available."""
    documents = []
    with Path(path).open(encoding="utf-8", newline="") as handle:
        for row_number, row in enumerate(csv.DictReader(handle), start=2):
            text = (row.get("Review Text") or row.get("comment") or "").strip()
            drug = (row.get("Drug Name") or row.get("drug") or "").strip().lower()
            if not text or not drug:
                continue
            side_effect = (row.get("side_effect") or "").strip().lower() or None
            source = (row.get("source") or "reviews_csv").strip()
            documents.append(
                Document(
                    id=_document_id(path, str(row_number), drug, text),
                    text=text,
                    drug=drug,
                    side_effect=side_effect,
                    source=source,
                    metadata={"row_number": row_number},
                )
            )
    return documents


def write_jsonl(documents: Iterable[Document], path: str) -> None:
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        for document in documents:
            handle.write(json.dumps(document.to_dict(), ensure_ascii=False) + "\n")

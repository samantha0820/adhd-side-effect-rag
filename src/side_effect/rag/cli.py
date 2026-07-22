import argparse

from src.side_effect.embedding_and_keywords import BioBERTEmbedder

from .documents import documents_from_csv, documents_from_reviews_json
from .indexer import FAISSIndexer


def main():
    parser = argparse.ArgumentParser(description="Build the side-effect RAG index")
    parser.add_argument(
        "--input",
        default="website/public/data/reviews.json",
        help="Input reviews JSON or CSV",
    )
    parser.add_argument("--output", default="artifacts/rag")
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()

    if args.input.lower().endswith(".csv"):
        documents = documents_from_csv(args.input)
    else:
        documents = documents_from_reviews_json(args.input)
    manifest = FAISSIndexer(BioBERTEmbedder()).build(
        documents, args.output, batch_size=args.batch_size
    )
    print(f"Built RAG index: {manifest}")


if __name__ == "__main__":
    main()

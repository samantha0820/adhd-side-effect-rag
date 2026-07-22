"""Create or update the public Hugging Face Docker Space for this project."""

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv
from huggingface_hub import HfApi


IGNORE_PATTERNS = [
    ".git/**",
    ".env",
    ".env.local",
    ".venv/**",
    "**/__pycache__/**",
    "**/*.pyc",
    "**/.DS_Store",
    "artifacts/**",
    "data/**",
    "docs/**",
    "nlp_modules/**",
    "output/**",
    "README_files/**",
    "tests/**",
    "website/.next/**",
    "website/node_modules/**",
    "website/.pnpm-store/**",
    "*.png",
    "*.html",
    "logs.txt",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--space-name", default="adhd-side-effect-rag")
    parser.add_argument("--owner", help="Hugging Face username or organization")
    parser.add_argument("--private", action="store_true")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    load_dotenv(root / ".env")
    api = HfApi()
    owner = args.owner or api.whoami()["name"]
    repo_id = f"{owner}/{args.space_name}"

    api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="docker",
        private=args.private,
        exist_ok=True,
    )
    api.upload_folder(
        repo_id=repo_id,
        repo_type="space",
        folder_path=str(root),
        ignore_patterns=IGNORE_PATTERNS,
        commit_message="Deploy Dockerized ADHD side-effect RAG website",
    )

    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip().strip("\"'")
    if not gemini_key:
        raise RuntimeError("GEMINI_API_KEY is missing from .env")
    api.add_space_secret(repo_id=repo_id, key="GEMINI_API_KEY", value=gemini_key)
    api.add_space_variable(
        repo_id=repo_id,
        key="GEMINI_MODEL",
        value=os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip().strip("\"'"),
    )
    print(f"Space deployed: https://huggingface.co/spaces/{repo_id}")
    print(f"Public app: https://{owner}-{args.space_name}.hf.space")


if __name__ == "__main__":
    main()

FROM node:18-bookworm-slim AS frontend-builder

WORKDIR /build
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
COPY website/package.json website/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY website/ ./
RUN pnpm build


FROM python:3.11-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    HF_HOME=/app/.cache/huggingface \
    RAG_INDEX_DIR=/app/artifacts/rag \
    GEMINI_MODEL=gemini-3.6-flash

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl libgomp1 nginx supervisor \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir poetry==2.1.1

WORKDIR /app
COPY pyproject.toml poetry.lock README.md ./
RUN poetry install --only main --no-root --no-interaction

COPY src ./src
COPY website/public/data/reviews.json ./website/public/data/reviews.json
RUN python -m src.side_effect.rag.cli \
    --input website/public/data/reviews.json \
    --output artifacts/rag \
    --batch-size 16

COPY --from=frontend-builder /build/.next/standalone ./frontend
COPY --from=frontend-builder /build/.next/static ./frontend/.next/static
COPY --from=frontend-builder /build/public ./frontend/public
COPY docker ./docker

RUN mkdir -p /tmp/nginx/client_body /tmp/nginx/proxy /tmp/nginx/fastcgi /tmp/nginx/uwsgi /tmp/nginx/scgi \
    && useradd --create-home --uid 1000 user \
    && chown -R user:user /app /tmp/nginx

COPY --from=frontend-builder /usr/local/bin/node /usr/local/bin/node

USER user
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
    CMD curl --fail http://127.0.0.1:7860/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord.conf"]

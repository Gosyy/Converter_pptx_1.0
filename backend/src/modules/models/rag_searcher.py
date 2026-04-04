from __future__ import annotations
from typing import TYPE_CHECKING

from src.config import settings
from src.modules.models.model_manager import model_manager

if TYPE_CHECKING:
    from src.modules.models.rag import QdrantVectorDatabase


class FZ44RAGSearcher:
    def __init__(
        self,
        vector_db: QdrantVectorDatabase,
        cross_encoder_model: str = settings.CROSS_ENCODER_MODEL,
    ):
        self.vector_db = vector_db
        # Use singleton model manager instead of creating new instances
        self.cross_encoder = model_manager.get_cross_encoder_model(cross_encoder_model)

    import logging

    logger = logging.getLogger(__name__)

    import logging

    logger = logging.getLogger(__name__)

    def search_raw_candidates(self, query: str, top_k: int = 30) -> list:
        query_vector = self.vector_db.encoder.encode([query])[0].tolist()
        client = self.vector_db.client
        collection = getattr(self.vector_db, "collection_name", None)

        # Популярные варианты имён методов QdrantClient
        method_variants = [
            "search_points",
            "search",
            "search_batch",
            "points_search",
        ]

        response = None
        for method_name in method_variants:
            method = getattr(client, method_name, None)
            if not callable(method):
                continue
            try:
                if method_name == "search_points":
                    response = method(
                        collection_name=collection,
                        query_vector=query_vector,
                        limit=top_k,
                        with_payload=True,
                    )
                elif method_name == "search":
                    response = method(
                        collection_name=collection,
                        query_vector=query_vector,
                        limit=top_k,
                        with_payload=True,
                    )
                elif method_name == "search_batch":
                    response = method(
                        collection_name=collection,
                        query_vectors=[query_vector],
                        top=top_k,
                        with_payload=True,
                    )
                    if isinstance(response, list) and len(response) > 0:
                        response = response[0]
                else:
                    response = method(
                        collection_name=collection,
                        query_vector=query_vector,
                        limit=top_k,
                        with_payload=True,
                    )
                # успешно вызван - прерываем цикл
                break
            except TypeError:
                logger.debug("Qdrant method %s exists but signature mismatch; trying next", method_name)
                response = None
            except Exception:
                logger.exception("Error calling Qdrant client method %s", method_name)
                response = None

        if not response:
            logger.error("No compatible Qdrant search method succeeded; returning empty candidates")
            return []

        candidates = []
        for hit in response:
            if isinstance(hit, dict):
                payload = hit.get("payload", {}) or {}
                score = hit.get("score")
            else:
                payload = getattr(hit, "payload", None) or getattr(hit, "payload_", None) or {}
                score = getattr(hit, "score", None) or getattr(hit, "score_", None)

                # если hit — объект с методами .to_dict()
                if not payload and hasattr(hit, "to_dict"):
                    try:
                        h = hit.to_dict()
                        payload = h.get("payload", {}) or {}
                        score = score or h.get("score")
                    except Exception:
                        pass

            candidates.append(
                {
                    "text": payload.get("context"),
                    "score": float(score) if score is not None else None,
                    "metadata": {
                        "source": payload.get("file_name"),
                        "chunk_id": payload.get("chunk_index"),
                    },
                }
            )

        return candidates

    def rerank_results(self, query: str, candidates: list, limit: int = 10) -> list:
        pairs = [(query, c.get("text") or "") for c in candidates]
        scores = self.cross_encoder.predict(pairs, batch_size=16)

        for i, score in enumerate(scores):
            candidates[i]["rerank_score"] = float(score)

        sorted_candidates = sorted(
            candidates, key=lambda x: x["rerank_score"], reverse=True
        )
        return sorted_candidates[:limit]

    def search(self, query: str, top_k: int = 30, rerank_limit: int = 5) -> list:
        candidates = self.search_raw_candidates(query, top_k=top_k)
        reranked = self.rerank_results(query, candidates, limit=rerank_limit)
        return reranked

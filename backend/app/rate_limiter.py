"""
Lightweight In-Memory Rate Limiter for FastAPI
Protects the Gemini LLM calculation endpoint without external infrastructure like Redis.
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int = 30, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_records = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        timestamps = self.client_records[client_id]
        
        # Purge timestamps older than the window
        valid_timestamps = [t for t in timestamps if now - t < self.window_seconds]
        self.client_records[client_id] = valid_timestamps
        
        if len(valid_timestamps) >= self.requests_limit:
            return False
        
        self.client_records[client_id].append(now)
        return True

    def check(self, request: Request):
        # Identify by client host or X-Forwarded-For header
        forwarded = request.headers.get("X-Forwarded-For")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
        
        if not self.is_allowed(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a moment before calculating again."
            )

# Global rate limiter: 30 requests per minute per IP
calculation_rate_limiter = InMemoryRateLimiter(requests_limit=30, window_seconds=60)

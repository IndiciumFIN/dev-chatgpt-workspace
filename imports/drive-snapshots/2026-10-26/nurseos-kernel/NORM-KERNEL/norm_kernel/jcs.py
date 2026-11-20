"""JCS — JSON Canonicalization Scheme (RFC 8785), subconjunto v0.1.

Base canônica de TODO checksum e assinatura do NORM-KERNEL (blueprint §17).
Dívida v0: serialização de números no formato ES6 do RFC 8785 (floats).
O kernel v0.1 usa apenas strings e inteiros, cobertos integralmente.
"""
import hashlib
import json


def canonicalize(obj) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_of(obj) -> str:
    return "sha256:" + hashlib.sha256(canonicalize(obj).encode("utf-8")).hexdigest()


def sha256_text(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()

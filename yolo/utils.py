# utils.py
import socket
import struct

def _recv_exact(conn, length):
    remaining = length
    chunks = []
    while remaining > 0:
        chunk = conn.recv(remaining)
        if not chunk: return b""
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)

def get_local_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return socket.gethostbyname(socket.gethostname())
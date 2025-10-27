import sys
import time

import psycopg2
from psycopg2 import sql

sys.path.append("../../dto/")

from dto.pg_config import PGConfig


def check_postgres(cfg: PGConfig) -> tuple[bool, float | None, str | None]:
    """Return (is_healthy, latency_ms, error_detail)"""
    start = time.perf_counter()
    try:
        conn = psycopg2.connect(
            host=cfg.host,
            port=cfg.port,
            dbname=cfg.db,
            user=cfg.user,
            password=cfg.password,
            connect_timeout=cfg.timeout
        )
        with conn.cursor() as cur:
            cur.execute(sql.SQL("SELECT 1;"))
            result = cur.fetchone()
        conn.close()
        if result != (1,):
            return False, None, f"Unexpected result: {result}"
        latency = (time.perf_counter() - start) * 1000
        return True, latency, None
    except Exception as e:
        return False, None, str(e)

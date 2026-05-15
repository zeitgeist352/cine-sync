import os
import pymysql
import pymysql.cursors

DB_CONFIG = {
    "host":        os.environ.get("DB_HOST", "localhost"),
    "port":        int(os.environ.get("DB_PORT", 3306)),
    "user":        os.environ.get("DB_USER", "cinelog_user"),
    "password":    os.environ.get("DB_PASSWORD", "cinelog_pass"),
    "database":    os.environ.get("DB_NAME", "cinelog"),
    "charset":     "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit":  True,
}


def get_db():
    return pymysql.connect(**DB_CONFIG)


def query(sql, params=None, fetchone=False):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.fetchone() if fetchone else cur.fetchall()
    finally:
        conn.close()


def execute(sql, params=None):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.lastrowid
    finally:
        conn.close()

from typing import Generator
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

import shapely.wkt
from sqlalchemy import event, create_engine, text

# Engine configuration targeting PostgreSQL / PostGIS with fallback to local SQLite for dev
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Connected to primary PostgreSQL database.")
except Exception as e:
    sqlite_url = "sqlite:///./trace_dev.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False, "timeout": 30},
    )


# Polyfill spatial functions for SQLite fallback when SpatiaLite extension is unavailable
if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def setup_sqlite_spatial_polyfills(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA busy_timeout=30000;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
            cursor.close()
        except Exception as pragma_err:
            logger.warning(f"Notice: SQLite PRAGMA configuration: {pragma_err}")

        if hasattr(dbapi_connection, "create_function"):
            def wkt_to_wkb_hex(val):
                if not val:
                    return None
                val_str = str(val)
                if "SRID=" in val_str:
                    val_str = val_str.split(";", 1)[-1]
                try:
                    return shapely.wkt.loads(val_str).wkb_hex
                except Exception:
                    return val

            def dummy_dml(*args):
                return 1

            dbapi_connection.create_function("AsEWKB", 1, wkt_to_wkb_hex)
            dbapi_connection.create_function("ST_AsEWKB", 1, wkt_to_wkb_hex)
            dbapi_connection.create_function("GeomFromText", 1, wkt_to_wkb_hex)
            dbapi_connection.create_function("GeomFromText", 2, lambda v, srid: wkt_to_wkb_hex(v))
            dbapi_connection.create_function("GeomFromEWKT", 1, wkt_to_wkb_hex)
            dbapi_connection.create_function("ST_GeomFromText", 1, wkt_to_wkb_hex)
            dbapi_connection.create_function("ST_GeomFromEWKT", 1, wkt_to_wkb_hex)

            for f in [
                "RecoverGeometryColumn",
                "CreateSpatialIndex",
                "DisableSpatialIndex",
                "DiscardGeometryColumn",
                "InitSpatialMetaData",
                "AddGeometryColumn",
            ]:
                dbapi_connection.create_function(f, -1, dummy_dml)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


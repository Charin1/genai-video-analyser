from neo4j import GraphDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Neo4jConnection:
    def __init__(self):
        self.driver = None

    def connect(self):
        if not self.driver:
            try:
                self.driver = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
                )
                # Test connection
                self.driver.verify_connectivity()
            except Exception as e:
                logger.warning(f"Failed to connect to Neo4j: {e}. Graph features will be disabled.")
                self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def get_session(self):
        if not self.driver:
            self.connect()
        
        if self.driver:
            return self.driver.session()
        return None

neo4j_conn = Neo4jConnection()

def get_neo4j_session():
    # Attempt to connect lazily
    session = neo4j_conn.get_session()
    if session:
        try:
            yield session
        finally:
            session.close()
    else:
        # Yield None if unconnected, services must handle this
        yield None

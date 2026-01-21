from fastapi import APIRouter, HTTPException
from app.services.knowledge_graph_service import knowledge_graph_service
from app.services.llm_factory import llm_factory
from app.db.neo4j import neo4j_conn

router = APIRouter()

@router.get("/insights/recent")
async def get_recent_insights():
    """
    Get recent strategic insights. Returns empty list if Graph DB is offline.
    """
    session = neo4j_conn.get_session()
    if not session:
        return [] # Graceful degradation
        
    try:
        query = """
        MATCH (n) 
        WHERE n:Person OR n:Company OR n:Topic
        RETURN labels(n)[0] as type, n.name as name, count{(n)--()} as connections
        ORDER BY connections DESC LIMIT 10
        """
        # Session is already open from get_session, but logic in neo4j.py was a bit weird returning raw session.
        # Let's just use context manager if possible or close it.
        # My neo4j.py `get_session` returns a NEW session.
        try:
            result = session.run(query)
            data = [record.data() for record in result]
            return data
        finally:
            session.close()
    except Exception as e:
        print(f"Graph Error: {e}")
        return []

@router.post("/search/smart")
async def smart_search(query: str):
    results = await knowledge_graph_service.query_graph(query)
    
    # Check if results indicate error/offline
    if results and "status" in results[0] and results[0]["status"] == "offline":
        return {
            "query": query,
            "results": [],
            "answer": "Graph database is currently offline. Showing only LLM based knowledge."
        }

    # Synthesize answer using LangChain
    llm = llm_factory.get_llm()
    prompt = f"""
    User asked: "{query}"
    Database results: {results}
    Provide a concise answer.
    """
    response = await llm.ainvoke(prompt)
    
    return {
        "query": query,
        "results": results,
        "answer": response.content
    }

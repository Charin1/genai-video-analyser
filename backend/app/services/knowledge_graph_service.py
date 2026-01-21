import json
from app.db.neo4j import get_neo4j_session, neo4j_conn
from app.services.llm_factory import llm_factory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class KnowledgeGraphService:
    async def process_transcript_for_graph(self, transcript: str, source_id: str):
        """
        Extracts strategic entities and updates graph if connected.
        """
        # 0. Check connection first
        session = neo4j_conn.get_session()
        if not session:
            print("Neo4j not connected. Skipping graph extraction.")
            return {}
        session.close()

        # 1. LangChain Extraction
        llm = llm_factory.get_llm()
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a knowledge graph extractor. Extract entities from the transcript. Return STRICT JSON object with keys: people, companies, topics."),
            ("user", "Transcript: {transcript}")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        
        try:
            data = await chain.ainvoke({"transcript": transcript[:15000]})
            # Clean data ensures keys exist
            data.setdefault("people", [])
            data.setdefault("companies", [])
            data.setdefault("topics", [])
            
            await self._update_graph(data, source_id)
            return data
        except Exception as e:
            print(f"Graph extraction failed: {e}")
            return {}

    async def _update_graph(self, data, source_id):
        query = """
        MERGE (r:Recording {id: $source_id})
        
        FOREACH (p_name IN $data.people | 
            MERGE (p:Person {name: p_name})
            MERGE (p)-[:APPEARED_IN]->(r)
        )
        FOREACH (c_name IN $data.companies | 
            MERGE (c:Company {name: c_name})
            MERGE (c)-[:MENTIONED_IN]->(r)
        )
        FOREACH (t_name IN $data.topics | 
            MERGE (t:Topic {name: t_name})
            MERGE (t)-[:DISCUSSED_IN]->(r)
        )
        """
        # Use sync driver in async context cautiously or offload to thread in real prod
        # Here we just run it.
        try:
            with neo4j_conn.get_session() as session:
                if session:
                    session.run(query, source_id=source_id, data=data)
        except Exception as e:
            print(f"Neo4j Write Error: {e}")

    async def query_graph(self, natural_query: str):
        # 0. Check connection
        if not neo4j_conn.get_session():
            return [{"error": "Graph database disconnected", "status": "offline"}]

        # 1. Generate Cypher
        llm = llm_factory.get_llm()
        prompt = ChatPromptTemplate.from_template(
            "Convert to Cypher. Schema: (Person, Company, Topic, Recording). Relations: APPEARED_IN, MENTIONED_IN. Question: {question}. Return ONLY Cypher query, no markdown."
        )
        chain = prompt | llm
        cypher_response = await chain.ainvoke({"question": natural_query})
        cypher = cypher_response.content.replace("```cypher", "").replace("```", "").strip()

        # 2. Execute
        try:
            results = []
            with neo4j_conn.get_session() as session:
                result = session.run(cypher)
                results = [record.data() for record in result]
            return results
        except Exception as e:
            return [{"error": str(e), "query": cypher}]

knowledge_graph_service = KnowledgeGraphService()

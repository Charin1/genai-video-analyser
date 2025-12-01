import chromadb
import networkx as nx
from app.services.llm_service import llm_service
import json
import uuid

class RAGService:
    def __init__(self):
        # Initialize ChromaDB (Persistent or In-Memory)
        self.chroma_client = chromadb.Client() # In-memory for now
        self.collection = self.chroma_client.create_collection(name="transcripts")
        
        # Initialize Graph
        self.graph = nx.Graph()

    async def add_document(self, text: str, metadata: dict):
        """
        Process document: Chunk -> Embed -> Vector Store -> Extract Entities -> Graph
        """
        # 1. Chunking (Simple split for now)
        chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
        
        ids = []
        embeddings = []
        metadatas = []
        documents = []

        for i, chunk in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            embedding = await llm_service.get_embeddings(chunk)
            
            ids.append(chunk_id)
            embeddings.append(embedding)
            metadatas.append({**metadata, "chunk_index": i})
            documents.append(chunk)
            
            # Graph Extraction (Simplified)
            # In a real app, we'd batch this or do it async
            await self._extract_and_update_graph(chunk, chunk_id)

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

    async def _extract_and_update_graph(self, text: str, chunk_id: str):
        """
        Extract entities and relationships using LLM and update graph.
        """
        prompt = f"""
        Extract key entities (Product, Feature, Competitor, Objection, Customer) and their relationships from the following text.
        Return JSON format: {{ "entities": [{{"name": "X", "type": "Y"}}], "relationships": [{{"source": "X", "target": "Z", "relation": "W"}}] }}
        
        Text: {text}
        """
        try:
            response = await llm_service.generate_json(prompt)
            response = await llm_service.generate_json(prompt)
            # Clean up markdown code blocks if present (just in case)
            cleaned_response = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned_response)
            
            for entity in data.get("entities", []):
                self.graph.add_node(entity["name"], type=entity["type"])
                # Link entity to chunk for retrieval
                self.graph.add_edge(entity["name"], chunk_id, relation="MENTIONED_IN")
            
            for rel in data.get("relationships", []):
                self.graph.add_edge(rel["source"], rel["target"], relation=rel["relation"])
                
        except Exception as e:
            print(f"Graph extraction failed: {e}")

    async def query(self, query_text: str):
        """
        Hybrid Retrieval: Vector + Graph
        """
        # 1. Vector Search
        query_embedding = await llm_service.get_embeddings(query_text)
        vector_results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=5
        )
        
        # 2. Graph Search (Simple expansion)
        # Extract entities from query
        # Find neighbors in graph
        # For now, just return vector results as primary, graph is internal enhancement
        
        return vector_results

rag_service = RAGService()

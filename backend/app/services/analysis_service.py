from app.services.llm_factory import llm_factory
from app.services.knowledge_graph_service import knowledge_graph_service
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import json

class AnalysisService:
    async def analyze_video_transcript(self, transcript: str, filename: str, llm_model: str = None):
        
        # 1. Graph Extraction (Fire and forget or await)
        await knowledge_graph_service.process_transcript_for_graph(transcript, filename)

        # 2. Main Analysis with LangChain
        llm = llm_factory.get_llm(model_name=llm_model)

        # Chain 1: Domain Detection
        domain_prompt = ChatPromptTemplate.from_messages([
            ("system", "Analyze the transcript. Determine domain and suggested report fields. Return JSON."),
            ("user", "Transcript: {transcript}")
        ])
        domain_chain = domain_prompt | llm | JsonOutputParser()
        
        try:
            domain_data = await domain_chain.ainvoke({"transcript": transcript[:2000]})
        except Exception as e:
            # Fallback
            domain_data = {"domain": "General", "fields": ["Summary", "Key Points"]}

        # Chain 2: Report Generation
        # Enforce these fields regardless of domain
        fields = ["Summary", "Key_Insights", "Promises_Made", "Next_Steps", "Conversation_Graph", "Intelligence"]
        
        # We need to guide the LLM on what "Conversation_Graph" means in this JSON context
        # It should extract nodes/edges textually or summarize them if the graph DB is separate.
        # OR better: we inject the graph data we just extracted into the prompt so the LLM can refine it for the report json.
        
        # Actually, let's just ask LLM to extract these as text lists/objects.
        # "Conversation_Graph" in JSON can be a list of "Entity: Relation" strings for display.
        
        report_prompt = ChatPromptTemplate.from_messages([
            ("system", f"""
            Generate a detailed video analysis report in strict JSON format.
            Domain identified: {domain_data.get('domain', 'General')}
            
            Structure the JSON with these exact keys:
            - "Summary": "Executive summary of the content"
            - "Key_Insights": ["List of key points"]
            - "Promises_Made": ["List of commitments or promises detected"]
            - "Next_Steps": ["List of action items"]
            - "Conversation_Graph": {{ "People": [], "Companies": [], "Topics": [] }}  <-- Extract entities mentioned
            - "Intelligence": {{ "Sentiment": "Positive/Neutral/Negative", "Tone": "String", "Complexity": "Low/Medium/High" }}
            
            Ensure all fields are present.
            """),
            ("user", "Transcript: {transcript}")
        ])
        
        report_chain = report_prompt | llm | JsonOutputParser()
        
        try:
            report_data = await report_chain.ainvoke({"transcript": transcript})
            
            # Merge the Neo4j graph data if we have it? 
            # Actually, let's just rely on the LLM's fresh extraction for the report JSON display
            # The Neo4j graph is for the graph view.
            # But the user asked "that will also be generated right? just like in ui". 
            # So the UI needs this data structure.
        except Exception as e:
             print(f"Report generation error: {e}")
             report_data = {"error": str(e)}
        
        return {
            "domain": domain_data.get("domain", "General"),
            "report": report_data
        }

analysis_service = AnalysisService()

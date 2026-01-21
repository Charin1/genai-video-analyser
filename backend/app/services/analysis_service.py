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
        fields = domain_data.get("fields", ["Summary", "Action Items"])
        
        report_prompt = ChatPromptTemplate.from_messages([
            ("system", f"Generate a report with these fields: {fields}. Return JSON object."),
            ("user", "Transcript: {transcript}")
        ])
        report_chain = report_prompt | llm | JsonOutputParser()
        
        try:
            report_data = await report_chain.ainvoke({"transcript": transcript})
        except Exception as e:
             report_data = {"error": str(e)}
        
        return {
            "domain": domain_data.get("domain", "General"),
            "report": report_data
        }

analysis_service = AnalysisService()

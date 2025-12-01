from app.services.llm_service import llm_service
from app.services.rag_service import rag_service
import json

class AnalysisService:
    async def analyze_video_transcript(self, transcript: str, filename: str):
        """
        Analyze transcript to generate a structured report.
        """
        # 1. Store in RAG for future queries
        await rag_service.add_document(transcript, {"filename": filename})
        
        # 2. Determine Domain/Context
        domain_prompt = f"""
        Analyze the following transcript and determine the business domain (e.g., SaaS Sales, Real Estate, Medical, EdTech).
        Also suggest 5 key fields that should be in a report for this domain.
        
        Transcript start: {transcript[:1000]}...
        
        Return JSON: {{ "domain": "...", "fields": ["field1", "field2", ...] }}
        """
        domain_resp = await llm_service.generate_json(domain_prompt)
        domain_resp = await llm_service.generate_json(domain_prompt)
        domain_data = json.loads(domain_resp.replace("```json", "").replace("```", "").strip())
        
        # 3. Generate Report based on dynamic fields
        fields = domain_data.get("fields", ["Summary", "Action Items", "Sentiment"])
        
        report_prompt = f"""
        Generate a detailed report for the following transcript based on these fields: {fields}.
        
        Transcript: {transcript}
        
        Return a single JSON object (dictionary) where keys are the fields and values are the analysis. 
        Do NOT return a list.
        """
        report_resp = await llm_service.generate_json(report_prompt)
        report_data = json.loads(report_resp.replace("```json", "").replace("```", "").strip())
        
        return {
            "domain": domain_data["domain"],
            "report": report_data
        }

analysis_service = AnalysisService()

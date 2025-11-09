from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

class EvidenceQuality(BaseModel):
    relevance: float
    completeness: float
    currentness: float

class ValidationResult(BaseModel):
    is_valid: bool
    confidence: float
    reasoning: str
    suggested_score: float
    evidence_quality: EvidenceQuality

class ValidationService:
    VALIDATION_PROMPT_TEMPLATE = """
    You are an expert mining industry auditor validating evidence documents against assessment responses. Your task is to verify if the provided evidence supports the user's answer.

    Context:
    - Question: {question}
    - User's Answer: {answer}
    - Evidence Excerpts: {evidence}

    Instructions:
    1. Analyze if the evidence directly supports the user's answer
    2. Look for specific policies, procedures, or implementation details
    3. Verify the evidence is relevant to the question
    4. Consider the completeness and quality of the evidence

    Return your assessment as a JSON object with the following structure:
    {{
        "is_valid": boolean,  # true if evidence supports the answer
        "confidence": float,  # 0.0 to 1.0
        "reasoning": string,  # brief explanation
        "suggested_score": float,  # recommended score 0.0 to 1.0
        "evidence_quality": {{
            "relevance": float,  # 0.0 to 1.0
            "completeness": float,  # 0.0 to 1.0
            "currentness": float  # 0.0 to 1.0
        }}
    }}

    Provide ONLY the JSON response without additional text.
    """
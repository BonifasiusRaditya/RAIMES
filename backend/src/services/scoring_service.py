from typing import Dict, Optional, Union
from enum import Enum

class AssessmentAnswer(str, Enum):
    IMPLEMENTED = "Implemented"
    IN_PROGRESS = "In Progress"
    NOT_IMPLEMENTED = "Not Implemented"
    NOT_RELEVANT = "Not Relevant"

class ScoringService:
    ANSWER_WEIGHTS: Dict[AssessmentAnswer, Optional[float]] = {
        AssessmentAnswer.IMPLEMENTED: 1.0,      # 100% of max points
        AssessmentAnswer.IN_PROGRESS: 0.5,      # 50% of max points
        AssessmentAnswer.NOT_IMPLEMENTED: 0.0,  # 0% of max points
        AssessmentAnswer.NOT_RELEVANT: None     # Excluded from scoring
    }
    
    MAX_QUESTION_POINTS = 10.0
    
    @classmethod
    def calculate_question_score(cls, answer: AssessmentAnswer) -> Optional[float]:
        """Calculate score for a single question based on the answer."""
        weight = cls.ANSWER_WEIGHTS.get(answer)
        if weight is None:
            return None
        return weight * cls.MAX_QUESTION_POINTS
    
    @classmethod
    def calculate_total_score(cls, answers: Dict[str, AssessmentAnswer]) -> Dict[str, Union[float, int]]:
        """Calculate total assessment score, excluding Not Relevant answers."""
        applicable_questions = 0
        total_points = 0.0
        
        for answer in answers.values():
            score = cls.calculate_question_score(answer)
            if score is not None:  # Skip Not Relevant answers
                applicable_questions += 1
                total_points += score
        
        max_possible = applicable_questions * cls.MAX_QUESTION_POINTS
        percentage = (total_points / max_possible * 100) if max_possible > 0 else 0
        
        return {
            "total_points": total_points,
            "max_possible": max_possible,
            "applicable_questions": applicable_questions,
            "percentage_score": round(percentage, 2)
        }
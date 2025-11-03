import express from 'express';
type Request = express.Request;
type Response = express.Response;
import aiService from '../services/aiService.js';

class AIController {
    constructor() {
        // Bind methods to instance
        this.analyzeQuestionnaire = this.analyzeQuestionnaire.bind(this);
        this.getDummyAnalysis = this.getDummyAnalysis.bind(this);
    }

    async analyzeQuestionnaire(req: Request, res: Response) {
        try {
            const { answers } = req.body;

            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ 
                    error: 'Invalid input: answers array is required' 
                });
            }

            const scores = await aiService.calculateESGScore(answers);

            res.json({
                success: true,
                scores,
                timestamp: new Date(),
                assessmentId: req.body.assessmentId
            });
        } catch (error) {
            console.error('Error in AI analysis:', error);
            res.status(500).json({ 
                error: 'Failed to analyze questionnaire' 
            });
        }
    }

    async getDummyAnalysis(req: Request, res: Response) {
        try {
            // Generate dummy data
            const dummyAnswers = aiService.generateDummyData();
            
            // Analyze dummy data
            const scores = await aiService.calculateESGScore(dummyAnswers);

            res.json({
                success: true,
                scores,
                answers: dummyAnswers,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error generating dummy analysis:', error);
            res.status(500).json({ 
                error: 'Failed to generate dummy analysis' 
            });
        }
    }
}

export default new AIController();
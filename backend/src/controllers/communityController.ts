import { Response } from 'express';
import Message from '../models/Message';
import { AuthRequest } from '../middlewares/authMiddleware';
import { analyzeThread } from '../services/aiService';

export const getCityMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { city } = req.params;
        const messages = await Message.find({ city }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(messages.reverse());
    } catch (error: any) {
        console.error("Community message fetch error", error);
        res.status(500).json({ message: "Failed to fetch grid messages" });
    }
}

export const analyzeCityGrid = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { city } = req.params;
        console.log(`[AI-DEBUG] Analysis triggered for city: "${city}"`);
        
        // Use case-insensitive matching to be safe
        const messages = await Message.find({ 
            city: { $regex: new RegExp(`^${city}$`, 'i') } 
        }).sort({ createdAt: -1 }).limit(100);
        
        console.log(`[AI-DEBUG] Found ${messages.length} messages for analysis.`);
        
        if (messages.length === 0) {
            console.warn(`[AI-DEBUG] No messages found for city: "${city}"`);
            res.status(200).json({ 
                issues: [{ title: "No Data", description: "No messages found in the local grid to analyze.", priority: "Low" }] 
            });
            return;
        }

        const analysis = await analyzeThread(messages.reverse());
        res.status(200).json(analysis);
    } catch (error: any) {
        console.error("[AI-DEBUG] Community analysis error:", error.message);
        res.status(500).json({ message: "AI analysis of grid failed" });
    }
}

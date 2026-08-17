import { Response } from 'express';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middlewares/authMiddleware';
import { processComplaintAI } from '../services/aiService';
import { sendSMS } from '../services/vonageService';
import { sendEmail } from '../services/emailService';

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, timeOfOccurrence, address, city, state, lat, lng } = req.body;
        let images: string[] = [];
        if (req.file) {
            images = [req.file.path];
        } else if (req.body.images) {
            const imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            images = imageUrls.filter((url: string) => url.trim().length > 0);
        }
        const aiPayload = {
            title,
            description,
            timeOfOccurrence,
            address,
            city,
            state,
            lat: Number(lat),
            lng: Number(lng),
            user_id: req.user?._id.toString(),
            images
        };
        const aiResponse = await processComplaintAI(aiPayload);

        // Ticket ID can stay generated here or move to AI if preferred, but usually backend handles it.
        const ticketId = 'TKT-' + Math.floor(Math.random() * 900000 + 100000);

        // Directly use AI result for duplication status
        const isDuplicate = !!(aiResponse.frequency && aiResponse.frequency > 1);
        const complaint = await Complaint.create({
            user: req.user?._id,
            ticketId,
            title,
            description,
            timeOfOccurrence: timeOfOccurrence ? new Date(timeOfOccurrence) : new Date(),
            location: {
                lat: Number(lat),
                lng: Number(lng),
                address,
                city,
                state
            },
            images,
            department: aiResponse.department,
            priority: aiResponse.priority,
            aiScore: aiResponse.priority_score || 0,
            duplicateFlag: isDuplicate,
            status: 'Pending',
            administrativeWard: 'Unassigned'
        });

        // Send SMS notification
        if (req.user?.phoneNumber) {
            const smsText = `CitySync: Your complaint has been registered. Ticket ID: ${ticketId}. Status: Pending.`;
            sendSMS(req.user.phoneNumber, smsText).catch(err => console.error('Delayed SMS send failure:', err));
            
            if (req.user.email) {
                sendEmail(req.user.name, req.user.email, smsText).catch(err => console.error('Delayed Email send failure:', err));
            }
        }

        res.status(201).json(complaint);
    } catch (error: any) {
        console.error("Complaint execution error", error);
        res.status(500).json({ message: "Failed to dispatch protocol", error: error.message });
    }
}

export const getUserComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const complaints = await Complaint.find({ user: req.user?._id }).sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: "Lookup failed" });
    }
}

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No image file provided" });
            return;
        }
        res.status(200).json({ url: req.file.path });
    } catch (error: any) {
        res.status(500).json({ message: "Image upload failed" });
    }
}

export const getAllPublicComplaints = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const complaints = await Complaint.find().select('location department priority status createdAt');
        res.status(200).json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: "Map data lookup failed" });
    }
}

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const complaint = await Complaint.findOne({ _id: req.params.id, user: req.user?._id });
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }
        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: "Lookup failed" });
    }
}

export const deleteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Only the owner can withdraw their own complaint
        const complaint = await Complaint.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found or not authorized" });
            return;
        }
        res.status(200).json({ message: "Complaint withdrawn successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to withdraw complaint" });
    }
}

export const upvoteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        
        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }

        const userIdStr = userId.toString();

        // Toggle upvote
        if (complaint.upvotes.map(u => u.toString()).includes(userIdStr)) {
            complaint.upvotes = complaint.upvotes.filter(u => u.toString() !== userIdStr);
        } else {
            complaint.upvotes.push(userId as any);
            // Remove downvote if exists
            complaint.downvotes = complaint.downvotes.filter(u => u.toString() !== userIdStr);
        }

        await complaint.save();
        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: "Voting operation failed" });
    }
}

export const downvoteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            res.status(404).json({ message: "Complaint not found" });
            return;
        }

        const userIdStr = userId.toString();

        // Toggle downvote
        if (complaint.downvotes.map(u => u.toString()).includes(userIdStr)) {
            complaint.downvotes = complaint.downvotes.filter(u => u.toString() !== userIdStr);
        } else {
            complaint.downvotes.push(userId as any);
            // Remove upvote if exists
            complaint.upvotes = complaint.upvotes.filter(u => u.toString() !== userIdStr);
        }

        await complaint.save();
        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: "Voting operation failed" });
    }
}

export const getCityComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { city } = req.params;
        // Search by city in a case-insensitive manner
        const complaints = await Complaint.find({
            "location.city": { $regex: new RegExp(`^${city}$`, 'i') }
        });

        // We return everything and let the frontend handle the sorting by upvotes
        res.status(200).json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch city issues" });
    }
}

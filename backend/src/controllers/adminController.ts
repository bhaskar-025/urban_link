import { Response } from 'express';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendSMS } from '../services/vonageService';
import { sendEmail } from '../services/emailService';
import { IUser } from '../models/User';

export const getAllComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const adminCity = req.user?.city;
        const filter = adminCity ? { 'location.city': { $regex: new RegExp(`^${adminCity}$`, 'i') } } : {};
        const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).populate('user', 'name email phoneNumber');
        res.status(200).json(complaints);
    } catch (error: any) {
        res.status(500).json({ message: "Lookup failed" });
    }
}

export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, message } = req.body;

        const complaint = await Complaint.findById(id).populate('user', 'phoneNumber name email');
        if (!complaint) {
            res.status(404).json({ message: "Target ticket not found" });
            return;
        }

        const oldStatus = complaint.status;
        const statusChanged = oldStatus !== status;
        complaint.status = status;
        complaint.statusUpdates.push({
            status,
            message,
            timestamp: new Date()
        });

        await complaint.save();

        // Consolidated Notification Logic
        const user = complaint.user as unknown as IUser;
        if (user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const detailLink = `${frontendUrl}/complaint/${complaint._id}`;

            const notificationText = statusChanged
                ? `CitySync Update: Your complaint (#${complaint.ticketId}) status changed to ${status}. Note: ${message} | Track here: ${detailLink}`
                : `CitySync Update: New activity recorded for your complaint (#${complaint.ticketId}). Note: ${message} | View: ${detailLink}`;
            
            if (user.phoneNumber) {
                sendSMS(user.phoneNumber, notificationText).catch(err => console.error('Delayed SMS send failure:', err));
            }

            if (user.email) {
                sendEmail(user.name, user.email, notificationText).catch(err => console.error('Delayed Email send failure:', err));
            }
        }

        res.status(200).json(complaint);
    } catch (error: any) {
        res.status(500).json({ message: "Management operation failed" });
    }
}

export const getDailyAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const adminCity = req.user?.city;
        const matchStage: any = { createdAt: { $gte: thirtyDaysAgo } };
        if (adminCity) {
            matchStage['location.city'] = { $regex: new RegExp(`^${adminCity}$`, 'i') };
        }

        const analytics = await Complaint.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(analytics);
    } catch (error: any) {
        res.status(500).json({ message: "Analytics aggregation failed" });
    }
}

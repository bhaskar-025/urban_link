import axios from 'axios';

const SERVICE_ID = (process.env.EMAILJS_SERVICE_ID || '').trim();
const TEMPLATE_ID = (process.env.EMAILJS_TEMPLATE_ID || '').trim();
const PUBLIC_KEY = (process.env.EMAILJS_PUBLIC_KEY || '').trim();
const PRIVATE_KEY = (process.env.EMAILJS_PRIVATE_KEY || '').trim();

export const sendEmail = async (name: string, email: string, message: string): Promise<any> => {
    try {
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            console.warn('EmailJS credentials missing in .env. Skipping email transmission.');
            return null;
        }

        const data: any = {
            service_id: SERVICE_ID,
            template_id: TEMPLATE_ID,
            user_id: PUBLIC_KEY,
            template_params: {
                name: name,
                email: email,
                message: message
            }
        };

        if (PRIVATE_KEY) {
            data.accessToken = PRIVATE_KEY;
        }

        console.log(`Attempting to send email to ${email} via EmailJS...`);

        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Email successfully dispatched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('EmailJS transmission failed:', error.response?.data || error.message);
        return null;
    }
};

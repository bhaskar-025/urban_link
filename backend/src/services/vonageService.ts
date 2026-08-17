import { Vonage } from '@vonage/server-sdk';

const apiKey = process.env.VONAGE_API_KEY || '';
const apiSecret = process.env.VONAGE_API_SECRET || '';

const vonage = new Vonage({
  apiKey: apiKey,
  apiSecret: apiSecret
} as any); // Type cast if SDK types are slightly off

export const sendSMS = async (to: string, text: string): Promise<any> => {
  try {
    if (!apiKey || !apiSecret) {
      console.warn('Vonage API credentials missing. Skipping SMS.');
      return null;
    }

    // Ensure 'to' is in E.164 format or common numeric format
    // Vonage expects numbers without '+' usually, but handles many formats.
    const cleanTo = to.replace(/\D/g, '');

    console.log(`Sending SMS to ${cleanTo}: ${text}`);

    const response = await vonage.sms.send({
      to: cleanTo,
      from: 'CitySync',
      text: text
    });

    console.log('SMS sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send SMS via Vonage:', error);
    return null;
  }
};

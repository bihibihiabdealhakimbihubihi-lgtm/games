import { appendToGoogleSheet } from '../src/lib/googleSheets.js';

interface RequestBody {
  email?: string;
  country?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { email, country } = (req.body || {}) as RequestBody;

    // Server-side validations
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Email Address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid Email Address.' });
    }

    if (!country || typeof country !== 'string' || country.trim() === '') {
      return res.status(400).json({ success: false, error: 'Country is required.' });
    }

    // Attempt writing to Google Sheets with Duplicate Protection checks
    await appendToGoogleSheet(email, country);

    return res.status(200).json({
      success: true,
      message: 'Thank you for joining our gaming community!',
    });
  } catch (error: any) {
    console.error('Vercel API subscription handler error:', error);
    const code = error.status || 500;
    return res.status(code).json({
      success: false,
      error: error.message || 'An error occurred during submission processing.',
    });
  }
}

import { google } from 'googleapis';

/**
 * Appends a new subscription to the Google Sheet after verifying no duplicate exists in the email column.
 */
export async function appendToGoogleSheet(email: string, country: string) {
  const emailVal = email.toLowerCase().trim();
  const countryVal = country.trim();

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle escaped real-new-line strings in private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  if (!clientEmail || !privateKey || !spreadsheetId) {
    const missing = [];
    if (!clientEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_PRIVATE_KEY');
    if (!spreadsheetId) missing.push('GOOGLE_SPREADSHEET_ID');
    throw new Error(`Missing Google Sheets API environment configuration: ${missing.join(', ')}. Please setup these variables inside your hosting platform (e.g. Vercel dashboard).`);
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Step 1: Detect duplicate emails. Check columns to see if emailVal is present.
    let isDuplicate = false;
    try {
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`, // Assumes Column A contains emails
      });

      const rows = getResponse.data.values || [];
      isDuplicate = rows.some((row) => {
        const cellValue = row[0];
        return cellValue && typeof cellValue === 'string' && cellValue.toLowerCase().trim() === emailVal;
      });
    } catch (readError: any) {
      console.warn('Could not read existing spreadsheet values. Checking if it is an empty or raw sheet...', readError.message);
      // If the sheet is completely empty or tab is missing, we'll continue to append.
    }

    if (isDuplicate) {
      const error: any = new Error('This Email Address is already registered in our gaming community!');
      error.status = 409;
      throw error;
    }

    // Step 2: Append row with Email and Country
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[emailVal, countryVal, new Date().toISOString()]],
      },
    });

  } catch (error: any) {
    if (error.status === 409 || error.message?.includes('already registered')) {
      throw error;
    }
    console.error('Google Sheets API append failed:', error);
    throw new Error(`Google Sheets connection error: ${error.message || 'unknown error'}`);
  }
}

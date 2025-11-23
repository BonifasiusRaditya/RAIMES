# RAIMES Email Setup Guide

## Contact Form Email Configuration

The contact form now sends real emails to **aryautomo11@gmail.com**. Follow these steps to configure email sending:

### Step 1: Enable Gmail App Passwords

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled
4. After enabling, go to **App passwords**: https://myaccount.google.com/apppasswords
5. Create a new app password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Name it: **RAIMES Contact Form**
6. Google will generate a 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Backend .env File

1. Open `backend/.env`
2. Find the **EMAIL CONFIGURATION** section
3. Update these variables:
   ```env
   EMAIL_USER=aryautomo11@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # Use your 16-char app password WITHOUT spaces
   ```

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

## How It Works

When a user submits the contact form:

1. **Email to RAIMES Team** (aryautomo11@gmail.com):

   - Contains all form details (name, email, institution, inquiry type, message)
   - Professionally formatted with RAIMES branding
   - Includes sender's contact information

2. **Auto-Reply to Sender**:
   - Confirms receipt of their inquiry
   - Shows a copy of their submitted message
   - Indicates expected response time (24-48 hours)

## Testing the Contact Form

1. Navigate to the Contact page: http://localhost:5174/contact
2. Fill out the form with test data
3. Submit the form
4. Check **aryautomo11@gmail.com** for the inquiry email
5. Check the email you entered in the form for the auto-reply

## Email Templates

Both emails include:

- RAIMES purple (#6B46C1) and yellow (#FCD34D) branding
- Professional HTML formatting
- All form details in a structured table
- Timestamp of when the inquiry was received

## Troubleshooting

### "Failed to send message" Error

**Possible causes:**

1. **Incorrect App Password**: Make sure you copied the 16-character password without spaces
2. **2-Step Verification not enabled**: Gmail requires 2FA to use app passwords
3. **Backend server not running**: Start the backend with `npm run dev`
4. **CORS issues**: Make sure frontend URL is in the CORS allowlist

**Check backend console logs:**

```bash
✅ Contact email sent successfully to aryautomo11@gmail.com
✅ Auto-reply sent to: user@example.com
```

### Email Not Received

1. **Check Spam/Junk folder** in aryautomo11@gmail.com
2. **Verify EMAIL_USER** is set to `aryautomo11@gmail.com`
3. **Check backend logs** for error messages
4. **Test Gmail login** with the app password:
   ```bash
   # You can test authentication manually if needed
   ```

## Security Notes

- Never commit your `.env` file with real passwords to Git
- The `.env` file is already in `.gitignore`
- App passwords are safer than using your actual Gmail password
- You can revoke app passwords anytime from Google Account settings

## Development vs Production

**Development** (current setup):

- Uses Gmail SMTP
- Emails sent from aryautomo11@gmail.com
- Good for testing and low-volume sending

**Production** (recommended for scaling):

- Consider services like SendGrid, AWS SES, or Mailgun
- Better deliverability and higher sending limits
- More detailed analytics and tracking

## Contact Form Features

✅ Real-time email sending
✅ Form validation (client & server side)
✅ Professional HTML email templates
✅ Auto-reply confirmation to users
✅ RAIMES branding in emails
✅ Error handling and user feedback
✅ Loading states during submission
✅ Success notifications

---

**Need Help?** Contact the development team or check backend logs for detailed error messages.

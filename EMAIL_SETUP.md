# 📧 Email Verification Setup Guide

## Overview
The system sends OTP (One-Time Password) to students' emails for registration verification. This prevents enrollment number hijacking.

## Setup Steps

### 1. Install Nodemailer
```bash
cd backend
npm install nodemailer
```

### 2. Get Gmail App Password
Since Google requires secure authentication:

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup steps

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password

### 3. Configure .env
Update `backend/.env`:
```dotenv
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail
- `xxxx xxxx xxxx xxxx` with the 16-character app password (spaces are OK)

### 4. Test Email Service

Run backend:
```bash
npm run dev
```

Create a student account with a test email. Check:
1. Your email inbox for OTP
2. Backend console for confirmation message
3. Frontend should show OTP verification screen

### 5. How It Works

**Registration Flow:**
1. Student enters enrollment number + email + password
2. Backend generates random 6-digit OTP
3. OTP sent to their email (formatted, professional-looking)
4. OTP valid for 15 minutes
5. Student enters OTP on verification screen
6. After verification ✅, they can login

**Security Features:**
- ✅ Enrollment number can't be hijacked (need email access)
- ✅ OTP expires after 15 minutes
- ✅ Random 6-digit codes
- ✅ Email verification required before login
- ✅ Can't reuse email for multiple accounts

## Troubleshooting

### "SMTP Error: Invalid login"
- Wrong EMAIL_USER or EMAIL_PASSWORD
- Gmail App Password is case-sensitive
- Restart backend after changing .env

### "Less secure app access"
- Gmail no longer allows "Less secure apps"
- Use App Password method (above) instead

### Email not arriving
- Check spam/trash folder
- Verify EMAIL_USER is correct
- Check backend console for errors
- Test Gmail SMTP with a simple test script

### OTP Not Sent / Immediate Error
- Registration and forgot-password now fail-fast if SMTP is not configured.
- Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are present and correct.
- Restart backend after `.env` changes.

## Production Considerations

For production, consider:
1. **SendGrid** or **Mailgun** (more reliable)
2. **Rate limiting** on OTP requests
3. **Email templates** in database
4. **Resend OTP** button (with cooldown)

## Optional SMS OTP (Twilio)

Student registration now prefers SMS OTP on the phone number preloaded in Student Master records.
If SMS is not configured, the system automatically falls back to email OTP.

Add these optional variables in `backend/.env`:

```dotenv
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

Notes:
- Keep number in E.164 format (example: `+14155552671`).
- If student phone is 10 digits, backend assumes India code `+91`.
- If SMS send fails, backend tries email OTP before returning error.

## Example Email Format

Students receive a professional email with:
- OTP in large, clear text
- Expiration warning (15 min)
- Security notice (don't share OTP)
- Professional branding

---

**Questions?** Check backend console logs during registration for debugging info.

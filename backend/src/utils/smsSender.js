const getTwilioConfig = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        return null;
    }

    return { accountSid, authToken, fromNumber };
};

const normalizePhone = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return null;

    // If a 10-digit Indian number is provided, assume +91.
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;

    return null;
};

export const sendOTPSMS = async (phone, otp, fullName = "Student") => {
    const config = getTwilioConfig();
    if (!config) {
        return { skipped: true, reason: "SMS provider not configured" };
    }

    const to = normalizePhone(phone);
    if (!to) {
        return { skipped: true, reason: "Invalid phone format" };
    }

    const message = `Hi ${fullName}, your Placement Management OTP is ${otp}. Valid for 10 minutes.`;

    const body = new URLSearchParams({
        To: to,
        From: config.fromNumber,
        Body: message
    });

    const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SMS send failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return { skipped: false, sid: result.sid, to };
};

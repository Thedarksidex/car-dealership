const nodemailer = require('nodemailer');

// ── Transport ─────────────────────────────────────────────────────────────────
function createTransport() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',   // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const PORTAL_EMAIL  = process.env.PORTAL_EMAIL;   // admin / customer-portal inbox
const FROM_ADDRESS = `"${process.env.SMTP_FROM_NAME || 'Maruti Suzuki Showroom'}" <${process.env.SMTP_USER}>`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── 1. Test Drive Confirmation to User ────────────────────────────────────────
async function sendTestDriveConfirmationToUser({ userName, userEmail, carName, carModel, bookingDate, bookingTime, location }) {
    const transporter = createTransport();
    await transporter.sendMail({
        from: FROM_ADDRESS,
        to: userEmail,
        subject: `Test Drive Confirmed – ${carName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#d32f2f;padding:24px 28px">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">Maruti Suzuki Showroom</h1>
                <p style="color:#ffcdd2;margin:4px 0 0;font-size:0.9rem">Test Drive Booking Confirmation</p>
            </div>
            <div style="padding:28px">
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Your test drive has been successfully booked. Here are your booking details:</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666;width:140px">Car</td><td style="padding:10px 8px;font-weight:600">${carName} – ${carModel}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Date</td><td style="padding:10px 8px">${formatDate(bookingDate)}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Time</td><td style="padding:10px 8px">${bookingTime}</td></tr>
                    <tr><td style="padding:10px 8px;color:#666">Location</td><td style="padding:10px 8px">${location || 'Our showroom – we will confirm the location shortly'}</td></tr>
                </table>
                <p>Our team will contact you to confirm the appointment. If you have any questions, feel free to reply to this email.</p>
                <p style="margin-top:24px;font-size:0.85rem;color:#999">Thank you for choosing Maruti Suzuki!</p>
            </div>
        </div>`,
    });
}

// ── 2. Test Drive Notification to Portal ──────────────────────────────────────
async function sendTestDriveNotificationToPortal({ userName, userEmail, userPhone, carName, carModel, bookingDate, bookingTime, location, notes }) {
    const transporter = createTransport();
    await transporter.sendMail({
        from: FROM_ADDRESS,
        to: PORTAL_EMAIL,
        subject: `[New Test Drive] ${userName} → ${carName} on ${formatDate(bookingDate)}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#1565c0;padding:24px 28px">
                <h1 style="color:#fff;margin:0;font-size:1.3rem">New Test Drive Booking</h1>
            </div>
            <div style="padding:28px">
                <table style="width:100%;border-collapse:collapse">
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666;width:140px">Customer</td><td style="padding:10px 8px;font-weight:600">${userName}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Email</td><td style="padding:10px 8px">${userEmail}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Phone</td><td style="padding:10px 8px">${userPhone}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Car</td><td style="padding:10px 8px">${carName} – ${carModel}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Date</td><td style="padding:10px 8px">${formatDate(bookingDate)}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Time</td><td style="padding:10px 8px">${bookingTime}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Location</td><td style="padding:10px 8px">${location || '-'}</td></tr>
                    <tr><td style="padding:10px 8px;color:#666">Notes</td><td style="padding:10px 8px">${notes || '-'}</td></tr>
                </table>
                <p style="margin-top:20px;color:#666;font-size:0.85rem">Login to the admin panel to confirm or update the status.</p>
            </div>
        </div>`,
    });
}

// ── 3. Enquiry Confirmation to User ───────────────────────────────────────────
async function sendEnquiryConfirmationToUser({ name, email, carName, type, message }) {
    const transporter = createTransport();
    await transporter.sendMail({
        from: FROM_ADDRESS,
        to: email,
        subject: `Enquiry Received – ${carName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#d32f2f;padding:24px 28px">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">Maruti Suzuki Showroom</h1>
                <p style="color:#ffcdd2;margin:4px 0 0;font-size:0.9rem">Enquiry Confirmation</p>
            </div>
            <div style="padding:28px">
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thank you for your enquiry. We have received your request and our team will get in touch with you shortly.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666;width:140px">Car</td><td style="padding:10px 8px;font-weight:600">${carName}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Enquiry Type</td><td style="padding:10px 8px;text-transform:capitalize">${type}</td></tr>
                    ${message ? `<tr><td style="padding:10px 8px;color:#666">Your Message</td><td style="padding:10px 8px">${message}</td></tr>` : ''}
                </table>
                <p>Typical response time is within 24 hours during business days.</p>
                <p style="margin-top:24px;font-size:0.85rem;color:#999">Thank you for choosing Maruti Suzuki!</p>
            </div>
        </div>`,
    });
}

// ── 4. Enquiry Notification to Portal ─────────────────────────────────────────
async function sendEnquiryNotificationToPortal({ name, email, phone, carName, type, message }) {
    const transporter = createTransport();
    await transporter.sendMail({
        from: FROM_ADDRESS,
        to: PORTAL_EMAIL,
        subject: `[New Enquiry] ${name} → ${carName} (${type})`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
            <div style="background:#1565c0;padding:24px 28px">
                <h1 style="color:#fff;margin:0;font-size:1.3rem">New Customer Enquiry</h1>
            </div>
            <div style="padding:28px">
                <table style="width:100%;border-collapse:collapse">
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666;width:140px">Name</td><td style="padding:10px 8px;font-weight:600">${name}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Email</td><td style="padding:10px 8px">${email}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Phone</td><td style="padding:10px 8px">${phone}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Car</td><td style="padding:10px 8px">${carName}</td></tr>
                    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 8px;color:#666">Enquiry Type</td><td style="padding:10px 8px;text-transform:capitalize">${type}</td></tr>
                    <tr><td style="padding:10px 8px;color:#666">Message</td><td style="padding:10px 8px">${message || '-'}</td></tr>
                </table>
                <p style="margin-top:20px;color:#666;font-size:0.85rem">Login to the admin panel to respond to this enquiry.</p>
            </div>
        </div>`,
    });
}

module.exports = {
    sendTestDriveConfirmationToUser,
    sendTestDriveNotificationToPortal,
    sendEnquiryConfirmationToUser,
    sendEnquiryNotificationToPortal,
};

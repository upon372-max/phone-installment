const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send email notification
const sendEmail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4361ee;">📱 Phone Installment</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message}
          </div>
          <p style="color: #999; font-size: 12px;">This is an automated message from Phone Installment System.</p>
        </div>
      `,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    return false;
  }
};

// Send WhatsApp notification
const sendWhatsApp = async (to, message) => {
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`WhatsApp sent to ${to}`);
    return true;
  } catch (error) {
    console.error('WhatsApp error:', error.message);
    return false;
  }
};

// Payment confirmation email
const sendPaymentConfirmation = async (customerEmail, customerName, amount, remainingBalance, nextDueDate) => {
  const subject = 'Payment Confirmation - Phone Installment';
  const message = `
    <h3>Dear ${customerName},</h3>
    <p>Your payment has been successfully recorded.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #e8f4fd;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Paid</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${amount}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Remaining Balance</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${remainingBalance}</td>
      </tr>
      <tr style="background: #e8f4fd;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Next Due Date</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(nextDueDate).toLocaleDateString()}</td>
      </tr>
    </table>
    <p>Thank you for your payment!</p>
  `;
  return sendEmail(customerEmail, subject, message);
};

// Payment confirmation WhatsApp
const sendPaymentConfirmationWhatsApp = async (customerPhone, customerName, amount, remainingBalance, nextDueDate) => {
  const message = `📱 *Phone Installment*\n\nDear ${customerName},\n\nYour payment has been recorded!\n\n💰 *Amount Paid:* Rs. ${amount}\n📊 *Remaining Balance:* Rs. ${remainingBalance}\n📅 *Next Due Date:* ${new Date(nextDueDate).toLocaleDateString()}\n\nThank you for your payment! ✅`;
  return sendWhatsApp(customerPhone, message);
};

// Payment due reminder
const sendPaymentReminder = async (customerEmail, customerPhone, customerName, amount, dueDate) => {
  const subject = 'Payment Reminder - Phone Installment';
  const emailMessage = `
    <h3>Dear ${customerName},</h3>
    <p>This is a friendly reminder that your installment payment is due soon.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #fff3cd;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Due</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${amount}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Due Date</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(dueDate).toLocaleDateString()}</td>
      </tr>
    </table>
    <p>Please make your payment on time to avoid any issues.</p>
  `;
  const whatsappMessage = `📱 *Phone Installment - Payment Reminder*\n\nDear ${customerName},\n\n⚠️ Your payment is due soon!\n\n💰 *Amount Due:* Rs. ${amount}\n📅 *Due Date:* ${new Date(dueDate).toLocaleDateString()}\n\nPlease make your payment on time.`;

  await sendEmail(customerEmail, subject, emailMessage);
  await sendWhatsApp(customerPhone, whatsappMessage);
};

module.exports = { sendEmail, sendWhatsApp, sendPaymentConfirmation, sendPaymentConfirmationWhatsApp, sendPaymentReminder };
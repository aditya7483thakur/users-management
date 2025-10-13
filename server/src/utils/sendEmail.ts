import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer + Gmail
 * @param to - Recipient's email
 * @param subject - Email subject
 * @param html - HTML content
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // your Gmail
        pass: process.env.SMTP_PASS, // app password (not your Gmail password)
      },
    });

    const mailOptions = {
      from: `"User Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw new Error('Failed to send email');
  }
}

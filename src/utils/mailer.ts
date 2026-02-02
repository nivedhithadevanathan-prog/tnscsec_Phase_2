import nodemailer from "nodemailer";

export const sendEmailWithAttachment = async ({
  to,
  subject,
  text,
  attachment,
}: {
  to: string;
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };  
}) => {
  try {
    // Check if email credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials missing. Skipping email sending.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: [attachment],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
    
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    // Don't throw the error - allow form submission to succeed even if email fails
    return null;
  }
};
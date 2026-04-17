import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send reply email to user
export const sendReplyEmail = async (userEmail, userName, replyMessage, subject) => {
  try {
    const mailOptions = {
      from: `"Ecommerce Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Reply to your support ticket: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .email-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .email-body {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .reply-box {
              background: white;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              display: inline-block;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>Support Ticket Update</h2>
            </div>
            <div class="email-body">
              <h3>Hello ${userName},</h3>
              <p>Our support team has responded to your query:</p>
              
              <div class="reply-box">
                <strong>📝 Reply from Support:</strong>
                <p style="margin-top: 10px; line-height: 1.6;">${replyMessage}</p>
              </div>
              
              <p>To view the full conversation and reply, please visit your dashboard:</p>
              
              <div style="text-align: center;">
                <a href="https://apnishop-frontend.onrender.com/dashboard/user/support-messages" class="button">
                  View Conversation
                </a>
              </div>
              
              <p style="margin-top: 20px;">Thank you for contacting us!</p>
              <p><strong>Best regards,</strong><br>Ecommerce Support Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Ecommerce. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};
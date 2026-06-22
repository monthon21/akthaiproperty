import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/th/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs just in case
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"AK Thai Property" <admin@akthaiproperty.com>',
    to: email,
    subject: "Reset your password (ตั้งรหัสผ่านใหม่)",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A192F; color: #ffffff; padding: 30px; border-radius: 8px;">
        <h2 style="color: #D4AF37; text-align: center;">AK Thai Property</h2>
        <p style="font-size: 16px;">สวัสดีครับ,</p>
        <p style="font-size: 16px;">คุณได้ทำการร้องขอตั้งรหัสผ่านใหม่สำหรับบัญชี AK Thai Property</p>
        <p style="font-size: 16px;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 1 ชั่วโมง):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #D4AF37; color: #0A192F; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">ตั้งรหัสผ่านใหม่ (Reset Password)</a>
        </div>
        <p style="font-size: 14px; color: #aaaaaa;">หากคุณไม่ได้ทำการร้องขอการเปลี่ยนรหัสผ่าน กรุณาละเว้นอีเมลฉบับนี้</p>
        <hr style="border: 0; border-top: 1px solid #333; margin: 30px 0;" />
        <p style="font-size: 12px; text-align: center; color: #888;">© ${new Date().getFullYear()} AK Thai Property. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send email");
  }
}

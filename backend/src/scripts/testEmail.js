require("dotenv").config();

const { sendEmail } = require("../services/emailService");

const testEmail = async () => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Swiss Barber - Email Test",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Swiss Barber Email Test</h2>
          <p>This is a test email from the Swiss Barber backend.</p>
          <p>If you received this email, Gmail SMTP is working correctly.</p>
        </div>
      `,
    });

    console.log("Test email sent successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Test email failed:", error.message);
    process.exit(1);
  }
};

testEmail();
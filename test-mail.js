const nodemailer = require("nodemailer");

console.log("Email user loaded:", process.env.SMTP_EMAIL ? "Yes" : "No");
console.log("Email pass loaded:", process.env.SMTP_PASSWORD ? "Yes" : "No");

async function main() {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    try {
        const info = await transporter.sendMail({
            from: "varshini.odc@gmail.com",
            to: "varshini.odc@gmail.com", // Send to yourself
            subject: "Test Email from Script",
            text: "If you see this, Nodemailer is working perfectly!"
        });

        console.log("✅ Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", JSON.stringify(error, null, 2));
    }
}

main();

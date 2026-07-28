const nodemailer = require("nodemailer");
const { quotationEmailTemplate } = require("../templates/quotationEmail");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {
        rejectUnauthorized: false
    }
});

// Verify SMTP
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});

console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

exports.sendQuoteEmail = async (req, res) => {
    try {

        const { to, subject, html } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: "Recipient Email Missing"
            });
        }

        const info = await transporter.sendMail({
            from: `"TravLog" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: quotationEmailTemplate(html)
        });

        console.log("MAIL SENT:", info.response);

        res.json({
            success: true,
            message: "Email Sent Successfully"
        });

    } catch (err) {

        console.log("MAIL ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
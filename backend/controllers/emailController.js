const nodemailer = require("nodemailer");
const {
    quotationEmailTemplate
} = require("../templates/quotationEmail");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
exports.sendQuoteEmail = async (req, res) => {

    try {

        const { to, subject, html } = req.body;

        console.log("Sending mail to:", to);

        const info = await transporter.sendMail({
            from: `"TravLog" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: quotationEmailTemplate(html)
        });

        console.log("MAIL SENT:", info);

        res.json({
            success: true
        });

    } catch (err) {

        console.error("MAIL ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
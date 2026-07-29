const nodemailer = require("nodemailer");
const { quotationEmailTemplate } = require("../templates/quotationEmail");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendQuoteEmail = async (req, res) => {
    console.log("EMAIL API HIT");

    try {

        const { to, subject, html } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: "Recipient Email Missing"
            });
        }

        console.log("Checking SMTP...");

        await transporter.verify();

        console.log("SMTP Connected");

        const info = await transporter.sendMail({

            from: `"TravLog" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html: quotationEmailTemplate(html)

        });

        console.log(info);

        return res.json({
            success: true,
            message: "Email Sent Successfully"
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
const nodemailer = require("nodemailer");
const {
    quotationEmailTemplate
} = require("../templates/quotationEmail");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendQuoteEmail = async (req, res) => {
    try {

        const {
            to,
            subject,
            html
        } = req.body;

        if (!to)
            return res.status(400).json({
                success: false,
                message: "Recipient Email Missing"
            });

        await transporter.sendMail({
            from: `"TravLog" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: quotationEmailTemplate(html)
        });

        res.json({
            success: true,
            message: "Email Sent Successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
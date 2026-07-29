const nodemailer = require("nodemailer");
const { quotationEmailTemplate } = require("../templates/quotationEmail");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((err, success) => {
    if (err) {
        console.log("SMTP ERROR:", err);
    } else {
        console.log("SMTP READY");
    }
});

exports.sendQuoteEmail = async (req, res) => {

    console.log("=========== EMAIL API HIT ===========");
    console.log(req.body);

    try {

        const { to, subject, html } = req.body;

        console.log("TO:", to);
        console.log("SUBJECT:", subject);

        const info = await transporter.sendMail({
            from: `"TravLog" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: quotationEmailTemplate(html)
        });

        console.log("MAIL SENT SUCCESS");
        console.log(info);

        return res.json({
            success: true,
            message: "Email Sent Successfully"
        });

    } catch (err) {

        console.log("=========== FULL ERROR ===========");
        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
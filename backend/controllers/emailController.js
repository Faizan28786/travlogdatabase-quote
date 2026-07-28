const nodemailer = require("nodemailer");
const {
    quotationEmailTemplate
} = require("../templates/quotationEmail");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  tls: {
    rejectUnauthorized: false
  }
});
transporter.verify(function (err, success) {
    if (err) {
        console.log("SMTP ERROR:", err);
    } else {
        console.log("SMTP READY");
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
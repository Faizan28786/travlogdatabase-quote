const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,          // <-- IMPORTANT

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {
        rejectUnauthorized: false
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

        console.log("Sending mail to:", to);

        const info = await transporter.sendMail({
            from: `"TravLog" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: quotationEmailTemplate(html)
        });

        console.log("MAIL SENT SUCCESS");
        console.log(info.response);

        res.json({
            success: true,
            message: "Email Sent Successfully"
        });

    } catch (err) {

        console.error("MAIL ERROR FULL:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};
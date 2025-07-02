const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "1cbda5ab2ba046",
        pass: "df49e54be78cbe"
    }
});

exports.sendVerificationEmail = async (to, code) => {
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD)
    const mailOptions = {
        from: `"Bar Company" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Підтвердження email',
        text: `Ваш код підтвердження: ${code}`,
        html: `<p>Ваш код підтвердження: <b>${code}</b></p><p>Він дійсний протягом 15 хвилин.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

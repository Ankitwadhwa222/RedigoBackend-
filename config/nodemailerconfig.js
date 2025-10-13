const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD 
     }
});

function sendMail(to, subject, otp) {
    const mailOptions = {
        from: `"Redigo" <${process.env.EMAIL}>`,  
        to: to,
        subject: subject || "Your OTP Code for Redigo",  
        text: `Hello User,

        Thank you for using Redigo!  

        Your One-Time Password (OTP) is: ${otp}

        Please enter this code to verify your email address. This OTP is valid for 5 minutes.

        If you did not request this code, please ignore this email.

        Best regards,
        The Redigo Team  
        🚗 Share your ride, share the journey!
        `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

module.exports = {
    sendMail
}
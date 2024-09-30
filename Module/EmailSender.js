// Importing the modules
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail')
require('dotenv').config();



// Write the function to send an email
async function sendEmail(toEmail, authId, authUsername, otp){
    new Promise((resolve, reject) => {
        

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: toEmail,
        from: process.env.SENDGRID_EMAIL,
        subject: 'Verify Your SkyChat Account',
        text: `Hello ${authUsername},\n\nYour OTP is ${otp}.\n\nThanks,\nTeam Auth`,
        html: `
        <!DOCTYPE html>
<html>
<head>
  <title>SkyChat OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .logo {
      text-align: center;
    }
    .logo img {
      max-width: 200px;
    }
    .message {
      margin-top: 20px;
    }
    .otp-code {
      font-weight: bold;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://i.ibb.co/DWMZYdY/Alive-Image.jpg" alt="SkyChat Logo">
    </div>
    <div class="message">
      <p>Hi ${authUsername},</p>
      <p>Your verification code for SkyChat is: [ ${otp} ].</p>

      <p> your account is: [ ${authId} ].</p>

<p>Please enter this code within 15 minutes to complete the verification process.</p>

<p>If you didn't request this code, please ignore this email.</p>

<p>Thanks,</p>
<p>The SkyChat Team.</p>
    </div>
  </div>
</body>
</html>
`,};
    sgMail.send(msg).then(() => {
        resolve(true);
    }).catch((error) => {
        console.error(error);
        reject(false);
    });
});
}


// function to generate a random token
function generateOTP(length = 6) {
    const characters = '0123456789';
    let otp = '';  
    for (let i = 0; i < 4; i++) {
      const randomIndex = crypto.randomInt(0, characters.length);
      otp += characters[randomIndex];
    } 
    return otp;
  }
  // Export the modules
module.exports = {
    sendEmail,
    generateOTP
}
// /scripts/notifyOnFailure.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Change this to the recipient email if different
  subject: 'Development Server Error',
  text: 'The development server has stopped unexpectedly.',
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});


// to install --
// npm install nodemailer dotenv
// npm install nodemailer

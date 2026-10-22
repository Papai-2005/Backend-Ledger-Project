require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegisterationEmail(userEmail, name){
    const subject = "Welcome to Backend Ledger!";
    const text = `Hello ${name}, \n\nThank you for registering at Backend Ledger. We are excited to have you on board!\n\nBest 
    regards, \nThe Backend Ledger Team`;
    const html = `<p>Hello ${name}, </p><p>Thank you for registering at Backend Ledger. We are excited to have you on board!</p><p>Best 
    regards, <br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionEmail(userEmail, name, account, toAccount) {
    const subject = 'Transaction Succesful!';
    const text = `Hello ${name}, \n\nYour transaction of $${amount} to account ${toAccount} was succesful. \n\n Best regards, \n The Backend Ledger Team`;
  
      await sendEmail(userEmail, subject, text); 
  }


  async function sendTransactionFailureEmail(userEmail, name, account, toAccount) {
    const text = `Hello ${name}, \n\nYour transaction of $${amount} to account ${toAccount} was Failed. \n\n Best regards, \n The Backend Ledger Team`;
    const subject = 'Transaction Failed';

    await sendEmail(userEmail, subject, text);
  
  }

module.exports = {
    sendRegisterationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};
//Remove after testing only to create test email 
// to test email sending and OTP verification
import nodemailer from 'nodemailer';

let transporter = null;

// Initialize the test transporter
async function initTransport() {
  console.log('Loading Ethereal test account...');

  // Create the test account 
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('Ethereal test account email');
  console.log('Email:', testAccount.user);
  return transporter;
}

//Export a promise that starts the initialization
export const transporterPromise = initTransport();

//Export a getter for the transporter
export async function getTransporter() {
  if (!transporter) {
    transporter = await transporterPromise;
  }
  return transporter;
}

/*
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'noreply@cirrica.com',
    pass: process.env.ZOHO_API_KEY,
  },
});

export default transporter;*/

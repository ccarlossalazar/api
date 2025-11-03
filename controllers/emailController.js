import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'
import { getTransporter } from '../config/email.js'
import loadOtpTemplate from '../emailTemplates/otp.js'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const sendOtpEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  try {
    await prisma.otps.create({
      data: {
        email: email.toLowerCase(),
        code: otpCode.toString(), 
        expires_at: expiresAt
      }
    })

  const htmlContent = loadOtpTemplate(otpCode);

  const transporter = await getTransporter()

 const info = await transporter.sendMail({
      from: 'No-Reply <noreply@cirrica.com>',
      to: email,
      subject: 'One-Time Code - Cirrica Capital',
      text: `Here is your one-time code: ${otpCode}`,
      html: htmlContent,
    })

    console.log('📧 OTP email sent:', info.messageId);
    console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info))

    return res.status(200).json({ message: 'OTP sent successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
    console.error('Error sending OTP email:', err);
  }
};

export const verifyOtpEmail = async(req, res) => {
  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' })

    try {
      const otpRecord = await prisma.otps.findFirst({
        where: { email: email.toLowerCase() },
        orderBy: { created_at: 'desc'}
      })

      if(!otpRecord) {
        return res.status(400).json({ error: 'No OTP found for this email'})
      }

      if (new Date() > otpRecord.expires_at) {
        return res.status(400).json({ error: 'OTP has expired'})
      }

           if (otpRecord.code !== code) {
      return res.status(400).json({ error: 'Invalid OTP code'})
     }

     await prisma.otps.delete ({ 
      where: {id: otpRecord.id}
     })

     const otpToken = jwt.sign ({ email, otp_verified: true}, JWT_SECRET, {
      expiresIn: '10m'
     })

     res.cookie('token', otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict', 
      maxAge: 10 * 60 * 1000
     })

     return res.status(200).json({message: 'OTP verified successfully'})
     } catch (error) {
      console.error(error)
      return res.status(500).json({error: 'Server error'})
     }
  
}

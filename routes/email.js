import express from 'express'
import { sendOtpEmail, verifyOtpEmail } from '../controllers/emailController.js';

const router = express.Router();


router.post('/send-otp', sendOtpEmail);
router.post('/verify-otp', verifyOtpEmail);

export default router

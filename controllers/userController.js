
import {PrismaClient} from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// change env variable later
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

//Find user by email
async function getUserByEmail(email) {
  return prisma.users.findUnique({
    where: { email: email.toLowerCase() }
  })
}

// Signup
export const signup = async (req, res) => {
  let { firstName, lastName, email, password } = req.body
  const otpToken = req.cookies?.token

  if (!firstName || !lastName || !password || !otpToken) {
    return res
      .status(400)
      .json({ error: 'All fields and OTP verification required' });
  }

  // Verify OTP session token (JWT)
  let decoded;
  try {
    decoded = jwt.verify(otpToken, JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired OTP session' });
  }

  if (!decoded?.otp_verified) {
    return res.status(400).json({ error: 'OTP verification required' });
  }

  email = decoded.email.toLowerCase()
  const existingUser = await prisma.users.findUnique({ where: { email } })
  if (existingUser) return res.status(400).json({ error: 'Email already registered' })

  // Password validation
  const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
        error:
          'Password must be at least 8 characters and contain at least one special character.',
      })
  }

  const hash = await bcrypt.hash(password, 10);
  
  const newUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email,
        password: hash,
        verified: true,
    },
  })

  const authToken = jwt.sign(
    {
      id: newUser.id, 
      email: newUser.email }, JWT_SECRET, {expiresIn: '7d'})

  res.cookie('authToken', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
})

  res.clearCookie('token')

  res.json({ user: {id: newUser.id, email: newUser.email, first_name: newUser.first_name} })

}

// Signin
export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await getUserByEmail(email)
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' })

  // Create JWT
  const authToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_verified: user.is_verified,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('authToken', authToken, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
 
  res.json({ message: 'Signed in successfully' })
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    })
    return res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({ error: 'Failed to log out' })
  }
}


// Delete temp user (for email existence check)
export const deleteTemp = async (req, res) => {
  try {
    let { email } = req.body
    if(!email) return res.status(400).json({ error: 'Email Required'})
      email = email.toLowerCase()

    const user = await prisma.users.findUnique({ where: { email }})

    if (!user) return res.status(404).json({ error: "User not found"})

    const dummyMatch = await bcrypt.compare('dummyPassword123!', user.password)
    if (user.verified === false && dummyMatch){
      await prisma.users.delete({ where: {id: user.id}})
      return res.json({ message: "Temporary user deleted"})
    }

    res.status(400).json({ error: "User is not a temporary user"})
  }catch (error) {
    console.error("Delete temp user error:", error)
    res.status(500).json({ error: "Internal Server Error"})
  }

};

// Check if email exists (no user creation)
export const checkEmail = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await getUserByEmail(email)
    res.json({ exists: !!user })
  } catch (error) {
    console.error("Check email error:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}


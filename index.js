import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import portfolios from './routes/portfolios.js'
import tournaments from './routes/tournaments.js'
import auth from './routes/email.js'
import users from './routes/user.js'
import prisma from './prisma/prismaClient.js'
import './config/email.js'
import { authMiddleware } from './middleware/authentication.js'

dotenv.config()
const app = express() 
const PORT = process.env.PORT || 8080

//Can delete later just used to make sure db connection is working
async function testDbConnection() {
  try {
    const users = await prisma.users.findMany()
    console.log(`Connected to database.`, users)
  } catch (err){
    console.error("Database connection error:", err)
  }
}

app.use(cors())
app.use(express.json())
app.use(cookieParser())

// Authentication middleware for all routes except public routes
app.use((req, res, next) => {
  const publicRoutes = ['/auth/send-otp', '/auth/verify-otp', '/users/signup', '/users/signin']
  if (publicRoutes.includes(req.path)) return next()
    return authMiddleware(req, res, next)
})

app.get('/', (req, res) => {
res.json({ message: 'Server is running' })
})

// Routes
app.use('/portfolios', portfolios)
app.use('/tournaments', tournaments)
app.use('/auth', auth)
app.use('/users', users)

app.listen(PORT, () => {
  testDbConnection()
});
  
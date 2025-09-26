import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import prisma from './prisma/prismaClient.js'
import portfolios from './routes/portfolios.js'
import tournaments from './routes/tournaments.js'

/*import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const emailRouter = require('./routes/email.cjs');
const userRouter = require('./routes/user.cjs');
*/
dotenv.config()
const app = express() 
const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

async function testDbConnection() {
  try {
    await prisma.$connect()
    const users = await prisma.users.findMany()
    console.log(`Connected to database. Users:`, users)
  } catch (err){
    console.error("Database connection error:", err)
  }
}

app.use(cors())
app.use(express.json())

app.use('/portfolios', portfolios)
app.use('/tournaments', tournaments)


/*
app.use('/email', emailRouter);
app.use('/user', userRouter);
*/


app.listen(PORT, () => {
  testDbConnection()
  console.log(`Server running at: http://localhost:${PORT}`);
});
  
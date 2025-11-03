import express from 'express'
import { signup, signin, checkEmail, deleteTemp, logout } from '../controllers/userController.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/logout', logout)
router.post('/delete-temp', deleteTemp)
router.post('/check-email', checkEmail)
export default router

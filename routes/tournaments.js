import express from 'express'
import {getAllTournaments } from '../controllers/tournamentController.js'

const router = express.Router()

router.get('/', getAllTournaments)

export default router
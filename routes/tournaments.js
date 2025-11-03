import express from 'express'
import {createTournament, getAllTournaments, joinTournament, deleteTournament, updateTournament} from '../controllers/tournamentController.js'

const router = express.Router()

router.post('/join', joinTournament)
router.delete('/:id', deleteTournament)
router.post('/', createTournament)
router.get('/', getAllTournaments)
router.patch('/:id', updateTournament)
router.delete('/:id', deleteTournament)

export default router
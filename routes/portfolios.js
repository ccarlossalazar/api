import express from 'express'
import { createPortfolio, getAllPortfolios, getUserPortfolios, deletePortfolio, updatePortfolio } from '../controllers/portfolioController.js'

const router= express.Router()

//Create Portfolio
router.post('/', createPortfolio)
router.get('/', getAllPortfolios)
router.get('/users/', getUserPortfolios)
router.patch('/:id', updatePortfolio)
router.delete('/:id', deletePortfolio)

export default router
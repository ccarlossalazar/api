import express from 'express'
import { createPortfolio, getAllPortfolios } from '../controllers/portfolioController.js'

const router= express.Router()

//Create Portfolio
router.post('/', createPortfolio)

router.get('/', getAllPortfolios)

export default router
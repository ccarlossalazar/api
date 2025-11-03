import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const createPortfolio = async (req, res) => {
    const { name, balance } = req.body
    const userId = req.user.id

    try {
        const user = await prisma.users.findUnique({ where: { id: userId}})
        if (!user) return res.status(404).json({ message: "User not found"})

        const newPortfolio = await prisma.portfolios.create({
            data: { user_id: userId, name, balance}
        })
        res.status(201).json(newPortfolio)
    } catch (error) {
        console.error(error)
        res.status(400).json({message: "hello"})
    }
}

export const getAllPortfolios = async (req, res) => {
    try {
        const portfolios = await prisma.portfolios.findMany()
        res.status(200).json(portfolios)

    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal server error"})
    }
}

export const getUserPortfolios = async (req, res) => {
    const userId = req.user.id

    try {
        const portfolios = await prisma.portfolios.findMany({ 
            where: {user_id: userId},
            include: { users: true,},
        })
            res.status(200).json(portfolios)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error"})
    }
}

export const deletePortfolio = async (req, res) => {
    const {id} = req.params
    const userId = req.user.id

try {
    const portfolio = await prisma.portfolios.findUnique({ where: { id } })
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' })
    if (portfolio.user_id !== userId)
        return res.status(403).json({ message: 'Forbidden — not your portfolio' })
    await prisma.portfolios.delete({ where: { id } })
    
    res.status(200).json({ message: `${portfolio.name} has been deleted successfully` })
    } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'There was an error deleting the portfolio.' })
    }
}

export const updatePortfolio = async (req, res) => {
    const {id} = req.params
    const {name} = req.body
    const userId = req.user.id

try {
    const portfolio = await prisma.portfolios.findUnique({ where: { id } })
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' })
    if (portfolio.user_id !== userId)
        return res.status(403).json({ message: 'Forbidden — not your portfolio' })

    const updatedPortfolio = await prisma.portfolios.update({
        where: { id },
        data: { name },
    })

    res.status(200).json(updatedPortfolio)
    } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error updating portfolio' })
    }
}
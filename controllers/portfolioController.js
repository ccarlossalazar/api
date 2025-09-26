import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const createPortfolio = async (req, res) => {
    const { user_id, name, balance } = req.body

    try {
        const user = await prisma.users.findUnique({ where: { id: user_id}})
        if (!user) return res.status(404).json({ message: "User not found"})

        const newPortfolio = await prisma.portfolio.create({
            data: { user_id: user_id, name, balance}
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

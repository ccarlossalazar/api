import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const getAllTournaments = async (req,res) => {
    try {
        const tournaments = await prisma.tournaments.findMany()
        res.status(200).json(tournaments)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal Server Error"})
    }
}
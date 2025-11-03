import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()


// Only start_date, end_date, name required
export const createTournament = async (req,res) => {
    const userId = req.user.id
    const {
    start_date, 
    end_date, 
    name, 
    description, 
    is_private, 
    password, 
    starting_balance, 
    max_participants 
} = req.body

    try {
        const newTournament = await prisma.tournaments.create({
            data: {
                creator_id: userId,
                start_date, 
                end_date,
                name,
                description, 
                is_private, 
                password,
                starting_balance,
                max_participants
            },
            include: {
                users:true
            }
        })

        // Create portfolio for tournament creator
        const creatorPortfolio = await prisma.portfolios.create({
            data: { 
                user_id: userId, 
                name: `${newTournament.name} Portfolio`,
                balance: newTournament.starting_balance
            }
        })

        await prisma.tournament_participants.create({
            data: {user_id: userId, tournament_id: newTournament.id, portfolio_id: creatorPortfolio.id}
        })

        res.status(201).json(newTournament)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const updateTournament = async (req,res) => {
    const {id} = req.params
    const userId = req.user.id
    const {
        name, 
        start_date, 
        end_date,
        description, 
        is_private,
        password, 
        max_participants, 
        starting_balance
    } = req.body

    try {
        const tournament = await prisma.tournaments.findUnique({ where: {id}})
        if (!tournament) return res.status(404).json ({ message: "Tournament not found"})
        if (tournament.creator_id !== userId) 
            return res.status(403).json({ message: "Unauthorized"})

        const updatedTournament = await prisma.tournaments.update({
            where: { id },
            data: {
            name,
            start_date,
            end_date,
            description,
            is_private,
            password,
            max_participants,
            starting_balance
        },
        })

        res.status(200).json(updatedTournament)
        } catch (err) {
            console.error(err)
        res.status(500).json({ message: 'Error updating tournament' })
        }
    }


export const deleteTournament = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    try {
    const tournament = await prisma.tournaments.findUnique({ where: { id } })
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
    if (tournament.creator_id !== userId)
        return res.status(403).json({ message: 'Forbidden — not your tournament' })

    await prisma.tournaments.delete({ where: { id } })
    res.status(200).json({ message: `${tournament.name} has been deleted successfully` })
    } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error deleting tournament' })
    }
}

// Admin only?
export const getAllTournaments = async (req,res) => {
    try {
        const tournaments = await prisma.tournaments.findMany()
        res.status(200).json(tournaments)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const joinTournament  = async (req, res) => {
    const userId = req.user.id
    const {tournament_id, password} = req.body
    
    // First find tournament check if it is private and if password matches then if max participants reached
    try {
        const tournament = await prisma.tournaments.findUnique({ where: { id: tournament_id}})
        
        if (!tournament) 
            return res.status(404).json({message: "Tournament not found"})

        if (tournament.is_private) {
            if (!password || password !== tournament.password) {
                return res.status(403).json({message: "Incorrect Password!"})
                }
        }

        const currentParticipantCount = await prisma.tournament_participants.count({
        where: { tournament_id }  
        })

        if (tournament.max_participants && currentParticipantCount >= tournament.max_participants) {
        return res.status(400).json({message: "Max participants has been reached"}) 
        }

        const existingParticipant = await prisma.tournament_participants.findUnique({
        where: { 
            user_id_tournament_id: {user_id: userId, tournament_id}}
        , 
        include: {users:true}
        })

        if (existingParticipant) {
            return res.status(400).json(`${existingParticipant.users.first_name} already joined this tournament. Cannot join again.`)
        }

        const newParticipantPortfolio = await prisma.portfolios.create({
            data: { user_id: userId, name: `${tournament.name} Portfolio`, balance: tournament.starting_balance}
        })

        const newParticipant = await prisma.tournament_participants.create({
            data: {user_id: userId, tournament_id, portfolio_id: newParticipantPortfolio.id}, 
            include: {users: true, tournaments:true, portfolios: true}
        })

        res.status(201).json(`${newParticipant.users.first_name} has successfully joined ${tournament.name}`)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Internal Server Error"})
    }
}
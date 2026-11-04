import {prisma} from "../../core/config/database.ts"
import type { CreateMatchInput } from "./match.type.ts";



export class MatchServiceError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
         this.name="MatchServiceError"
    };
};

export const createMatch = async (data: CreateMatchInput) => {
    if(data.teamAId === data.teamBId){
        throw new MatchServiceError("Team A and Team B cannot be the same", 400);
    }

    return prisma.$transaction(async (tx) => {
        const tournament = await tx.tournament.findUnique({
            where:{
                id: data.tournamentId
            }
        });
        if(!tournament){
        throw new MatchServiceError("Tournament not found", 404);
    
    }
        const registeredTeams = await tx.tournamentTeam.findMany({
            where:{
                tournamentId: data.tournamentId,
                teamId:{
                    in: [data.teamAId, data.teamBId]
                },
            },
            select:{
                teamId: true
            }
        });
        const registeredTeamIds = new Set(registeredTeams.map(team => team.teamId));

        if(!registeredTeamIds.has(data.teamAId)){
             throw new MatchServiceError("Team A is not registered in the tournament", 400);
        }
        if(!registeredTeamIds.has(data.teamBId)){
            throw new MatchServiceError("Team B is not registered in the tournament", 400);

        }
        return tx.match.create({
            data:{
                name: data.name,
                format: data.format,
                totalOvers: data.totalOvers,
                venue: data.venue,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                tournamentId: data.tournamentId,
                teamAId: data.teamAId,
                teamBId: data.teamBId

            },
            include:{
                teamA: true,
                teamB: true,
                tournament:{
                    select:{
                        id: true,
                        name: true,
                       description: true
                    }
                }
            }

        })

    });
    

}
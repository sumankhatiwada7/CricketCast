-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SCORER');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('BATTER', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SCORER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "profileImage" TEXT,
    "role" "PlayerRole",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "jerseyNumber" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_teams" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- CreateIndex
CREATE INDEX "team_players_playerId_idx" ON "team_players"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "team_players_teamId_playerId_key" ON "team_players"("teamId", "playerId");

-- CreateIndex
CREATE INDEX "tournament_teams_teamId_idx" ON "tournament_teams"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_teams_tournamentId_teamId_key" ON "tournament_teams"("tournamentId", "teamId");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

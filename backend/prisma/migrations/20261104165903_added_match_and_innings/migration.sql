-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'ABANDONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM ('T10', 'T20', 'ODI', 'TEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TossDecision" AS ENUM ('BAT', 'FIELD');

-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DECLARED');

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "format" "MatchFormat" NOT NULL DEFAULT 'T20',
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "totalOvers" INTEGER NOT NULL DEFAULT 20,
    "venue" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "tournamentId" UUID NOT NULL,
    "teamAId" UUID NOT NULL,
    "teamBId" UUID NOT NULL,
    "tossWinnerId" UUID,
    "tossDecision" "TossDecision",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innings" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "inningsNumber" INTEGER NOT NULL,
    "battingTeamId" UUID NOT NULL,
    "bowlingTeamId" UUID NOT NULL,
    "status" "InningsStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "legalBalls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_tournamentId_idx" ON "matches"("tournamentId");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_scheduledAt_idx" ON "matches"("scheduledAt");

-- CreateIndex
CREATE INDEX "innings_matchId_idx" ON "innings"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "innings_matchId_inningsNumber_key" ON "innings"("matchId", "inningsNumber");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tossWinnerId_fkey" FOREIGN KEY ("tossWinnerId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

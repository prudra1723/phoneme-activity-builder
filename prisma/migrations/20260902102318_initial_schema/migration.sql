-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WORDLE', 'WORD_SEARCH');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Phoneme" (
    "id" TEXT NOT NULL,
    "symbol" VARCHAR(16) NOT NULL,
    "letters" VARCHAR(32) NOT NULL,
    "example" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "english" VARCHAR(100) NOT NULL,
    "phonetic" VARCHAR(100) NOT NULL,
    "hint" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPhoneme" (
    "wordId" TEXT NOT NULL,
    "phonemeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "WordPhoneme_pkey" PRIMARY KEY ("wordId","position")
);

-- CreateTable
CREATE TABLE "WordList" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordListWord" (
    "wordListId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "WordListWord_pkey" PRIMARY KEY ("wordListId","wordId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
    "showHints" BOOLEAN NOT NULL DEFAULT true,
    "maxGuesses" INTEGER,
    "gridSize" INTEGER,
    "outputFilename" VARCHAR(150),
    "includeAnswers" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "wordListId" TEXT NOT NULL,
    "answerWordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Phoneme_symbol_key" ON "Phoneme"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Word_english_key" ON "Word"("english");

-- CreateIndex
CREATE INDEX "WordPhoneme_phonemeId_idx" ON "WordPhoneme"("phonemeId");

-- CreateIndex
CREATE UNIQUE INDEX "WordList_name_key" ON "WordList"("name");

-- CreateIndex
CREATE INDEX "WordListWord_wordId_idx" ON "WordListWord"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "WordListWord_wordListId_position_key" ON "WordListWord"("wordListId", "position");

-- CreateIndex
CREATE INDEX "Activity_wordListId_idx" ON "Activity"("wordListId");

-- CreateIndex
CREATE INDEX "Activity_answerWordId_idx" ON "Activity"("answerWordId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_phonemeId_fkey" FOREIGN KEY ("phonemeId") REFERENCES "Phoneme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListWord" ADD CONSTRAINT "WordListWord_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordListWord" ADD CONSTRAINT "WordListWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_answerWordId_fkey" FOREIGN KEY ("answerWordId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Make columns nullable in Experience table
ALTER TABLE "Experience" ALTER COLUMN "jobTitle" DROP NOT NULL;
ALTER TABLE "Experience" ALTER COLUMN "companyName" DROP NOT NULL;
ALTER TABLE "Experience" ALTER COLUMN "startDate" DROP NOT NULL;
ALTER TABLE "Experience" ALTER COLUMN "description" DROP NOT NULL;

-- Make columns nullable in Education table
ALTER TABLE "Education" ALTER COLUMN "schoolName" DROP NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "degree" DROP NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "fieldOfStudy" DROP NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "startDate" DROP NOT NULL;
ALTER TABLE "Education" ALTER COLUMN "description" DROP NOT NULL;

-- Make columns nullable in Skill table
ALTER TABLE "Skill" ALTER COLUMN "skillName" DROP NOT NULL;

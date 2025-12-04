-- AddColumn firstName, lastName, jobTitle, address, phone, email, summary, themeColor to Resume
ALTER TABLE "Resume" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Resume" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Resume" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "Resume" ADD COLUMN "address" TEXT;
ALTER TABLE "Resume" ADD COLUMN "phone" TEXT;
ALTER TABLE "Resume" ADD COLUMN "email" TEXT;
ALTER TABLE "Resume" ADD COLUMN "summary" TEXT;
ALTER TABLE "Resume" ADD COLUMN "themeColor" TEXT DEFAULT 'rgb(79, 70, 229)';

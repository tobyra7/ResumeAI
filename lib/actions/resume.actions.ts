"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createResume({
  resumeId,
  userId,
  title,
}: {
  resumeId: string;
  userId: string;
  title: string;
}) {
  try {
    const newResume = await prisma.resume.create({
      data: {
        resumeId,
        userId,
        title,
      },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return { success: true, data: JSON.stringify(newResume) };
  } catch (error: any) {
    console.error(`Failed to create resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function fetchResume(resumeId: string) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return JSON.stringify(resume);
  } catch (error: any) {
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }
}

export async function fetchUserResumes(userId: string) {
  if (userId === "") {
    return [];
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: userId },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return JSON.stringify(resumes);
  } catch (error: any) {
    throw new Error(`Failed to fetch user resumes: ${error.message}`);
  }
}

export async function checkResumeOwnership(userId: string, resumeId: string) {
  if (userId === "") {
    return false;
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
    });

    return resume && resume.userId === userId ? true : false;
  } catch (error: any) {
    throw new Error(`Failed to check resume ownership: ${error.message}`);
  }
}

export async function updateResume({
  resumeId,
  updates,
}: {
  resumeId: string;
  updates: Partial<{
    firstName: string;
    lastName: string;
    jobTitle: string;
    address: string;
    phone: string;
    email: string;
    summary: string;
    themeColor: string;
    title: string;
  }>;
}) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
    });

    if (!resume) {
      return { success: false, error: "Resume not found" };
    }

    const updatedResume = await prisma.resume.update({
      where: { resumeId: resumeId },
      data: updates,
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error(`Failed to update resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function addExperienceToResume(
  resumeId: string,
  experienceDataArray: any
) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    // Eliminar experiencias previas del resumen
    await prisma.experience.deleteMany({
      where: { resumeId: resumeId },
    });

    // Crear nuevas experiencias
    const savedExperiences = await Promise.all(
      experienceDataArray.map((experienceData: any) =>
        prisma.experience.create({
          data: {
            resumeId: resumeId,
            title: experienceData.title || null,
            companyName: experienceData.companyName || null,
            city: experienceData.city || null,
            state: experienceData.state || null,
            startDate: experienceData.startDate || null,
            endDate: experienceData.endDate || null,
            workSummary: experienceData.workSummary || null,
          },
        })
      )
    );

    const updatedResume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating experience to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addEducationToResume(
  resumeId: string,
  educationDataArray: any
) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    // Eliminar educación previa del resumen
    await prisma.education.deleteMany({
      where: { resumeId: resumeId },
    });

    // Crear nueva educación
    const savedEducation = await Promise.all(
      educationDataArray.map((educationData: any) =>
        prisma.education.create({
          data: {
            resumeId: resumeId,
            universityName: educationData.universityName || null,
            degree: educationData.degree || null,
            major: educationData.major || null,
            startDate: educationData.startDate || null,
            endDate: educationData.endDate || null,
            description: educationData.description || null,
          },
        })
      )
    );

    const updatedResume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating education to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addSkillToResume(
  resumeId: string,
  skillDataArray: any
) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    // Eliminar skills previas del resumen
    await prisma.skill.deleteMany({
      where: { resumeId: resumeId },
    });

    // Crear nuevas skills
    const savedSkills = await Promise.all(
      skillDataArray.map((skillData: any) =>
        prisma.skill.create({
          data: {
            resumeId: resumeId,
            name: skillData.name || null,
            rating: skillData.rating || null,
          },
        })
      )
    );

    const updatedResume = await prisma.resume.findUnique({
      where: { resumeId: resumeId },
      include: {
        experience: true,
        education: true,
        skills: true,
      },
    });

    return { success: true, data: JSON.stringify(updatedResume) };
  } catch (error: any) {
    console.error("Error adding or updating skill to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function deleteResume(resumeId: string, path: string) {
  try {
    // Eliminar todas las experiencias, educación y skills asociadas (cascada)
    await prisma.resume.delete({
      where: { resumeId: resumeId },
    });

    revalidatePath(path);

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

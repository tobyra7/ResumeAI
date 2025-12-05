"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  mapResumeFromDB,
  mapExperienceToDB,
  mapEducationToDB,
  mapSkillToDB,
  type FrontendExperience,
  type FrontendEducation,
  type FrontendSkill,
  type DBResume,
} from "@/lib/mappers/resume.mappers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseHeaders() {
  if (!SERVICE_ROLE) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured in environment");
  }
  return {
    "Content-Type": "application/json",
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
  };
}

async function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  const url = `${SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/${path}`;
  const headers = {
    ...(options.headers || {}),
    ...supabaseHeaders(),
  } as Record<string,string>;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase request failed: ${res.status} ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

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
    const id = uuidv4();
    const now = new Date().toISOString();
    const created = await supabaseFetch(`Resume`, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ id, resumeId, userId, title, createdAt: now, updatedAt: now }),
    });

    return { success: true, data: JSON.stringify(created[0]) };
  } catch (error: any) {
    console.error(`Failed to create resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function fetchResume(resumeId: string) {
  try {
    const select = encodeURIComponent('*,Experience(*),Education(*),Skill(*)');
    const rows = await supabaseFetch(`Resume?resumeId=eq.${resumeId}&select=${select}`);
    const dbResume = rows[0] as DBResume | undefined;
    
    if (!dbResume) {
      return JSON.stringify(null);
    }
    
    // Use centralized mapper to convert DB format to Frontend format
    const frontendResume = mapResumeFromDB(dbResume);
    return JSON.stringify(frontendResume);
  } catch (error: any) {
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }
}

export async function fetchUserResumes(userId: string) {
  if (userId === "") {
    return [];
  }

  try {
    const select = encodeURIComponent('*,Experience(*),Education(*),Skill(*)');
    const rows = await supabaseFetch(`Resume?userId=eq.${userId}&select=${select}&order=updatedAt.desc`);
    
    // Use centralized mapper for each resume
    const mappedResumes = (rows || []).map((dbResume: DBResume) => 
      mapResumeFromDB(dbResume)
    );
    
    return JSON.stringify(mappedResumes);
  } catch (error: any) {
    throw new Error(`Failed to fetch user resumes: ${error.message}`);
  }
}

export async function checkResumeOwnership(userId: string, resumeId: string) {
  if (userId === "") {
    return false;
  }

  try {
    const rows = await supabaseFetch(`Resume?resumeId=eq.${resumeId}&select=userId`);
    const row = rows && rows[0];
    return !!(row && row.userId === userId);
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
    // patch the resume
    const updated = await supabaseFetch(`Resume?resumeId=eq.${resumeId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(updates),
    });
    return { success: true, data: JSON.stringify(updated[0]) };
  } catch (error: any) {
    console.error(`Failed to update resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export async function addExperienceToResume(
  resumeId: string,
  experienceDataArray: FrontendExperience[]
) {
  try {
    // verify resume exists
    const resumeRows = await supabaseFetch(`Resume?resumeId=eq.${resumeId}&select=id`);
    if (!resumeRows || resumeRows.length === 0) throw new Error('Resume not found');

    // delete existing experiences
    await supabaseFetch(`Experience?resumeId=eq.${resumeId}`, { method: 'DELETE' });

    // Use mapper to convert frontend format to DB format
    const now = new Date().toISOString();
    const mapped = experienceDataArray.map((exp) => {
      const dbExp = mapExperienceToDB(exp, resumeId);
      return {
        ...dbExp,
        id: uuidv4(), // Generate new ID for each
        createdAt: now,
        updatedAt: now,
      };
    });

    if (mapped.length > 0) {
      await supabaseFetch('Experience', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(mapped),
      });
    }

    // Fetch updated resume and map back to frontend format
    const updated = await supabaseFetch(
      `Resume?resumeId=eq.${resumeId}&select=${encodeURIComponent('*,Experience(*),Education(*),Skill(*)')}`
    );
    const frontendResume = mapResumeFromDB(updated[0] as DBResume);
    return { success: true, data: JSON.stringify(frontendResume) };
  } catch (error: any) {
    console.error("Error adding or updating experience to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addEducationToResume(
  resumeId: string,
  educationDataArray: FrontendEducation[]
) {
  try {
    const resumeRows = await supabaseFetch(`Resume?resumeId=eq.${resumeId}&select=id`);
    if (!resumeRows || resumeRows.length === 0) throw new Error('Resume not found');

    await supabaseFetch(`Education?resumeId=eq.${resumeId}`, { method: 'DELETE' });

    // Use mapper to convert frontend format to DB format
    const now = new Date().toISOString();
    const mapped = educationDataArray.map((edu) => {
      const dbEdu = mapEducationToDB(edu, resumeId);
      return {
        ...dbEdu,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
    });

    if (mapped.length > 0) {
      await supabaseFetch('Education', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(mapped),
      });
    }

    // Fetch updated resume and map back to frontend format
    const updated = await supabaseFetch(
      `Resume?resumeId=eq.${resumeId}&select=${encodeURIComponent('*,Experience(*),Education(*),Skill(*)')}`
    );
    const frontendResume = mapResumeFromDB(updated[0] as DBResume);
    return { success: true, data: JSON.stringify(frontendResume) };
  } catch (error: any) {
    console.error("Error adding or updating education to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function addSkillToResume(
  resumeId: string,
  skillDataArray: FrontendSkill[]
) {
  try {
    const resumeRows = await supabaseFetch(`Resume?resumeId=eq.${resumeId}&select=id`);
    if (!resumeRows || resumeRows.length === 0) throw new Error('Resume not found');

    await supabaseFetch(`Skill?resumeId=eq.${resumeId}`, { method: 'DELETE' });

    // Use mapper to convert frontend format to DB format
    const now = new Date().toISOString();
    const mapped = skillDataArray.map((skill) => {
      const dbSkill = mapSkillToDB(skill, resumeId);
      return {
        ...dbSkill,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
    });

    if (mapped.length > 0) {
      await supabaseFetch('Skill', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(mapped),
      });
    }

    // Fetch updated resume and map back to frontend format
    const updated = await supabaseFetch(
      `Resume?resumeId=eq.${resumeId}&select=${encodeURIComponent('*,Experience(*),Education(*),Skill(*)')}`
    );
    const frontendResume = mapResumeFromDB(updated[0] as DBResume);
    return { success: true, data: JSON.stringify(frontendResume) };
  } catch (error: any) {
    console.error("Error adding or updating skill to resume: ", error);
    return { success: false, error: error?.message };
  }
}

export async function deleteResume(resumeId: string, path: string) {
  try {
    // Eliminar todas las experiencias, educación y skills asociadas (cascada)
    await supabaseFetch(`Resume?resumeId=eq.${resumeId}`, { method: 'DELETE' });

    revalidatePath(path);

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete resume: ${error.message}`);
    return { success: false, error: error.message };
  }
}

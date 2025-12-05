/**
 * Centralized mapping layer between database columns and frontend fields
 * This ensures consistency across all CRUD operations
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DBExperience {
  id: string;
  resumeId: string;
  jobTitle: string | null;
  companyName: string | null;
  city?: string | null;
  state?: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendExperience {
  id?: string;
  title: string;
  companyName: string;
  city?: string;
  state?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  workSummary: string;
}

export interface DBEducation {
  id: string;
  resumeId: string;
  schoolName: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendEducation {
  id?: string;
  universityName: string;
  degree: string;
  major: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface DBSkill {
  id: string;
  resumeId: string;
  skillName: string | null;
  proficiency: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendSkill {
  id?: string;
  name: string;
  rating: number;
}

// ============================================================================
// EXPERIENCE MAPPERS
// ============================================================================

export function mapExperienceFromDB(dbExp: DBExperience): FrontendExperience {
  return {
    id: dbExp.id,
    title: dbExp.jobTitle || "",
    companyName: dbExp.companyName || "",
    city: dbExp.city || "",
    state: dbExp.state || "",
    startDate: dbExp.startDate || "",
    endDate: dbExp.endDate || "",
    currentlyWorking: !dbExp.endDate,
    workSummary: dbExp.description || "",
  };
}

export function mapExperienceToDB(
  frontendExp: FrontendExperience,
  resumeId: string
): Omit<DBExperience, "createdAt" | "updatedAt"> {
  return {
    id: frontendExp.id || "",
    resumeId,
    jobTitle: frontendExp.title || null,
    companyName: frontendExp.companyName || null,
    city: frontendExp.city || null,
    state: frontendExp.state || null,
    startDate: frontendExp.startDate || null,
    endDate: frontendExp.currentlyWorking ? null : (frontendExp.endDate || null),
    description: frontendExp.workSummary || null,
  };
}

// ============================================================================
// EDUCATION MAPPERS
// ============================================================================

export function mapEducationFromDB(dbEdu: DBEducation): FrontendEducation {
  return {
    id: dbEdu.id,
    universityName: dbEdu.schoolName || "",
    degree: dbEdu.degree || "",
    major: dbEdu.fieldOfStudy || "",
    startDate: dbEdu.startDate || "",
    endDate: dbEdu.endDate || "",
    description: dbEdu.description || "",
  };
}

export function mapEducationToDB(
  frontendEdu: FrontendEducation,
  resumeId: string
): Omit<DBEducation, "createdAt" | "updatedAt"> {
  return {
    id: frontendEdu.id || "",
    resumeId,
    schoolName: frontendEdu.universityName || null,
    degree: frontendEdu.degree || null,
    fieldOfStudy: frontendEdu.major || null,
    startDate: frontendEdu.startDate || null,
    endDate: frontendEdu.endDate || null,
    description: frontendEdu.description || null,
  };
}

// ============================================================================
// SKILL MAPPERS
// ============================================================================

export function mapSkillFromDB(dbSkill: DBSkill): FrontendSkill {
  // proficiency in DB is stored as string but frontend expects number
  const rating = dbSkill.proficiency ? parseInt(dbSkill.proficiency, 10) : 1;
  
  return {
    id: dbSkill.id,
    name: dbSkill.skillName || "",
    rating: isNaN(rating) ? 1 : rating,
  };
}

export function mapSkillToDB(
  frontendSkill: FrontendSkill,
  resumeId: string
): Omit<DBSkill, "createdAt" | "updatedAt"> {
  return {
    id: frontendSkill.id || "",
    resumeId,
    skillName: frontendSkill.name || null,
    // Convert rating number to string for DB
    proficiency: frontendSkill.rating?.toString() || null,
  };
}

// ============================================================================
// RESUME MAPPERS (for nested data)
// ============================================================================

export interface DBResume {
  id: string;
  resumeId: string;
  userId: string;
  title: string;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  summary?: string | null;
  themeColor: string;
  createdAt: string;
  updatedAt: string;
  Experience?: DBExperience[];
  Education?: DBEducation[];
  Skill?: DBSkill[];
}

export interface FrontendResume {
  id?: string;
  resumeId: string;
  userId: string;
  title: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  summary?: string;
  themeColor?: string;
  Experience?: FrontendExperience[];
  Education?: FrontendEducation[];
  Skill?: FrontendSkill[];
}

export function mapResumeFromDB(dbResume: DBResume): FrontendResume {
  return {
    id: dbResume.id,
    resumeId: dbResume.resumeId,
    userId: dbResume.userId,
    title: dbResume.title,
    firstName: dbResume.firstName || "",
    lastName: dbResume.lastName || "",
    jobTitle: dbResume.jobTitle || "",
    address: dbResume.address || "",
    phone: dbResume.phone || "",
    email: dbResume.email || "",
    summary: dbResume.summary || "",
    themeColor: dbResume.themeColor || "rgb(79, 70, 229)",
    Experience: dbResume.Experience?.map(mapExperienceFromDB) || [],
    Education: dbResume.Education?.map(mapEducationFromDB) || [],
    Skill: dbResume.Skill?.map(mapSkillFromDB) || [],
  };
}

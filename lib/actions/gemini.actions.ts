"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function askGroq(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured. Please add it to your environment variables.");
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer assistant. Always respond with valid JSON format as requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Fast and high quality
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    return completion.choices[0]?.message?.content || "{}";
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new Error(
      error.message || "Failed to generate AI content. Please try again later."
    );
  }
}

export async function generateSummary(jobTitle: string) {
  try {
    const prompt =
      jobTitle && jobTitle !== ""
        ? `Given the job title '${jobTitle}', provide a summary for three experience levels: Senior, Mid Level, and Fresher. Each summary should be 3-4 lines long and include the experience level and the corresponding summary in JSON format. The output should be an array of objects, each containing 'experience_level' and 'summary' fields. Ensure the summaries are tailored to each experience level. Return ONLY valid JSON with a root key "summaries" containing the array.`
        : `Create a 3-4 line summary about myself for my resume, emphasizing my personality, social skills, and interests outside of work. The output should be an array of JSON objects, each containing 'experience_level' and 'summary' fields representing Active, Average, and Lazy personality traits. Use example hobbies if needed but do not insert placeholders for me to fill in. Return ONLY valid JSON with a root key "summaries" containing the array.`;

    const result = await askGroq(prompt);
    const parsed = JSON.parse(result);
    return parsed.summaries || [];
  } catch (error: any) {
    console.error("Error generating summary:", error);
    throw new Error(error.message || "Failed to generate summary from AI");
  }
}

export async function generateEducationDescription(educationInfo: string) {
  try {
    const prompt = `Based on my education at ${educationInfo}, provide personal descriptions for three levels of curriculum activities: High Activity, Medium Activity, and Low Activity. Each description should be 3-4 lines long and written from my perspective, reflecting on past experiences. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. Please include a subtle hint about my good (but not the best) results. Return ONLY valid JSON with a root key "descriptions" containing the array.`;

    const result = await askGroq(prompt);
    const parsed = JSON.parse(result);
    return parsed.descriptions || [];
  } catch (error: any) {
    console.error("Error generating education description:", error);
    throw new Error(error.message || "Failed to generate education description from AI");
  }
}

export async function generateExperienceDescription(experienceInfo: string) {
  try {
    const prompt = `Given that I have experience working as ${experienceInfo}, provide a summary of three levels of activities I performed in that position, preferably as a list: High Activity, Medium Activity, and Low Activity. Each summary should be 3-4 lines long and written from my perspective, reflecting on my past experiences in that workplace. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. You can include <b>, <i>, <u>, <s>, <blockquote>, <ul>, <ol>, and <li> to further enhance the descriptions. Use example work samples if needed, but do not insert placeholders for me to fill in. Return ONLY valid JSON with a root key "descriptions" containing the array.`;

    const result = await askGroq(prompt);
    const parsed = JSON.parse(result);
    return parsed.descriptions || [];
  } catch (error: any) {
    console.error("Error generating experience description:", error);
    throw new Error(error.message || "Failed to generate experience description from AI");
  }
}

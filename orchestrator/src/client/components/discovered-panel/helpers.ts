import type { Job } from "../../../shared/types";

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sourceLabel: Record<Job["source"], string> = {
  gradcracker: "Gradcracker",
  indeed: "Indeed",
  linkedin: "LinkedIn",
  ukvisajobs: "UK Visa Jobs",
  manual: "Manual",
};

export const getPlainDescription = (jobDescription?: string | null) => {
  if (!jobDescription) return "No description available.";
  if (jobDescription.includes("<") && jobDescription.includes(">")) {
    return stripHtml(jobDescription);
  }
  return jobDescription;
};

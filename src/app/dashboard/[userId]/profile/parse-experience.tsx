import { parse, format, differenceInMonths, differenceInYears } from 'date-fns';

// Function to calculate and format the duration between two dates
const calculateDuration = (startDate: Date, endDate: Date | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const years = differenceInYears(end, start);
  const months = differenceInMonths(end, start) % 12;

  let duration = '';
  if (years > 0) {
    duration += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    duration += `${years > 0 ? ' ' : ''}${months} month${months > 1 ? 's' : ''}`;
  }

  return duration;
};

const parseExperience = (experience: string) => {
  const blocks = experience.split("\n\n").filter((block) => block.trim() !== "");
  
  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
    const title = lines[0] || "";
    const dateRange = lines[1]?.split(" - ") || [];
    const startDateStr = dateRange[0] || "";
    const endDateStr = dateRange[1]?.split(" ")[0] || ""; // Remove duration from endDate
    const description = lines.slice(2).join(" ");

    const startDate = startDateStr ? parse(startDateStr, 'MMMM yyyy', new Date()) : null;
    const endDate = endDateStr && endDateStr !== "Present" ? parse(endDateStr, 'MMMM yyyy', new Date()) : null;

    return { title, startDate, endDate, description };
  });
};

const formatExperienceForDisplay = (experienceData: any[]) => {
  return experienceData
    .map((exp) => {
      const startDate = exp.startDate ? format(exp.startDate, 'MMMM yyyy') : '';
      const endDate = exp.endDate ? format(exp.endDate, 'MMMM yyyy') : 'Present';
      const duration = calculateDuration(exp.startDate, exp.endDate);
      return `${exp.title}\n${startDate} - ${endDate} (${duration})\n${exp.description}`;
    })
    .join("\n\n");
};

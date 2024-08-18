import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import wordListPath from 'word-list';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import natural from 'natural';
import nlp from 'compromise';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Load the dictionary into a Set for quick lookup
let dictionary = new Set<string>();
const rl = createInterface({
  input: createReadStream(wordListPath),
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  dictionary.add(line.trim().toLowerCase());
});

const wordnet = new natural.WordNet();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("RECEIVED");

  const form = new IncomingForm({
    maxFileSize: 10 * 1024 * 1024,
    keepExtensions: true,
    multiples: false,
  });

  form.on('file', async (name, file) => {
    console.log('File received:', name, file);

    try {
      const dataBuffer = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(dataBuffer);
      console.log('PDF parsed successfully');

      // Extract information
      const extractedData = extractExpertInfo(pdfData.text);
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error parsing the PDF:', error);
      res.status(500).json({ message: 'Error parsing the PDF' });
    }
  });

  form.parse(req);
}

const extractExpertInfo = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

  let name = '';
  let title = '';
  let summary = '';
  let skills: string[] = [];
  let experience = '';
  let education = '';
  let yearsOfExperience = 0;
  let linkedinUrl = '';
  let linkedinId = '';

  let isSummarySection = false;
  let isSkillsSection = false;
  let isExperienceSection = false;
  let isEducationSection = false;

  let currentRole = '';
  let currentTime = '';
  let currentDescription = '';
  let experienceStartYear: number | null = null;
  let experienceEndYear: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Debugging: Print each line to ensure nothing is getting skipped or altered
    console.log(`Line ${i}: "${line}"`);
    console.log(`isSummarySection: ${isSummarySection}, isSkillsSection: ${isSkillsSection}, isExperienceSection: ${isExperienceSection}, isEducationSection: ${isEducationSection}`);

    if (line.toLowerCase().includes('page')) continue;

    // Handle LinkedIn URL spanning multiple lines and remove "(LinkedIn)"
    if (line.toLowerCase().includes('linkedin.com')) {
      linkedinUrl += line.replace('(LinkedIn)', '').trim();
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.toLowerCase().includes('linkedin.com')) {
        linkedinUrl += nextLine.replace('(LinkedIn)', '').trim();
        i++;
      }
      const linkedinMatch = linkedinUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
      if (linkedinMatch) {
        linkedinId = linkedinMatch[1];
      }
      continue;
    }

    // Name and Title extraction
    if (!name) {
      const doc = nlp(line);
      const people = doc.people().out('array');
      if (people.length === 1 && !line.toLowerCase().includes('skills')) {
        name = people[0];
        title = lines[i + 1];
        continue;
      }
    }

    // Summary extraction
    if (line.toLowerCase() === 'summary') {
      isSummarySection = true;
      continue;
    }

    if (isSummarySection) {
      // Only stop the summary if the entire line is "Experience"
      if (line.trim().toLowerCase() === 'experience') {
        isSummarySection = false;
        isExperienceSection = true;
        continue;
      }
      summary += line + ' ';
    }

    // Skills extraction
    if (line.toLowerCase().includes('top skills') || line.toLowerCase().includes('skills')) {
      isSkillsSection = true;
      isExperienceSection = false;
      isEducationSection = false;
      continue;
    }

    if (isSkillsSection && !isExperienceSection) {
      // Stop extraction if we reach a non-skills section or the name
      if (
        line.toLowerCase().includes('languages') ||
        line.trim().toLowerCase() === 'experience' ||
        line.toLowerCase().includes('summary') ||
        line.toLowerCase().includes('awards') ||
        line.toLowerCase().includes('honors') ||
        line.toLowerCase().includes('education') ||
        line.toLowerCase().includes(name.toLowerCase())
      ) {
        isSkillsSection = false;
        continue;
      }
      skills.push(line);
    }

    // Experience extraction and calculation of years of experience
    if (line.trim().toLowerCase() === 'experience') {
      isExperienceSection = true;
      isSkillsSection = false;
      isEducationSection = false;
      currentRole = ''; // Reset the role, time, and description for new experience entry
      currentTime = '';
      currentDescription = '';
      title = lines[i - 1];  // Extract title as the line above the first experience
      continue;
    }

    if (isExperienceSection) {
      const yearMatch = line.match(/\b\d{4}\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);

        if (!experienceStartYear || year < experienceStartYear) {
          experienceStartYear = year;
        }

        if (!experienceEndYear || year > experienceEndYear) {
          experienceEndYear = year;
        }

        if (currentRole || currentTime || currentDescription) {
          experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
        }
        currentRole = lines[i - 1];
        currentTime = line;
        currentDescription = '';
      } else if (!line.toLowerCase().includes('education') && currentRole) {
        currentDescription += line + ' ';
      }

      if (line.toLowerCase().includes('education') || i === lines.length - 1) {
        experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
        isExperienceSection = false;
        isEducationSection = true;
        continue;
      }
    }

    // Education extraction
    if (line.toLowerCase().includes('education')) {
      isEducationSection = true;
      isExperienceSection = false;
      isSkillsSection = false;
      continue;
    }

    if (isEducationSection) {
      if (
        line.toLowerCase().includes('skills') ||
        line.toLowerCase().includes('experience') ||
        line.toLowerCase().includes('languages')
      ) {
        isEducationSection = false;
        continue;
      }
      education += line + ' ';
    }
  }

  if (currentRole || currentTime || currentDescription) {
    experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
  }

  // Calculate years of experience
  if (experienceStartYear && experienceEndYear) {
    yearsOfExperience = experienceEndYear - experienceStartYear;
  }

  // Ensure title follows the original rules: Title should NEVER be "Top Skills."
  if (title.toLowerCase().includes('top skills') || !title) {
    title = lines[1]; // Fallback to a default line if title extraction failed
  }

  return {
    name: name.trim(),
    title: title.trim(),
    summary: summary.trim(),
    skills: skills.map(skill => skill.trim()),
    experience: experience.trim(),
    education: education.trim(),
    yearsOfExperience,
    linkedinUrl: linkedinUrl.trim(),
    linkedinId: linkedinId.trim(),
  };
};

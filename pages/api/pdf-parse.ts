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

  let isExperienceSection = false;
  let isSummarySection = false;
  let isSkillsSection = false;

  let currentRole = '';
  let currentTime = '';
  let currentDescription = '';
  let experienceStartYear: number | null = null;
  let experienceEndYear: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.toLowerCase().includes('page')) continue;

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
      if (line.toLowerCase() === 'experience') {
        isSummarySection = false;
        isExperienceSection = true;
        continue;
      }
      summary += line + ' ';
    }

    // LinkedIn URL and ID extraction
    if (line.toLowerCase().includes('linkedin.com')) {
      linkedinUrl = line;
      const linkedinMatch = line.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
      if (linkedinMatch) {
        linkedinId = linkedinMatch[1];
      }
    }

    // Skills extraction
    if (line.toLowerCase().includes('top skills') || line.toLowerCase().includes('skills')) {
      isSkillsSection = true;
      continue;
    }

    if (isSkillsSection) {
      if (
        line.toLowerCase().includes('languages') ||
        line.toLowerCase().includes('experience') ||
        line.toLowerCase().includes('summary') ||
        line.toLowerCase().includes('awards') ||
        line.toLowerCase().includes('honors') ||
        line.includes(name)
      ) {
        isSkillsSection = false;
        continue;
      }
      skills.push(line);
    }

    // Experience extraction and calculation of years of experience
    if (line.trim().toLowerCase() === 'experience') {
      isExperienceSection = true;
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
      } else if (!line.toLowerCase().includes('education')) {
        currentDescription += line + ' ';
      }

      if (line.toLowerCase().includes('education') || i === lines.length - 1) {
        experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
        isExperienceSection = false;
      }
    }

    // Education extraction
    if (line.toLowerCase().includes('education')) {
      isExperienceSection = false;
      education = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].toLowerCase().includes('skills') || lines[j].toLowerCase().includes('experience') || lines[j].toLowerCase().includes('languages')) break;
        education += lines[j] + ' ';
      }
      education = education.trim();
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

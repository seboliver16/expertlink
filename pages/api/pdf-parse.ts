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

    let isExperienceSection = false;
    let isSummarySection = false;
    let isSkillsSection = false;

    let currentRole = '';
    let currentTime = '';
    let currentDescription = '';

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

        // Skills extraction
        if (line.toLowerCase().includes('top skills') || line.toLowerCase().includes('skills')) {
            isSkillsSection = true;
            continue;
        }

        if (isSkillsSection) {
            if (line.toLowerCase().includes('languages') || line.includes(name) || line.toLowerCase().includes('experience') || line.toLowerCase().includes('summary')) {
                isSkillsSection = false;
                continue;
            }
            skills.push(line);
        }

        // Experience extraction
        if (line.trim().toLowerCase() === 'experience') {
            isExperienceSection = true;
            continue;
        }

        if (isExperienceSection) {
            if (line.match(/\b\d{4}\b/)) {
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
    };
};

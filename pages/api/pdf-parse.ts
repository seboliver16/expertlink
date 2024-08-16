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
      const extractedData = await extractExpertInfo(pdfData.text);
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error parsing the PDF:', error);
      res.status(500).json({ message: 'Error parsing the PDF' });
    }
  });

  form.parse(req);
}

const extractExpertInfo = (text: string) => {
    // Split the text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

    // Name extraction using compromise
    let name = '';
    let title = '';
    const sectionHeaders = ['contact', 'summary', 'experience', 'education', 'skills', 'top skills', 'languages', 'honors'];
    let summary = '';
    let skills: string[] = [];
    let experience = '';
    let education = '';

    let isExperienceSection = false;
    let currentRole = '';
    let currentTime = '';
    let currentDescription = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Ignore page numbers
        if (line.toLowerCase().includes('page')) continue;

        // Name and Title extraction
        if (!name) {
            const doc = nlp(line);
            const people = doc.people().out('array');
            if (people.length === 1 && !sectionHeaders.some(header => line.toLowerCase().includes(header))) {
                name = people[0];
                title = lines[i + 1]; // Assume title is the next line after the name
                continue;
            }
        }

        // Summary extraction
        if (line.toLowerCase().includes('summary')) {
            summary = '';
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].toLowerCase().includes('education') || sectionHeaders.some(header => lines[j].toLowerCase().includes(header))) break;
                summary += lines[j] + ' ';
            }
            summary = summary.trim();
        }

        // Skills extraction
        if (line.toLowerCase().includes('top skills') || line.toLowerCase().includes('skills')) {
            skills = [];
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].toLowerCase().includes('languages') || lines[j].toLowerCase().includes('honors') || sectionHeaders.some(header => lines[j].toLowerCase().includes(header))) break;
                skills.push(lines[j]);
            }
            skills = skills.filter(skill => skill); // Remove empty strings
        }

        // Experience extraction and formatting
        if (line.toLowerCase().includes('experience')) {
            isExperienceSection = true;
            continue;
        }

        if (isExperienceSection) {
            if (line.match(/\b\d{4}\b/)) { // Detect a year as an indicator of a new role
                // If there's already a role being constructed, add it to the experience string
                if (currentRole || currentTime || currentDescription) {
                    experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
                }
                currentRole = lines[i - 1]; // Role is assumed to be the line before the time period
                currentTime = line; // Current line is the time period
                currentDescription = ''; // Reset the description for the new role
            } else {
                currentDescription += line + ' ';
            }

            // If the next line starts a new section, stop processing experience
            if (sectionHeaders.some(header => line.toLowerCase().includes(header)) && currentRole) {
                experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
                isExperienceSection = false;
            }
        }

        // Education extraction
        if (line.toLowerCase().includes('education')) {
            education = '';
            for (let j = i + 1; j < lines.length; j++) {
                if (sectionHeaders.some(header => lines[j].toLowerCase().includes(header))) break;
                education += lines[j] + ' ';
            }
            education = education.trim();
        }
    }

    // Ensure the last role gets added to the experience string
    if (currentRole || currentTime || currentDescription) {
        experience += `${currentRole}\n${currentTime}\n${currentDescription.trim()}\n\n`;
    }

    // LinkedIn URL extraction: Look for a URL in the text
    let linkedinUrl = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('linkedin.com/in/')) {
            linkedinUrl = line;
            // Check if the next line might complete the URL
            if (!line.endsWith('/')) {
                const nextLine = lines[i + 1] || '';
                if (!nextLine.startsWith(' ')) { // Ensure it's not an unrelated line
                    linkedinUrl += nextLine;
                }
            }
            break;
        }
    }

    // Specifically remove "(LinkedIn)" from the URL if it is present
    linkedinUrl = linkedinUrl.replace(/\s*\(LinkedIn\)\s*/i, '').trim();

    // LinkedIn ID extraction: Extract ID from the LinkedIn URL
    let linkedinId = '';
    if (linkedinUrl) {
        const match = linkedinUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
        if (match && match[1]) {
            linkedinId = match[1];
        }
    }

    return {
        name,
        linkedinUrl: linkedinUrl.trim(),
        linkedinId,
        summary: summary.trim(),
        skills: skills.map(skill => skill.trim()),
        experience: experience.trim(),
        education: education.trim(),
        title: title.trim(),
    };
};

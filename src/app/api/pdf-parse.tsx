import { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: Error, fields: Fields, files: Files) => {
    if (err) {
      return res.status(500).send('Error parsing the file');
    }

    // Check if 'files.file' exists and is not an array
    if (files.file && !Array.isArray(files.file)) {
      const file = files.file as formidable.File;
      const dataBuffer = fs.readFileSync(file.filepath);

      try {
        const pdfData = await pdfParse(dataBuffer);
        const extractedData = extractExpertInfo(pdfData.text);
        res.status(200).json(extractedData);
      } catch (error) {
        res.status(500).send('Error parsing the PDF');
      }
    } else {
      res.status(400).send('No valid file uploaded');
    }
  });
}

const extractExpertInfo = (text: string) => {
  const nameMatch = text.match(/^(.*)\s*Resume/);
  const name = nameMatch ? nameMatch[1] : null;

  const linkedinMatch = text.match(/www\.linkedin\.com\/in\/(\S+)/);
  const linkedinUrl = linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[1]}` : null;

  const experienceMatch = text.match(/Experience(.*)\s*Education/s);
  const experience = experienceMatch ? experienceMatch[1].trim() : null;

  const educationMatch = text.match(/Education(.*)\s*$/s);
  const education = educationMatch ? educationMatch[1].trim() : null;

  return {
    name,
    linkedinUrl,
    experience,
    education,
  };
};

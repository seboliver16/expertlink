import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import pdfParse from 'pdf-parse';
import fs from 'fs';

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form: ', err);
      return res.status(500).send('Error parsing the file');
    }

    const file = files.file as unknown as File;

    if (!file) {
      return res.status(400).send('No valid file uploaded');
    }

    const dataBuffer = fs.readFileSync(file.filepath);

    try {
      const pdfData = await pdfParse(dataBuffer);
      const extractedData = extractExpertInfo(pdfData.text);
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error parsing the PDF: ', error);
      res.status(500).send('Error parsing the PDF');
    }
  });
}

const extractExpertInfo = (text: string) => {
  const nameMatch = text.match(/^(.*)\s*Resume/);
  const name = nameMatch ? nameMatch[1] : null;

  const linkedinMatch = text.match(/www\.linkedin\.com\/in\/(\S+)/);
  const linkedinUrl = linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[1]}` : null;

  const experienceMatch = text.match(/Experience([\s\S]*)\s*Education/);
  const experience = experienceMatch ? experienceMatch[1].trim() : null;

  const educationMatch = text.match(/Education([\s\S]*)$/);
  const education = educationMatch ? educationMatch[1].trim() : null;

  return {
    name,
    linkedinUrl,
    experience,
    education,
  };
};

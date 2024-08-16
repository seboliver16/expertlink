import { NextApiRequest, NextApiResponse } from 'next';

// Example database connection (replace with your actual database connection)
import { yourDatabaseConnection } from '../../lib/db'; // Adjust according to your actual db connection path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data } = req.body;

  try {
    // Save the data to your database (adjust to your database setup)
    // This is just a placeholder. Replace with your actual database saving logic.
    await yourDatabaseConnection('experts').insert(data);

    res.status(200).json({ message: 'Expert saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving expert data', error });
  }
}

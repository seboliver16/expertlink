import { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../src/app/firebase.config';  // Adjust the import path according to your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data } = req.body;

    // Ensure that 'data' is an object with the correct properties
    if (!data || typeof data !== 'object' || !data.name || !data.education || !data.linkedinUrl || !data.experience || !data.title) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Reference to the 'experts' collection
    const expertsRef = collection(db, 'experts');

    // Add a new document to the 'experts' collection
    const docRef = await addDoc(expertsRef, data);

    // Respond with the new document ID
    res.status(200).json({ message: 'Expert saved successfully!', id: docRef.id });
  } catch (error) {
    // Type check for Error before accessing its properties
    if (error instanceof Error) {
      console.error('Error saving expert data:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } else {
      // Handle unexpected error types
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Unexpected error occurred' });
    }
  }
}

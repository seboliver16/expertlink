const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { experts, subject, message } = req.body;

  // Set up the email transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'expertlink.contact@gmail.com', // Your company email
      pass: 'ExpertLink2024$', // Your email password (you may need to generate an App Password if 2FA is enabled)
    },
  });

  try {
    // Send an email to each expert
    for (const expert of experts) {
      let info = await transporter.sendMail({
        from: '"ExpertLink" <expertlink.contact@gmail.com>',
        to: expert.email, // Expert's email
        subject: subject || "Invitation to Participate in a Project",
        text: message || `Dear ${expert.name},\n\nWe would like to invite you to participate in our project.\n\nBest regards,\nExpertLink Team`,
      });
      console.log(`Email sent to: ${expert.email}`);
    }
    res.status(200).send('Emails sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending emails');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

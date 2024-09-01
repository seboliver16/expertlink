const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 Credentials
const client_id = '936590460150-2vcn6pug29o8cbum3ke4me0h3n4osab9.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uris = ['https://localhost']; // Update this if needed
const refresh_token = '1//05q_leywSmb9xCgYIARAAGAUSNwF-L9IrF99PYW0Bpw9_C3266S2KAVRfDynEfrI9OQsPPtS4U9DHiKrl0meQnfYfLLhYzS8xCyI';

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials({ refresh_token });

const sendEmail = async (req, res) => {
  const { expertName, expertEmail, projectName, projectDescription } = req.body;

  try {
    // Generate the OAuth2 token
    const accessToken = await oAuth2Client.getAccessToken();

    // Create the transporter using OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'expertlink.contact@gmail.com',
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        accessToken: accessToken.token, // Use the token obtained from OAuth2
      },
    });

    // Email content
    const mailOptions = {
      from: 'ExpertLink <expertlink.contact@gmail.com>',
      to: expertEmail,
      subject: `Paid Consultation Opportunity - ${projectName}`,
      html: `
        <p>Dear ${expertName},</p>
        <p>We are pleased to invite you to participate in a paid consultation for our project titled <strong>${projectName}</strong>. Your expertise will be invaluable, and we are offering compensation of up to <strong>$500</strong> for your participation.</p>
        <p>Project Description:</p>
        <p>${projectDescription}</p>
        <p>We would be honored to have your input. Please let us know if you are interested, and we can arrange a time that suits you.</p>
        <p>Best regards,<br/>The ExpertLink Team</p>
      `,
    };

    // Send the email
    const emailResponse = await transporter.sendMail(mailOptions);

    console.log('Email sent:', emailResponse);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to send email');
  }
};

module.exports = { sendEmail };

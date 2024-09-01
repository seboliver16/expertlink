const { google } = require('googleapis');
const readline = require('readline');

const client_id = '936590460150-2vcn6pug29o8cbum3ke4me0h3n4osab9.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uris = ['http://localhost'];

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const getAccessToken = () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  rl.question('Enter the code from that page here: ', (code) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      console.log('Your Refresh Token:', token.refresh_token);
      rl.close();
    });
  });
};

getAccessToken();

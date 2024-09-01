const http = require('http');
const { google } = require('googleapis');
const url = require('url');

const client_id = '936590460150-2vcn6pug29o8cbum3ke4me0h3n4osab9.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uris = ['http://localhost'];

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const code = queryObject.code;

  if (code) {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log('Tokens acquired:', tokens);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Authorization successful! You can close this window.');
    } catch (error) {
      console.error('Error retrieving access token', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error retrieving access token');
    }
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('No code found');
  }
});

server.listen(80, () => {
  console.log('Server listening on http://localhost');
});

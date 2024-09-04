
// You're right to question the use of gapi in this example, as the Gmail API has moved away from the older gapi.client approach and now recommends using the newer google-apis-nodejs library or the @googleapis/gmail client library.
// Here's an updated example using the @googleapis/gmail client library for Node.js:
// javascript
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { gmail } = require('@googleapis/gmail');

// If modifying these scopes, delete the file token.json
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Array to store the current email IDs
let currentEmailIds = [];

// Load client secrets from a local file.
async function loadCredentials() {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  return credentials;
}

// Retrieve a token that allows the application to access the Gmail API
async function getToken() {
  const credentials = await loadCredentials();
  const { token } = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  return token;
}

// Function to retrieve the list of email IDs
async function getEmailIds(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10, // Adjust as needed
  });
  return response.data.messages.map(message => message.id);
}

// Function to compare the new email IDs with the current ones
async function checkForNewEmails() {
  const auth = await getToken();
  const newEmailIds = await getEmailIds(auth);
  const newEmails = newEmailIds.filter(id => !currentEmailIds.includes(id));

  if (newEmails.length > 0) {
    console.log(`New emails received: ${newEmails.join(', ')}`);
    // Handle new emails here
  } else {
    console.log('No new emails.');
  }

  currentEmailIds = newEmailIds;
}

// Start observing for new emails
async function startObserving() {
  const auth = await getToken();
  currentEmailIds = await getEmailIds(auth);
  setInterval(checkForNewEmails, 60000); // Check every minute
}

startObserving();
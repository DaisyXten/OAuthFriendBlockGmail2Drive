import { google } from 'googleapis';
import { join } from 'path';
import { promises as fs } from 'fs';

const CREDENTIALS_PATH = join(process.cwd(), 'credentials.json');
const TOKEN_PATH = join(process.cwd(), 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await google.auth.getClient({
    scopes: SCOPES,
    keyFile: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'has:attachment',
    maxResults: 10,
  });
  return res.data.messages || [];
}

async function getMessage(auth, messageId) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  return res.data;
}

async function main() {
  const auth = await authorize();
  const messages = await listMessages(auth);
  for (const message of messages) {
    const msg = await getMessage(auth, message.id);
    console.log(`Message ID: ${msg.id}`);
    console.log(`Thread ID: ${msg.threadId}`);
    console.log(`Snippet: ${msg.snippet}`);
  }
}

main().catch(console.error);
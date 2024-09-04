// Why we can't use gapi.
// Based on the search results provided, it does not seem possible to directly use the gapi client library (Google APIs Client Library for JavaScript) in a Chrome extension, especially with the upcoming Manifest V3 changes.
// Here are the key points:
// The gapi library relies on loading the https://apis.google.com/js/api.js script from a remote server. However, Manifest V3 extensions will not be allowed to load remote code for security reasons
// Google has recommended packaging third-party libraries locally with the extension as a workaround. However, it's unclear if this approach will work for the gapi library .
// The official recommendation from Google is to use the chrome.identity API instead of gapi.auth or gapi.auth2 for authentication in Chrome extensions .
// There are examples of using chrome.identity along with XHR requests to access Google APIs from a Chrome extension, rather than using the gapi client library .
// Some developers have explored creating a modified version of the gapi library that can be packaged locally, but this approach seems unofficial and may not be future-proof

// reponse Contains
// HTTP/1.1 200 ok 
// 2** GOOD
// 4** YOU MESSED UP
// 5** SERVER BROKEN
// other potential status code
// server: nginx
// connection: keep-alive

// Save file with filename, filesize, attachmentId, 
// To upload a file to Google Drive using the Google Drive API and HTTP requests, you can follow these steps:
// Obtain an Access Token
// 1. First, you need to obtain an access token by following the OAuth 2.0 authentication flow. This involves creating a Google Cloud project, enabling the Google Drive API, and obtaining the necessary credentials (client ID and client secret).
// 2. Prepare the File Metadata
// Create a JSON object containing the metadata for the file you want to upload. This includes the file name, MIME type, and any other relevant properties.
// Example:
// json
// {
//   "name": "example.txt",
//   "mimeType": "text/plain",
//      "appProperties": {
//      "filesize": "<FILE_SIZE>",
//      "outsideId": "<OUTSIDE_ID>"
//    }
// }
// 3. Encode the File Content
// Encode the file content as a base64 string.
// 4. Send the HTTP Request
// Send an HTTP POST request to the Google Drive API's files.create endpoint with the following structure:

// POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart

// Headers:
// Authorization: Bearer <ACCESS_TOKEN>
// Content-Type: multipart/related; boundary=<BOUNDARY_STRING>

// Request Body:
// --<BOUNDARY_STRING>
// Content-Type: application/json; charset=UTF-8
//
// <FILE_METADATA_JSON>
// {
//   "name": "<FILE_NAME>",
//   "appProperties": {
//     "filesize": "<FILE_SIZE>",
//     "outsideId": "<OUTSIDE_ID>"
//   }
// }
// --<BOUNDARY_STRING>
// Content-Type: <MIME_TYPE>
// <FILE_CONTENT_BASE64>
// --<BOUNDARY_STRING>--
// Replace the following:
// <ACCESS_TOKEN> with a valid access token obtained through OAuth 2.0
// <BOUNDARY_STRING> with a unique boundary string
// <MIME_TYPE> with the MIME type of the file (e.g., application/pdf, image/jpeg)
// <FILE_CONTENT> with the actual content of the file, encoded in base64
// This request will create a new file in Google Drive with the specified name, file size, and outsideId as custom properties.

// Search for a file by custom properties:
// HTTP Request:
// GET https://www.googleapis.com/drive/v3/files?q=name%3D'<FILE_NAME>'%20and%20appProperties%20has%20%7B%20key%3D'filesize'%20and%20value%3D'<FILE_SIZE>'%20%7D%20and%20appProperties%20has%20%7B%20key%3D'outsideId'%20and%20value%3D'<OUTSIDE_ID>'%20%7D&fields=files(id,name,appProperties)

// Headers:
// Authorization: Bearer <ACCESS_TOKEN>

// Replace the following:
// <ACCESS_TOKEN> with a valid access token obtained through OAuth 2.0
// <FILE_NAME> with the name of the file you're searching for
// <FILE_SIZE> with the file size in bytes
// <OUTSIDE_ID> with the external ID associated with the file
// This request will search for files in Google Drive that match the specified file name, file size, and outsideId. The fields parameter specifies that the response should include the file ID, name, and appProperties.
// The response will contain a list of files that match the search criteria, including their IDs, names, and custom properties.
// Note: Make sure you have the necessary permissions and scopes enabled for the Google Drive API to perform these operations. Also, remember to handle errors and edge cases appropriately in your application.


// utils.js
// export function capitalizeFirstLetter(string) {
// content.js
// import { capitalizeFirstLetter, shortenString } from './utils.js';

// (()=>{

// })();

function injectButtons(){
    const attachmentContainers = document.querySelectorAll('div.brc');
    console.log(attachmentContainers);
}

async function checkAttachmentExistsInDrive(init, fileName, fileSize, attachmentId){

    const query = `name=${fileName} and appProperties has { key='attachmentId' and value= ${attachmentId} and appProperties has { key='fileSize' and value= ${fileSize}`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
    return (url, init).then(response=>{
        if (response.ok){
            return response.json();
        }else{
            throw new Error('HTTP Request error ${response.status}');
        }
    }).catch(error=>{
        console.error('Error fetching checkAttachmentExistsInDrive');
    });
}

// example : {{
//   "messages": [
//     {
//       "id": "18feef02fb5cbb5a",
//       "threadId": "18feef02fb5cbb5a"
//     },]
//     "nextPageToken": "17221938871212490471",
//     "resultSizeEstimate": 201}
// The resultSizeEstimate:201 is just that—an estimate. It is not a precise count and can be influenced by various factors, including the complexity of the query and the current state of the Gmail index.
// pageToken is uncertain. When you make a request to retrieve messages, 
// the API might return a nextPageToken in the response if there are more messages that match the query. 
// You can then use this nextPageToken value as the pageToken parameter in the next request to retrieve the next page of results.
async function getMsgsWithQP(init, userId, queryString, pageToken = null){ // me, has:attachment, 
    let url= 'https://gmail.googleapis.com/gmail/v1/users/${userId}/messages';
    if(queryString) {url = url+'?q=${encodeURIComponent(queryString)}';}
    if (pageToken)  {url += `&pageToken=${encodeURIComponent(pageToken)}`;}
    return fetch(url, init)
        .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`HTTP error ${response.status}`);
            }
          })
          .catch(error=>{
            console.error('Error fetching messages list:', error);
          });
}
// Get the message Payload: Check the payload and its parts for any MessagePart objects with a non-empty filename field.
// Identify Attachments: If a MessagePart has a non-empty filename, it is considered an attachment.
// threadId seems not needed.
async function getMessageDetail(init, userId, messageId){
    let url = 'https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${messageId}'
    return fetch(url, init)
        .then(response => {
            if(response.ok){
                return response.json();
            }else{
                throw new Error('HTTP error ${response.status}');
            }
        })
        .catch(error => {
            console.error('Error fetching message Detail', error);
        });
}

// function getAttachmentIds(message) {
//     const attachmentIds = [];
  
//     if (message.payload && message.payload.parts) {
//       message.payload.parts.forEach(part => {
//         if (part.body && part.body.attachmentId) {
//           attachmentIds.push(part.body.attachmentId);
//         }
//       });
//     }
//     return attachmentIds;
// }

function extractAttachmentInfos(messageDetail){
    let attachmentsInfos = [];
    const parts = messageDetail.payload.parts;
    
    for (let part of parts){
        if (part.filename && part.body.attachmentId){
            attachmentsInfos.push({
                filename: part.filename,
                mimeType: part.mimeType,
                attachmentId: part.body.attachmentId
            });
        }
    }
    if(attachmentsInfos.length===0){
        throw new Error('No attachment found');
    }
    return attachmentsInfos;
}

// It seems I don't have to open the attachment, 
// can already see in the message, the size of attachment, name, could do add to drive, choose folder already
async function getAttachmentDetail(init, messageId, attachmentId){
    let url = 'https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${messageId}/attachments/{id}'
    return fetch(url, init)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                throw new Error('HTTP error ${response.status}');
            }
        })
        .catch(error =>{
            console.error('Error fetching attachment Detail', error);
        })
}

async function searchInDrive(init, filename, ){

}

// // TODO. Basically stackoverflow or any chrome may not work, must refer to official APIs. Because forum or search engine only have old info
        // TODO long time error because of permission is not given according to official page, but according to some stackoverflow website, just need to add "https://www.googleapis.com/auth/drive.apps.readonly", that's enough           
        // fetch('https://www.googleapis.com/drive/v3/apps',init) // works now, results {kind: 'drive#appList', selfLink: 'https://www.googleapis.com/drive/v3/apps', items: Array(22), defaultAppIds: Array(15)}, 
        // fetch('https://www.googleapis.com/drive/v3/files',init) // works perfectly.
        // .then((response) => response.json())
        //     .then(function(data) {
        //         console.log(data);
        //     });

        // what if one message have a few labels? should I save two copies? Maybe save a quicklink 
        // 'https://gmail.googleapis.com/gmail/v1/users/me/labels',

//          for (i=0;i<data.messages.length;i++){
//              messageId, threadId = data.messages[i];
//          }
 
// retrive each from history (google drive) with calculated path
//     1. use the attachment_name and timestamp to search in the google drive
// If found, checksum and return true or false. 
// If found, true, exists, then give green complete label.
// if not found, false, return cross label. At the same time, automatically sync. 
// show circle label, and start to async fetch the attachment and save it to google drive
// once finish, send a message. 
// once receive a update message with the email ID, change the label to green label
        
window.addEventListener('load',  function() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        // Use the token.
        let init = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
        };
        let querySentence = "has:attachment";
        let promistMsgResults = getMsgsWithQP(init, "me", querySentence);
        promistMsgResults.then(function(result){
            console.log(result);
        }, function(err){
            console.log("error happens in getting promiseMsgResults");
        });
    });
    // check if there auth exists, if it exists, then show all emails with attachment files status.
    // injectButtons();
});

/*
 once load, inject icons after emails that have attachment 
 parentDom = (querySelector("div.attachment"))
 for (i = 0; i< parentDom.Length; i++){
    div = document.createElement("div")
    parentDom.appendChild(div);
 }
*/

// TODO what is real process of the app execute and response.
// specify the steps using apis I could find.
// finish whole process of steps writing
// start to write code


// Observe
// 1. a new Email arrive (check checker-plus). What I will do when new email come?

// 2. User Delete one email, together with its pdf. 
// popup a form, ask user if the attachment should also be deleted. if user confirm, delete it in googledrive.


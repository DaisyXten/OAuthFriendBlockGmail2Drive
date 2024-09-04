The `{id}` in the `attachments/{id}` part of the URL refers to the attachment ID of a specific attachment within the email message. You can obtain the attachment ID from the email message's payload in the response of the `users.messages.get` API request.

Here's how you can get the attachment ID:

1. First, make a `GET` request to the `users.messages.get` endpoint to retrieve the email message details:

   ```
   GET https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{messageId}
   ```

2. In the response payload, look for the `payload.parts` array. This array contains information about the different parts of the email message, including attachments.

3. Each attachment is represented as an object in the `payload.parts` array, and the attachment ID is contained in the `body.attachmentId` property of that object.

For example, if the response payload looks like this:

```json
{
  "payload": {
    "parts": [
      {
        "body": {
          "attachmentId": "attachment_id_1"
        }
      },
      {
        "body": {
          "attachmentId": "attachment_id_2"
        }
      }
    ]
  }
}
```

Then, you can access the attachment IDs as `attachment_id_1` and `attachment_id_2`.

4. Once you have the attachment ID, you can use it in the `attachments/{id}` part of the URL to retrieve the attachment data:

   ```
   GET https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{messageId}/attachments/{id}
   ```

   Replace `{id}` with the actual attachment ID obtained from the previous step.

Here's an example of how you can extract the attachment IDs from the email message payload in JavaScript:

```javascript
function getAttachmentIds(message) {
  const attachmentIds = [];
  if (message.payload.parts) {
    message.payload.parts.forEach(part => {
      if (part.body.attachmentId) {
        attachmentIds.push(part.body.attachmentId);
      }
    });
  }
  return attachmentIds;
}
```

This function takes the email message object as input and returns an array of attachment IDs found in the `payload.parts` array. You can then use these attachment IDs to fetch the attachment data using the `attachments/{id}` endpoint.
window.onload = function() {
    document.querySelector('button#button01').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            // Use the token.
            let init = {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
            };
            fetch(  
                'https://people.googleapis.com/v1/contactGroups/all?maxMembers=20&key=AIzaSyCjQfwjMUjEmueAnvi3XDeCcFArn0DeMgY',
                init)
                .then((response) => response.json())
                .then(function(data) {
                    console.log(data);
                });
        });
    });

    document.querySelector('button#button02').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            // Use the token.
            let init = {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
            };
// long time error because of permission is not according to official page, but according to some stackoverflow website, just need to add "https://www.googleapis.com/auth/drive.apps.readonly", that's enough           
            // fetch('https://www.googleapis.com/drive/v3/apps',init) // works now, results {kind: 'drive#appList', selfLink: 'https://www.googleapis.com/drive/v3/apps', items: Array(22), defaultAppIds: Array(15)}, 
            // fetch('https://www.googleapis.com/drive/v3/about',init)
            fetch('https://www.googleapis.com/drive/v3/files',init) // works perfectly.
            .then((response) => response.json())
                .then(function(data) {
                    console.log(data);
                });
            // fetch(  
            //     'https://gmail.googleapis.com/gmail/v1/users/me/profile', // access_token={YOUR_API_KEY}
            //     init)
            //     .then((response) => response.json())
            //     .then(function(data) {
            //         console.log(data);
            //     });
            // fetch(  
            //     'https://gmail.googleapis.com/gmail/v1/users/me/labels',
            //     init)
            //     .then((response) => response.json())
            //     .then(function(data) {
            //         console.log(data);
            //     });
            // fetch(
            //    'https://gmail.googleapis.com/gmail/v1/users/{userId}/messages',
            //    .then((response) => response.json())
            //     .then(function(data) {
            //         console.log(data);
            //     });
            // use query parameter, q=has:attachment, return messages[id, threadId]
            // fetch('https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{messageId}/attachments/{id}',
            //     init)
            //     .then((response) => response.json())
            //     .then(function(data) {
            //         console.log(data);
            //     });
        });
    });

    document.querySelector('button#button03').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            // Use the token.
            const messages = fetchMessageJson(token);
        }
    );
    }); 
}

// async/await
async function fetchMessageJson(token){
    let init = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is%3Aunread+AND+after%3A1702916925&access_token=AIzaSyCjQfwjMUjEmueAnvi3XDeCcFArn0DeMgY',
                init);
    const messages = await response.json();
    console.log(messages);
    return messages;
}

// Steps:
// 1. Get all messages according to search config
// 2. Create folder name is thread (in the message json)/message
// 3. Save the content and attachment in the folder named trhead_name/message_name



// An email message.

// JSON representation

// {
//   "id": string,
//   "threadId": string,
//   "labelIds": [
//     string
//   ],
//   "snippet": string,
//   "historyId": string,
//   "internalDate": string,
//   "payload": {
//     object (MessagePart)
//   },
//   "sizeEstimate": integer,
//   "raw": string
// }
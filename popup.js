/*
1. authorizeButton.addEventlistener('click', ()=>{
    authorization steps:

    once authorization succeed, send message "token" to the contentScript.js page. 
})
*/

document.addEventListener('DOMContentLoaded', ()=>{
    const authorizeButton = document.getElementById('authorizeBtn');
    authorizeButton.addEventListener('click', ()=>{
        // once click authorize, start to authrize by ID provider.
        
    });
});
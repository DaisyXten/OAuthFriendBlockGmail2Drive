
var rule_counter = 1;
var config = getGamil2GDriveConfig();

function Gmail2GDrive(){
  
  if (config.globalFilter==undefined){
    config.globalFilter="has:attachment -in:trash -in:drafts -in:spam";
  }

  // seach expression: "has:attachment -in:trash -in:drafts -in:spam -label:to-gdrive/processed"
  gSearchExp = config.globalFilter + "-label" + config.processedLabel;

  // get all threads matching the expression search
  var offset = 0;
  while(true){
    var matched_threads = GmailApp.search(gSearchExp, offset, config.pageSize);
    if (matched_threads.length < config.pageSize){
      for (var threadIdx = 0; threadIdx < matched_threads.length; threadIdx++){
        var messages = matched_threads[threadIdx].getMessages();
        var threadFolderName = GetThreadFolderName(matched_threads[threadIdx]);
        var fullThreadFolderName = config.attRootFolder + threadFolderName;
        Logger.log("fullThreadFolderName is: " + fullThreadFolderName);
        for (var msgIdx = 0 ; msgIdx < messages.length; msgIdx++){
          processMessage(messages[msgIdx], fullThreadFolderName);
        }
      }
      Logger.log("matched_threads.length break in last blob with " + matched_threads.length);
      break;
    }

    offset += config.pageSize;
    Logger.log("offset is "+offset);
  }
  // var matched_threads = GmailApp.search(gSearchExp, offset, config.pageSize);
  
  for (var i = 0 ; i < matched_threads.length ; i++){
    
  }
  // save to the folder
  // GetThreadFolderName(GmailApp.getInboxThreads(0,3)[2]);
  // getMessageFolderName(GmailApp.getInboxThreads(0,3)[2].getMessages()[0]);
}

function processMessage(message, folderPath){
  Logger.log("processMessage folderPath: " + folderPath);
  var attachments = message.getAttachments();
  var msgFolder;
  try{
    msgFolder = getFolderByPath(folderPath);
  }catch (e){
    // create folder by path
    var folderArray = folderPath.split("/");
    // var parentFolder = parentFolderId ? DriveApp.getFolderById(parentFolderId) : DriveApp.getRootFolder();
    var parentFolder = DriveApp.getRootFolder();
    if (parentFolder) {
      msgFolder = getOrCreateSubFolder(parentFolder, folderArray);
    }
  }
  for (var i = 0; i < attachments.length; i++){
    msgFolder.createFile(attachments[i]);
  }
}

function getOrCreateSubFolder(baseFolder,folderArray) {
  if (folderArray.length == 0) {
    return baseFolder;
  } 
  var nextFolderName = folderArray.shift();
  var nextFolder = null;
  var folders = baseFolder.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    if (folder.getName() == nextFolderName) {
      nextFolder = folder;
      break;
    }
  }
  if (nextFolder == null) {
    // Folder does not exist - create it.
    nextFolder = baseFolder.createFolder(nextFolderName);
  }
  return getOrCreateSubFolder(nextFolder,folderArray);
}

/**
 * Returns the GDrive folder with the given path.
 * "parentFolderId": is optional
 */
function getFolderByPath(path) {
  Logger.log("getFolderByPath path: " + path);
  var parts = path.split("/");

  if (parts[0] == '') parts.shift(); // Did path start at root, '/'?

  // var folder = parentFolderId ? DriveApp.getFolderById(parentFolderId) : DriveApp.getRootFolder();

  var folder = DriveApp.getRootFolder();
  for (var i = 0; i < parts.length; i++) {
    var result = folder.getFoldersByName(parts[i]);
    if (result.hasNext()) {
      folder = result.next();
    } else {
      throw new Error( "folder not found." );
    }
  }
  return folder;
}

function GetThreadFolderName(thread=GmailApp.getInboxThreads(0,3)[0]) {
  var thread_labels = thread.getLabels();
  var folder_name = ""; //GetThreadFolderName: 
  if (thread_labels!=null){
    for (var i = 0; i < thread_labels.length; i++) {
      folder_name += (thread_labels[i].getName() + "/");
    }
  }

  folder_name += thread.getFirstMessageSubject().replace(/\s+/g,'_');
  
  Logger.log("GetThreadFolderName: " + folder_name);
  return folder_name;
}

function getMessageFolderName(folder_prefix="", message=GmailApp.getInboxThreads(0,3)[0].getMessages()[0]){
  var folder_name = ""; //getMessageFolderName: 
  folder_name += folder_prefix;
  var t_thread = message.getThread();
  var t_labels = t_thread.getLabels();
  for (var i = 0; i < t_labels.length;i++){
    folder_name += t_labels[i];
  }
  folder_name+="/";
  folder_name += message.getFrom();
  folder_name+="/";
  
  var t_subject = message.getThread().getFirstMessageSubject();
  m_subject = (t_subject == message.getSubject())? t_subject : t_subject+"/" + message.getSubject();
  
  folder_name += m_subject.replace(/\s+/g,'_');
  
  Logger.log(folder_name);
}

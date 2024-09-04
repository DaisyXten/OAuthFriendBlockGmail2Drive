function getGamil2GDriveConfig() {
  return {
    // Global fliter
    "globalFilter": "has:attachment -in:trash -in:draft -in:spam",
    "processedLabel": "to-gdrive/processed",
    "timeZone":"GMT",
    "pageSize":10,
    "attSuffix": "yyyy-MM-dd-%s",
    "attRootFolder":"GmailAttachments/",
    "threadFolderPath":"default",
  }
}

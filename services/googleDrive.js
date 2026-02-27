const fs = require("fs");
const { google } = require("googleapis");

const ROOT_FOLDER_ID = "1D_u0WKI6H2Taw2goKUPdGHQA8VVUE8o4";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

async function createFolderIfNotExists(name, parentId) {
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return folder.data.id;
}

async function uploadToDrive({
  filePath,
  fileName,
  schoolName,
  className,
  divisionName,
}) {
  const schoolFolderId = await createFolderIfNotExists(
    schoolName,
    ROOT_FOLDER_ID
  );

  const classFolderId = await createFolderIfNotExists(
    className,
    schoolFolderId
  );

  const divisionFolderId = await createFolderIfNotExists(
    divisionName,
    classFolderId
  );

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [divisionFolderId],
    },
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream(filePath),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return response.data;
}

module.exports = { uploadToDrive };
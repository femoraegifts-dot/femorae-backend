const { google } = require("googleapis");
const fs = require("fs");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oAuth2Client,
});

async function uploadToDrive({
  filePath,
  fileName,
  schoolName,
  className,
  divisionName,
}) {
  try {
    // 1️⃣ Create / find school folder
    const schoolFolder = await createOrGetFolder(schoolName, null);

    // 2️⃣ Create / find class folder
    const classFolder = await createOrGetFolder(className, schoolFolder);

    // 3️⃣ Create / find division folder
    const divisionFolder = await createOrGetFolder(
      divisionName,
      classFolder
    );

    // 4️⃣ Upload file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [divisionFolder],
      },
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(filePath),
      },
      fields: "id",
    });

    return response.data;
  } catch (err) {
    console.error("DRIVE UPLOAD ERROR:", err.response?.data || err.message);
    throw err;
  }
}

async function createOrGetFolder(name, parentId) {
  const query = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
    fields: "id",
  });

  return folder.data.id;
}

module.exports = { uploadToDrive };
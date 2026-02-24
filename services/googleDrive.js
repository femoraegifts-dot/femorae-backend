const fs = require("fs");
const { google } = require("googleapis");
const { authorize } = require("./googleAuth");

/* =====================================================
   FIND OR CREATE FOLDER
===================================================== */
async function getOrCreateFolder(drive, name, parentId = null) {
  const q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({
    q,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    },
    fields: "id",
  });

  return folder.data.id;
}

/* =====================================================
   DELETE FILE IF EXISTS
===================================================== */
async function deleteIfExists(drive, fileName, parentId) {
  const res = await drive.files.list({
    q: `name='${fileName}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
  });

  for (const file of res.data.files) {
    await drive.files.delete({ fileId: file.id });
  }
}

/* =====================================================
   UPLOAD TO DRIVE
===================================================== */
async function uploadToDrive({
  filePath,
  fileName,
  schoolName,
  className,
  divisionName,
}) {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const rootId = await getOrCreateFolder(drive, "ID Card");
  const schoolId = await getOrCreateFolder(drive, schoolName, rootId);
  const classId = await getOrCreateFolder(drive, className, schoolId);
  const divisionId = await getOrCreateFolder(drive, divisionName, classId);

  await deleteIfExists(drive, fileName, divisionId);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [divisionId],
    },
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream(filePath),
    },
    fields: "id",
  });

  return res.data;
}

module.exports = { uploadToDrive };

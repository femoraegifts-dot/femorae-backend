const fs = require("fs");
const path = require("path");
const { drive } = require("./googleAuth");

async function createFolderIfNotExists(name, parentId = null) {
  const query = parentId
    ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
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
      parents: parentId ? [parentId] : [],
    },
    fields: "id",
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
  // Root folder
  const rootFolderId = await createFolderIfNotExists("ID Card Storage");

  const schoolFolderId = await createFolderIfNotExists(
    schoolName,
    rootFolderId
  );

  const classFolderId = await createFolderIfNotExists(
    className,
    schoolFolderId
  );

  const divisionFolderId = await createFolderIfNotExists(
    divisionName,
    classFolderId
  );

  const fileMeta = {
    name: fileName,
    parents: [divisionFolderId],
  };

  const media = {
    mimeType: "image/jpeg",
    body: fs.createReadStream(filePath),
  };

  const uploaded = await drive.files.create({
    requestBody: fileMeta,
    media,
    fields: "id",
  });

  return uploaded.data;
}

module.exports = { uploadToDrive };
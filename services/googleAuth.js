const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

/* =====================================================
   CONFIG PATHS
===================================================== */
const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");
const TOKEN_PATH = path.join(__dirname, "../token.json");

/* =====================================================
   AUTHORIZE GOOGLE DRIVE
===================================================== */
async function authorize() {
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
  );

  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  throw new Error(
    "Google Drive token not found. Generate token.json first."
  );
}

module.exports = { authorize };

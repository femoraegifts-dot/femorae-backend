const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = path.join(__dirname, "../token.json");
const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");

async function authorize() {
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
  );

  const { client_id, client_secret } = credentials.installed;

  // 🔐 Explicit redirect URI (critical fix)
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost"
  );

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(
      JSON.parse(fs.readFileSync(TOKEN_PATH))
    );
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n🔑 OPEN THIS URL IN A NEW INCOGNITO WINDOW:\n");
  console.log(authUrl, "\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question("Paste the authorization code here: ", async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code.trim());
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log("✅ Token saved to token.json");
        resolve(oAuth2Client);
      } catch (err) {
        console.error("❌ TOKEN ERROR:", err.message);
        reject(err);
      }
    });
  });
}

async function uploadToDrive(filePath, fileName, folderId) {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream(filePath),
    },
  });

  return response.data;
}

module.exports = { uploadToDrive };

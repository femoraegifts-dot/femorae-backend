const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, studentCode, folderPath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderPath, // ✅ dynamic
      public_id: studentCode,
      overwrite: true,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary Upload Error:", err.message);
    throw err;
  }
};

module.exports = { uploadToCloudinary };
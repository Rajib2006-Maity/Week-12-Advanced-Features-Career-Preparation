const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Wraps Cloudinary's upload_stream in a Promise so we can await it from an async controller.
const streamUpload = (buffer, resourceType) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'social-platform', resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// POST /api/upload  (multipart/form-data, field name "media")
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const result = await streamUpload(req.file.buffer, resourceType);

    res.status(200).json({
      success: true,
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
      mediaType: resourceType
    });
  } catch (err) {
    next(err);
  }
};

const cloudinary                = require('cloudinary').v2;
const { CloudinaryStorage }     = require('multer-storage-cloudinary');
const multer                    = require('multer');

// Configure Cloudinary with your credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine — automatically uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder:         'golden-city-church',
      resource_type:  isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'],
      // Max file size handled by multer limits below
      transformation: isVideo
        ? [{ quality: 'auto' }]
        : [{ quality: 'auto', fetch_format: 'auto' }],
    };
  },
});

// Multer instance with file size limits
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/gif',  'image/webp',
      'video/mp4',  'video/mov', 'video/avi',
      'video/quicktime', 'video/x-matroska',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Use images (JPG, PNG, GIF) or videos (MP4, MOV, AVI).'));
    }
  },
});

module.exports = { cloudinary, upload };
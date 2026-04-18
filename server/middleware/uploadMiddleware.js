const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Video Storage
const cloudinaryVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'baselearn/videos',
    resource_type: 'video',
    access_mode: 'public', // Explicitly public
    type: 'upload',        // Standard upload
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    public_id: (req, file) => `video-${Date.now()}-${uuidv4()}`
  }
});

// Cloudinary Document Storage (PDF)
const cloudinaryDocStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'baselearn/documents',
    resource_type: 'auto',
    access_mode: 'public', // Explicitly public
    type: 'upload',        // Standard upload
    public_id: (req, file) => `doc-${Date.now()}-${uuidv4()}`
  }
});

// Cloudinary Mixed Storage (Handles MP4, PDF, and Images in same request)
const cloudinaryMixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isImage = file.mimetype.startsWith('image');

    // For PDFs, we use 'raw' with a forced extension to guarantee browser compatibility.
    // For Images/Videos, use 'auto' or explicit resource types.
    let resourceType = 'auto';
    if (isVideo) resourceType = 'video';
    else if (isPdf) resourceType = 'auto'; // 'auto' works better for PDF previews than 'raw'
    else if (isImage) resourceType = 'image';

    const extension = isPdf ? '.pdf' : '';
    const folder = isVideo ? 'bl_videos' : (isImage ? 'bl_thumbnails' : 'bl_materials');

    return {
      folder: folder,
      resource_type: resourceType,
      access_mode: 'public',
      type: 'upload',
      public_id: `${file.fieldname}-${Date.now()}-${uuidv4()}${extension}`
    };
  }
});

const cloudinaryVideoUpload = multer({
  storage: cloudinaryVideoStorage,
  limits: { fileSize: 4 * 1024 * 1024 * 1024 } // Support up to 4GB videos
});

const cloudinaryDocUpload = multer({
  storage: cloudinaryDocStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for PDFs
});

const cloudinaryMixedUpload = multer({
  storage: cloudinaryMixedStorage,
  limits: { fileSize: 4 * 1024 * 1024 * 1024 } // Support up to 4GB for mixed content (videos/thumbnails)
});

// LOCAL STORAGE for Assignments (Workaround for Cloudinary 'Untrusted' block)
const localAssignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `assignment-${Date.now()}-${uuidv4()}${ext}`);
  }
});

const localAssignmentUpload = multer({
  storage: localAssignmentStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB for PDFs
});

// Ensure local uploads directories exist (Unified absolute resolution)
const videoDir    = path.resolve(__dirname, '..', 'public', 'uploads', 'videos');
const documentDir = path.resolve(__dirname, '..', 'public', 'uploads', 'documents');
const profileDir  = path.resolve(__dirname, '..', 'public', 'uploads', 'profiles');

if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(documentDir)) fs.mkdirSync(documentDir, { recursive: true });
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

const createStorage = (targetDir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, targetDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|mov|avi|mkv|webm/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only video files allowed'), false);
};

const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') cb(null, true);
  else cb(new Error('Only PDF documents allowed'), false);
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only image files (JPG, PNG, WEBP) allowed'), false);
};

const uploadVideo = multer({
  storage: createStorage(videoDir),
  fileFilter: videoFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
});

const uploadImage = multer({
  storage: createStorage(profileDir),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

// Unified Local Mixed Storage (For local-first fallback or specific local fields)
const localMixedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = /mp4|mov|avi|mkv|webm/i.test(ext);
    const isImage = /jpg|jpeg|png|webp/i.test(ext);
    if (isVideo) cb(null, videoDir);
    else if (isImage) cb(null, profileDir);
    else cb(null, documentDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}-${uuidv4()}${ext}`);
  }
});

const localMixedUpload = multer({
  storage: localMixedStorage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 } // 5GB
});

const upload = localMixedUpload; // Alias for general use

module.exports = {
  uploadVideo,
  upload,
  uploadImage,
  cloudinaryVideoUpload,
  cloudinaryDocUpload,
  cloudinaryMixedUpload,
  localAssignmentUpload,
  localMixedUpload
};
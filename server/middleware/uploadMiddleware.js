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

// Cloudinary Mixed Storage (Handles MP4 and PDF in same request)
const cloudinaryMixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    
    // For PDFs, we use 'raw' with a forced extension to guarantee browser compatibility.
    // We use a simplified folder 'bl_materials' to bypass potential path restrictions.
    const resourceType = isVideo ? 'video' : 'raw';
    const extension = isPdf ? '.pdf' : '';
    
    return {
      folder: isVideo ? 'bl_videos' : 'bl_materials',
      resource_type: resourceType,
      access_mode: 'public',
      type: 'upload',
      public_id: `${file.fieldname}-${Date.now()}-${uuidv4()}${extension}`
    };
  }
});

const cloudinaryVideoUpload = multer({
  storage: cloudinaryVideoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // Cloudinary standard limit approx 100MB for direct upload
});

const cloudinaryDocUpload = multer({
  storage: cloudinaryDocStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for PDFs
});

const cloudinaryMixedUpload = multer({
  storage: cloudinaryMixedStorage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit for mixed content
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

// Ensure local uploads directories exist (kept for legacy support/local fallback)
const videoDir = path.join(__dirname, '..', 'public', 'uploads', 'videos');
const documentDir = path.join(__dirname, '..', 'public', 'uploads', 'documents');
const profileDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');

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

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isVideo = /mp4|mov|avi|mkv|webm/i.test(path.extname(file.originalname).toLowerCase());
      cb(null, isVideo ? videoDir : documentDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = /mp4|mov|avi|mkv|webm/i.test(ext);
    const isDoc = ext === '.pdf';
    if (isVideo || isDoc) cb(null, true);
    else cb(new Error('Only Video and PDF files allowed'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
});

module.exports = { 
  uploadVideo, 
  upload, 
  uploadImage, 
  cloudinaryVideoUpload, 
  cloudinaryDocUpload,
  cloudinaryMixedUpload,
  localAssignmentUpload
};

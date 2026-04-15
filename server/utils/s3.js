const { S3Client, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true, // Required for E2E EOS
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Generate a pre-signed URL for an existing S3 key (valid for 7 days)
 */
const getPresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
    });
    // 7 days expiry (604800 seconds)
    return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
};

/**
 * Upload a file to E2E EOS and return a pre-signed URL (valid 7 days)
 */
const uploadToS3 = async (file, folder = 'general') => {
    if (!file) return null;

    // Local fallback: returns absolute API URL for local file
    const getLocalPath = () => {
        const pathSuffix = file.path.replace(/\\/g, '/');
        const uploadIndex = pathSuffix.indexOf('/uploads/');
        let relativePath = uploadIndex !== -1 ? pathSuffix.substring(uploadIndex) : `/uploads/${folder}/${file.filename}`;
        const origin = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.baselearn.in';
        return `${origin}${relativePath}`;
    };

    // Always use local storage for PDFs/assignments (E2E rate-limits them, Cloudinary 401s them)
    // and for student-assignment/test submissions
    const LOCAL_ONLY_FOLDERS = ['assignments', 'student-assignments', 'student-tests'];
    if (!process.env.R2_BUCKET_NAME || !process.env.R2_ACCESS_KEY_ID || LOCAL_ONLY_FOLDERS.includes(folder)) {
        if (LOCAL_ONLY_FOLDERS.includes(folder)) {
            console.log('[Storage] Saving to local persistent volume:', folder, file.filename);
        } else {
            console.warn('[Storage] Missing E2E keys, falling back to local storage:', file.filename);
        }
        return getLocalPath();
    }

    try {
        const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        
        const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: fs.createReadStream(file.path),
                ContentType: file.mimetype,
            },
        });

        await parallelUploads3.done();
        console.log('[Storage] Uploaded to E2E EOS:', fileName);

        // Delete local temp file after successful upload
        try { fs.unlinkSync(file.path); } catch {}

        // Return a pre-signed URL valid for 7 days
        const signedUrl = await getPresignedUrl(fileName);
        console.log('[Storage] Generated pre-signed URL for:', fileName);
        return signedUrl;
        
    } catch (s3Error) {
        console.error('[Storage] E2E Upload Failed, falling back to local:', s3Error.message);
        return getLocalPath();
    }
};

/**
 * Delete a file from E2E EOS
 */
const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        // Extract the Key from the URL (strip domain and query string)
        const urlObj = new URL(fileUrl.split('?')[0]);
        // Path-style: /baselearnmedia2026/folder/file → strip bucket prefix
        let key = urlObj.pathname.substring(1);
        if (key.startsWith(process.env.R2_BUCKET_NAME + '/')) {
            key = key.substring(process.env.R2_BUCKET_NAME.length + 1);
        }

        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        }));
        console.log('[Storage] Deleted from E2E EOS:', key);
    } catch (err) {
        console.error('E2E Delete Error:', err.message);
    }
};

/**
 * Extract S3 key from a stored URL (pre-signed or plain path-style)
 */
const extractS3Key = (storedUrl) => {
    if (!storedUrl) return null;
    try {
        // Strip query string (pre-signed params)
        const cleanUrl = storedUrl.split('?')[0];
        const urlObj = new URL(cleanUrl);
        // Pathname is like /baselearnmedia2026/folder/file OR /folder/file
        let key = urlObj.pathname.substring(1); // remove leading /
        if (key.startsWith(process.env.R2_BUCKET_NAME + '/')) {
            key = key.substring(process.env.R2_BUCKET_NAME.length + 1);
        }
        return key || null;
    } catch {
        return null;
    }
};

/**
 * Refresh a pre-signed URL from an existing stored URL
 * Returns the new pre-signed URL, or the original if not an E2E URL
 */
const refreshPresignedUrl = async (storedUrl) => {
    if (!storedUrl) return null;
    // Only refresh E2E object storage URLs
    if (!storedUrl.includes('e2enetworks.net') && !storedUrl.includes('objectstore')) {
        return storedUrl; // Leave Cloudinary / local URLs untouched
    }
    const key = extractS3Key(storedUrl);
    if (!key) return storedUrl;
    try {
        return await getPresignedUrl(key);
    } catch (e) {
        console.error('[Storage] Failed to refresh pre-signed URL for key:', key, e.message);
        return storedUrl; // Return old URL rather than break things
    }
};

module.exports = {
    uploadToS3,
    deleteFromS3,
    getPresignedUrl,
    refreshPresignedUrl,
    extractS3Key
};

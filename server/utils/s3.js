const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require('fs');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1", // E2E EOS usually uses ap-south-1
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload a file to Cloudflare R2
 */
const uploadToS3 = async (file, folder = 'general') => {
    if (!file) return null;

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

    // Delete local temp file after upload
    try {
        fs.unlinkSync(file.path);
    } catch (err) {
        console.warn('Failed to delete local temp file:', err.message);
    }

    // Return the URL. For E2E EOS, we use Virtual Hosted Style: http://bucket-name.objectstore.e2enetworks.net/key
    const endpointHost = process.env.R2_ENDPOINT ? new URL(process.env.R2_ENDPOINT).host : 'objectstore.e2enetworks.net';
    const customDomain = process.env.R2_CUSTOM_DOMAIN || `https://${process.env.R2_BUCKET_NAME}.${endpointHost}`;
    return `${customDomain}/${fileName}`;
};

/**
 * Delete a file from Cloudflare R2
 */
const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        // Extract the Key from the URL (everything after the domain)
        const urlObj = new URL(fileUrl);
        const key = urlObj.pathname.substring(1); // remove leading slash

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (err) {
        console.error('R2 Delete Error:', err.message);
    }
};

module.exports = {
    uploadToS3,
    deleteFromS3
};

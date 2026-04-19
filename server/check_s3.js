require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function listAll() {
    const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 50
    });
    try {
        const res = await s3Client.send(command);
        console.log("Found files:", res.Contents?.map(c => c.Key) || []);
    } catch (e) {
        console.error("S3 error:", e);
    }
    process.exit();
}

listAll();

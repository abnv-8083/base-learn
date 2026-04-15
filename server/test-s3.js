require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');

fs.writeFileSync('test.txt', 'hello');

const s3Client = new S3Client({
    region: 'ap-south-1',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

(async () => {
    try {
        const u = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: 'test.txt',
                Body: fs.createReadStream('test.txt'),
                ACL: 'public-read'
            }
        });
        await u.done();
        const url1 = `${process.env.R2_ENDPOINT.replace(/\/$/, '')}/${process.env.R2_BUCKET_NAME}/test.txt`;
        console.log('url=', url1);
        const r = await fetch(url1);
        console.log('status=', r.status);
    } catch(e) { console.error('E:', e.message); }
})();

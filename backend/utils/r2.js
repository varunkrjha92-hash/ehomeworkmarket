const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
console.log('R2 DEBUG:');
console.log('  ENDPOINT:', JSON.stringify(process.env.R2_ENDPOINT));
console.log('  ACCESS_KEY_ID:', JSON.stringify(process.env.R2_ACCESS_KEY_ID?.slice(0, 5) + '...'));
console.log('  BUCKET_NAME:', JSON.stringify(process.env.R2_BUCKET_NAME));

// R2 client — uses S3 protocol with Cloudflare R2 endpoint
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const BUCKET = process.env.R2_BUCKET_NAME;

// Upload a file buffer to R2
// fileBuffer: the file contents (from multer)
// key: the path/filename in the bucket (e.g., "solutions/abc123.pdf")
// contentType: MIME type (e.g., "application/pdf")
async function uploadFile(fileBuffer, key, contentType) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType
  }));
  return key;
}

// Generate a temporary signed URL for downloading a file
// Anyone with this URL can download for `expiresInSeconds` seconds, then it expires
async function getDownloadUrl(key, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key
  });
  const url = await getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
  return url;
}

// Delete a file from R2
async function deleteFile(key) {
  await r2.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key
  }));
}

module.exports = { uploadFile, getDownloadUrl, deleteFile };
import S3 from 'aws-sdk/clients/s3';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
  // signatureVersion: 'v4',
});

const uploadToS3 = (buffer, filePath) => { //try multipart
  const bucketUrl =
    'https://' +
    process.env.AWS_BUCKET_NAME +
    '.s3.' +
    process.env.AWS_BUCKET_REGION +
    '.amazonaws.com/';

  return new Promise((resolve, reject) => {
    const timestamp = Date.now().toString();

    let bucketPath = filePath + timestamp;

    s3.upload(
      {
        Body: buffer,
        // Key: timestamp,
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: bucketPath,
        ContentType: 'image/jpeg',
      },
      (error) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          const fullUrl = `${bucketUrl}${filePath}${timestamp}`;
          resolve(fullUrl);
        }
      }
    );
  });
};

export default uploadToS3;

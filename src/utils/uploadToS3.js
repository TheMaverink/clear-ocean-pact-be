import S3 from 'aws-sdk/clients/s3';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
  // signatureVersion: 'v4',
});

const uploadToS3 = (buffer) => {
  const bucketUrl =
    'https://' +
    process.env.BUCKET_NAME +
    '.s3.' +
    process.env.BUCKET_REGION +
    '.amazonaws.com/';

  return new Promise((resolve, reject) => {

    const timestamp = Date.now().toString()
    s3.upload(
      {
        Body: buffer,
        Key: timestamp,
        Bucket: process.env.BUCKET_NAME,
        ContentType: 'image/jpeg',
      },
      (error) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.info(bucketUrl + timestamp);
          resolve(bucketUrl + timestamp);
        }
      }
    );
  });
};

export default uploadToS3;

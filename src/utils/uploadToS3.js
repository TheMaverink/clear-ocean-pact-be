import S3 from 'aws-sdk/clients/s3';
import { Credentials } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const access = new Credentials({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  // credentials: access,
  region: process.env.BUCKET_REGION,
  signatureVersion: 'v4',
});

const uploadToS3 = async () => {
  const fileId = uuid();
  const signedUrlExpireSeconds = 60 * 15;

  const url = await s3.getSignedUrlPromise(
    'putObject',
    {
      Bucket: process.env.BUCKET_NAME,
      Key: `${fileId}.jpg`,
      ContentType: 'image/jpeg',
      // Acl: 'public-read',
      Expires: signedUrlExpireSeconds,
    },
    function (error, url) {
      if (error) {
        return error
      }
      return url
    }

   
  );

  return url;

  // return res.json({
  //   url,
  // });
};

export default uploadToS3;

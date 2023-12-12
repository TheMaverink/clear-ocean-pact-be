import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const BUCKET_FOLDERS = {
  ENTRY_IMAGES_FOLDER: "entry-images",
  USER_IMAGES_FOLDER: "user-images",
  YACHT_IMAGES_FOLDER: "yacht-images",
};

export const getBucketLocation = () =>
  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/`;

export const getS3Client = () =>
  new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

export const uploadFileToS3 = async (fileBuffer, fileName, mimetype) => {
  try {
    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: fileName,
      ContentType: mimetype,
    };

    const s3Client = getS3Client();

    const uploadedResponse = await s3Client.send(
      new PutObjectCommand(uploadParams)
    );

    return { ...uploadedResponse, key: fileName };
  } catch (error) {
    console.log("error");
    console.log(error);
  }
};

export const deleteFileFromS3 = async (fileName) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  return await getS3Client().send(new DeleteObjectCommand(deleteParams));
};

export const getObjectSignedUrl = async (key, seconds = 60 * 60 * 24) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(getS3Client(), command, {
    expiresIn: seconds,
  });

  return url;
};

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl ,getSignedUrlPromise} from "@aws-sdk/s3-request-presigner"

import { getObjectSignedUrl } from "@utils/s3";

import dotenv from "dotenv";

dotenv.config();

const getSignedUrlController = async (req, res, next) => {
  try {
    const OBJECT_URL =
      "https://clearoceanpact.s3.eu-west-2.amazonaws.com/entry-images/";

      const FILE_NAME = "331377b649fdd97a38877c4058763e3d121146cedffca997ce6675ebd40f483e"

      const bucketName = process.env.AWS_BUCKET_NAME;
      const region = process.env.AWS_BUCKET_REGION;
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const params = {
      Bucket: bucketName,
      Key: "entry-images/331377b649fdd97a38877c4058763e3d121146cedffca997ce6675ebd40f483e",
    };

    const command = new GetObjectCommand(params);

    // const url = await s3.getSignedUrlPromise("getObject", downloadParams);


    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });


//    const signedUrl = await getObjectSignedUrl(s3Client, command, {
//      expiresIn: 60,
//    });
   console.log("signedUrl");
   console.log(signedUrl);

    res.json({ msg: signedUrl });
  } catch (error) {
    console.log(error.message);
    // res.status(500).send("Server Error");
  }
};

export default getSignedUrlController;

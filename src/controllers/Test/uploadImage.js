import {
  uploadFileToS3,
  getObjectSignedUrl,
} from "@utils/s3";

import generateFileName from "@utils/generateFileName";

const uploadImage = async (req, res, next) => {
  try {
    const fileUploadPromises = [];
    const imageSavedSignedUrls = [];

    // Upload files to S3 and store promises in fileUploadPromises
    req.files.forEach((file) => {
      const currentFileName = generateFileName();
      const uploadPromise = uploadFileToS3(file.buffer, `entry-images/${currentFileName}`)
        .then((result) => result);

      fileUploadPromises.push(uploadPromise);
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(fileUploadPromises);

    // Get signed URLs for the uploaded files
    for (const result of uploadResults) {
      console.log("Upload Result:", result);

      // Assuming result.key contains the S3 object key
      const signedUrl = await getObjectSignedUrl(result.key);
      console.log("Signed URL:", signedUrl);

      imageSavedSignedUrls.push(signedUrl);
    }

    console.log("imageSavedSignedUrls:", imageSavedSignedUrls);

    res.json({ msg: "Images added", imageUrls: imageSavedSignedUrls });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Server Error");
  }
};

export default uploadImage;

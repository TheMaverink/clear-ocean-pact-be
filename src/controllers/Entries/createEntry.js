import Yacht from "@models/Yacht";
import User from "@models/User";
import Entry from "@models/Entry";

import generateFileName from "@utils/generateFileName";

import { uploadFileToS3, BUCKET_FOLDERS } from "@utils/s3";

const { ENTRY_IMAGES_FOLDER } = BUCKET_FOLDERS;

const createEntry = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  const types = JSON.parse(req.body.types);

  try {
    const fileUploadPromises = [];
    const imageSavedSignedUrls = [];

    req.files.forEach((file) => {
      const currentFileName = generateFileName();
      const currentFileKey = `${ENTRY_IMAGES_FOLDER}/${currentFileName}`;

      const uploadPromise = uploadFileToS3(file.buffer, currentFileKey).then(
        (result) => result
      );

      fileUploadPromises.push(uploadPromise);
    });

    const uploadResults = await Promise.all(fileUploadPromises);

    for (const result of uploadResults) {
      imageSavedSignedUrls.push(result.key);
    }

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const newEntry = new Entry({
      location,
      types,
      imageUrls: imageSavedSignedUrls || null,
      author: req.user.id,
      yacht: req.user.yacht,
    });

    await newEntry.save();

    const yachtToUpdate = await Yacht.findById(newEntry.yacht);

    await yachtToUpdate.entries.push(newEntry);

    await yachtToUpdate.save();

    const userToUpdate = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { entries: newEntry._id } }
    );
    await userToUpdate.save();
    res.status(200).send(newEntry);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default createEntry;

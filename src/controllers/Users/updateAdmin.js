import generateFileName from "@utils/generateFileName";

import { uploadFileToS3, BUCKET_FOLDERS } from "@utils/s3";

const { USER_IMAGES_FOLDER } = BUCKET_FOLDERS;

const updateAdmin = async (req, res, next) => {
  const updates = Object.keys(req.body).filter((item) => item !== "token");

  try {
    if (req.file) {
      const currentFileName = generateFileName();
      const currentFileKey = `${USER_IMAGES_FOLDER}/${currentFileName}`;

      const uploadPromise = uploadFileToS3(
        req.file.buffer,
        currentFileKey
      ).then((result) => result);

      console.log("uploadPromise");
      console.log(uploadPromise);

      req.user["profileImage"] = currentFileKey;
    }

    //---

    const allowedUpdates = [
      "firstName",
      "lastName",
      "position",
      "settings",
      "password",
      "isEmailVerified",
      "isAdmin",
      //receive var is admin true?
      "profileImage",
    ];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log("invalid updates");
      return res.status(400).send({ error: "Invalid updates!" });
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));

    if (req.path === "/updateAdmin") {
      req.user["isAdmin"] = true;
    }
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    console.log("error from catch backend");
    console.log(error);
    res.status(400).send(error);
  }
};

export default updateAdmin;

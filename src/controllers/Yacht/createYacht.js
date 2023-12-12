import Yacht from "@models/Yacht";
import User from "@models/User";

import { uploadFileToS3, BUCKET_FOLDERS } from "@utils/s3";
import generateFileName from "@utils/generateFileName";

const { YACHT_IMAGES_FOLDER } = BUCKET_FOLDERS;

const createYacht = async (req, res, next) => {
  const { yachtName, flag, officialNumber, token } = req.body;
  let yachtImageUrl;
  // console.log(yachtName+flag+officialNumber)
  const { user } = req;
  const yachtUniqueName =
    yachtName.replace(/\s/g, "") + flag.replace(/\s/g, "").toLowerCase();

  try {
    let yacht = await Yacht.findOne({ yachtUniqueName });

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Sorry, there is no user associated with this request, try again!",
          },
        ],
      });
    }

    if (yacht) {
      return res.status(400).json({
        errors: [
          {
            msg: "Sorry, there is a yacht already registered with this flag and name!",
          },
        ],
      });
    }

    if (req.file) {
      const currentFileName = generateFileName();
      const currentFileKey = `${YACHT_IMAGES_FOLDER}/${currentFileName}`;

      const uploadPromise = uploadFileToS3(
        req.file.buffer,
        currentFileKey
      ).then((result) => result);

      console.log("uploadPromise");
      console.log(uploadPromise);

      yachtImageUrl = currentFileKey;
    }

    yacht = new Yacht({
      yachtUniqueName,
      officialNumber,
      name: yachtName,
      flag,
      yachtImage: yachtImageUrl,
      admin: user._id,
      users: [user._id],
    });
    await yacht.save();

    const currentUser = await User.findById(req.user.id);

    currentUser["yacht"] = yacht._id;

    await currentUser.save();

    res.status(200).send({ yacht });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

export default createYacht;

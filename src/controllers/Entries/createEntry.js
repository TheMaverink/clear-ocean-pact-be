import Yacht from "@models/Yacht";
import User from "@models/User";
import Entry from "@models/Entry";

import uploadToS3 from "@utils/uploadToS3";

const createEntry = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  const types = JSON.parse(req.body.types);

  try {
    const promises = [];

    req.files.forEach((file) => {
      promises.push(
        uploadToS3(file.buffer, "entry-images/").then((result) => result)
      );
    });

    const imageSavedUrls = await Promise.all(promises).then((results) => {
      console.log("images uploaded");
      return results.map((file) => {
        return file;
      });
    });

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const newEntry = new Entry({
      location,
      types,
      imageUrls: imageSavedUrls || null,
      author: req.user.id,
      yacht: req.user.yacht,
    });

    console.log(req.user);

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

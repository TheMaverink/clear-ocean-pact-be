import uploadToS3 from "@utils/uploadToS3";
import Yacht from "@models/Yacht";

const updateCurrentUser = async (req, res, next) => {
  const currentUserYacht = await Yacht.findById(req.user.yacht);
  const { yachtUniqueName } = currentUserYacht;

  console.log("req.body");
  console.log(req.body);

  const updates = Object.keys(req.body).filter(
    (item) =>
      item !== "token" && item !== "yachtUniqueName" && item !== "userId"
  );

  console.log("updates");
  console.log(updates);

  try {
    if (req.file) {
      let profileImage = null;

      profileImage = await uploadToS3(req.file.buffer, "user-images/").then(
        (result) => result
      );

      req.user["profileImage"] = await profileImage;
    }

    const allowedUpdates = [
      "position",
      "profileImage",
      "isPrivateProfile",
      "firstName",
      "lastName",
    ];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log("invalid updates");
      return res.status(400).send({ error: "Invalid updates!" });
    }
    // updates.forEach((update) => (req.user[update] = req.body[update]));

    //IF NOT EXISTENT
    const yachtToUpdate = await Yacht.findOneAndUpdate(
      { yachtUniqueName: yachtUniqueName },
      { $push: { users: req.user._id } }
    );

    // const userToUpdate = await User.findOneAndUpdate(
    //   { _id: req.user.id },
    //   { yacht: yachtToUpdate._id }
    // );

    // const userToUpdate = await User.find(
    //   { _id: req.user.id }

    // );

    // const userToUpdate = await User.findById(req.user.id);

    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    console.log("error from catch backend");
    console.log(error);
    res.status(400).send(error);
  }
};

export default updateCurrentUser;

import Yacht from "@models/Yacht";

import uploadToS3 from "@utils/uploadToS3";

const updateYacht = async (req, res, next) => {
  try {
    // const currentUserYacht = await Yacht.findById(req.user.yacht);

    const updates = Object.keys(req.body).filter(
      (item) => item !== "token" && item !== "yachtId"
    );

    const currentUserYacht = await Yacht.findById(req.body.yachtId);

    console.log("updates");
    console.log(updates);
    console.log("currentUserYacht");
    console.log(currentUserYacht);

    if (req.file) {
      let yachtImage = null;

      yachtImage = await uploadToS3(req.file.buffer, "yacht-images/").then(
        (result) => result
      );

      currentUserYacht["yachtImage"] = yachtImage;
    }

    const allowedUpdates = ["yachtImage", "isPrivateProfile", "officialNumber"];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log("invalid updates");
      return res.status(400).send({ error: "Invalid updates!" });
    }
    updates.forEach((update) => {
      console.log("update");
      console.log(update);
      return (currentUserYacht[update] = req.body[update]);
    });

    await currentUserYacht.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default updateYacht;

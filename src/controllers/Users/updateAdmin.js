import uploadToS3 from "@utils/uploadToS3";

const updateAdmin = async (req, res, next) => {
  console.log("UPDATE ADMIN CONTROLLER CALLED");
  const updates = Object.keys(req.body).filter((item) => item !== "token");

  let profileImage;
  try {
    if (req.file) {
      profileImage = await uploadToS3(req.file.buffer, "user-images/").then(
        (result) => result
      );

      req.user["profileImage"] = profileImage;
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

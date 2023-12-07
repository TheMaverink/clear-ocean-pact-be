const joinYacht = async (req, res, next) => {
  try {
    const { user } = await req;

    const { yachtUniqueName } = req.body;

    // const currentUser = await User.findById(req.user._id);
    const currentYacht = await Yacht.findOneAndUpdate(
      { yachtUniqueName: yachtUniqueName },
      { $push: { users: req.user._id } }
    );
    // const currentYacht = await Yacht.find({ yachtUniqueName: yachtUniqueName });

    // const query = await Yacht.find({ 'invitedUsers.email': user.email });

    // console.log('query')
    // console.log(query)

    // const yachtId = query[0]._id;
    req.user["yacht"] = await currentYacht._id;

    //   const currentYacht = await Yacht.findOneAndUpdate(
    //     { yachtUniqueName: yachtUniqueName },
    //   { $push: { users: req.user._id } }
    // );

    const updates = Object.keys(req.body).filter(
      (item) => item !== "token" && item !== "yachtUniqueName"
    );

    if (req.file) {
      let profileImage = null;

      profileImage = await uploadToS3(req.file.buffer, "user-images/").then(
        (result) => result
      );

      req.user["profileImage"] = profileImage;
    }

    const allowedUpdates = ["position", "profileImage"];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log("invalid updates");
      return res.status(400).send({ error: "Invalid updates!" });
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));

    // const yachtToUpdate = await Yacht.findOneAndUpdate(
    //   { _id: yachtId },
    //   { $push: { users: req.user._id } }
    // );

    // const userToUpdate = await User.findOneAndUpdate(
    //   { _id: req.user.id },
    //   { yacht: yachtId }
    // );

    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default joinYacht;

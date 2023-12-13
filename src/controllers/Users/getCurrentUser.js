import User from "@models/User";

const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .select("-tokens -password")
      .populate("yacht");

    const profileImageSignedUrl = await currentUser.profileImageSignedUrl;

    const response = {
      ...currentUser.toObject({ getters: true, virtuals: true }),
      profileImageSignedUrl,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getCurrentUser;

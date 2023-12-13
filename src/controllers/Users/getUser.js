import User from "@models/User";

const getUser = async (req, res, next) => {
  try {
    const specificUser = await User.findById(
      req.params.id,
      "firstName lastName email isAdmin position entries settings profileImage"
    ).populate("entries");

    const profileImageSignedUrl = await currentUser.profileImageSignedUrl;

    const response = {
      ...specificUser.toObject({ getters: true, virtuals: true }),
      profileImageSignedUrl,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getUser;

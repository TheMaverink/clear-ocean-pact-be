import User from "@models/User";

const getUser = async (req, res, next) => {
  try {
    const specificUser = await User.findById(
      req.params.id,
      "firstName lastName email isAdmin position entries settings profileImage"
    ).populate("entries");

    console.log("specificUser");
    console.log(specificUser);

    res.json(specificUser);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getUser;

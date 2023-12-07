import User from "@models/User";

const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .select("-tokens -password")
      .populate("yacht");

    // const currentUser = await User.findById(req.user.id).populate('yacht');

    // const currentUser = await User.findById(req.user.id)

    res.json(currentUser);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getCurrentUser;

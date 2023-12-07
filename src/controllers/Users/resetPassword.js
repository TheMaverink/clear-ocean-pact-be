import User from "@models/User";

const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, code } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Sorry, there is no user registered with this email!",
      });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({
        msg: "Sorry, code does not match!",
      });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).send({ user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

export default resetPassword;

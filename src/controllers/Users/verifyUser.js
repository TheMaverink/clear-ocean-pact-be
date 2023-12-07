import jwt from "jsonwebtoken";
import User from "@models/User";
import confirmationRedirect from "@utils/pages/confirmationRedirect";

const verifyUser = async (req, res, next) => {
  try {
    const decodedId = Object.values(
      jwt.verify(req.params.token, process.env.JWT_SECRET)
    )[0];

    await User.findByIdAndUpdate(
      decodedId,
      { isEmailVerified: true },
      { new: true }
    );

    const confirmationRedirectPage = confirmationRedirect();
    res.status(200).send(confirmationRedirectPage);
  } catch (error) {
    console.log(error);
  }
};

export default verifyUser;

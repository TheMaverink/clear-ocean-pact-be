import User from "@models/User";
import confirmUser from "@utils/emails/confirmUser";
import nodeMailerTransporter from "@utils/nodemailerTransporter";

const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: "Sorry, there is a user already registered with this email!",
      });
    }

    user = new User({
      email,
      firstName,
      lastName,
      password,
    });

    await user.save();

    const token = await user.generateJwtToken();
    //CHANGE THIS!!!
    const confirmLink = `${process.env.PROD_BASE_URL}/api/users/verify/${token}`;

    console.log("confirmLink");
    console.log(confirmLink);

    let mailOptions = {
      from: "Clear Ocean Pact <noreply@test.com>",
      to: `${email}`,
      subject: "Email Verification",
      html: confirmUser(firstName, confirmLink),
    };

    await nodeMailerTransporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("message sent");
        console.log("data");
        console.log(data);
      }
    });

    console.log("user");
    console.log(user);

    res.status(200).send({ ...user.getPublicProfile(), token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

export default registerUser;

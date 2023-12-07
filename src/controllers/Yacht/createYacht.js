import Yacht from "@models/Yacht";

import User from "@models/User";
import uploadToS3 from "@utils/uploadToS3";

const createYacht = async (req, res, next) => {
  const { yachtName, flag, officialNumber, token } = req.body;
  let yachtImageUrl;
  // console.log(yachtName+flag+officialNumber)
  const { user } = req;
  const yachtUniqueName =
    yachtName.replace(/\s/g, "") + flag.replace(/\s/g, "").toLowerCase();

  console.log("yachtUniqueName");
  console.log(yachtUniqueName);

  try {
    let yacht = await Yacht.findOne({ yachtUniqueName });

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Sorry, there is no user associated with this request, try again!",
          },
        ],
      });
    }

    if (yacht) {
      return res.status(400).json({
        errors: [
          {
            msg: "Sorry, there is a yacht already registered with this flag and name!",
          },
        ],
      });
    }

    if (req.file) {
      console.log("is gona upload yacht img");

      yachtImageUrl = await uploadToS3(req.file.buffer, "yacht-images/").then(
        (result) => result
      );
    }

    yacht = new Yacht({
      yachtUniqueName,
      officialNumber,
      name: yachtName,
      flag,
      yachtImage: yachtImageUrl,
      admin: user._id,
      users: [user._id],
    });
    await yacht.save();

    const currentUser = await User.findById(req.user.id);

    currentUser["yacht"] = yacht._id;

    await currentUser.save();

    res.status(200).send({ yacht });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

export default createYacht;

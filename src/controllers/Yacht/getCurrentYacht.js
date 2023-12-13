import Yacht from "@models/Yacht";

const getCurrentYacht = async (req, res, next) => {
  try {
    const currentUserYacht = await Yacht.findById(req.user.yacht);

    const yachtImageSignedUrl = await currentUserYacht.yachtImageSignedUrl;

    const response = {
      ...currentUserYacht.toObject({ getters: true, virtuals: true }),
      yachtImageSignedUrl,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getCurrentYacht;

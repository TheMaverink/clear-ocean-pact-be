import Yacht from "@models/Yacht";

const getCurrentYacht = async (req, res, next) => {
  try {
    const currentUserYacht = await Yacht.findById(req.user.yacht);

    res.json(currentUserYacht);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getCurrentYacht;

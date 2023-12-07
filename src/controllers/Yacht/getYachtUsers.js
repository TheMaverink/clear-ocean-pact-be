import Yacht from "@models/Yacht";

const getYachtUsers = async (req, res, next) => {
  try {
    // const currentUserYacht = await Yacht.findById(req.user.yacht).populate(
    //   'users'
    // );

    const currentUserYacht = await Yacht.findById(req.user.yacht).populate({
      path: "users",
      model: "User",
      populate: {
        path: "entries",
        model: "Entry",
      },
    });

    const yachtUsers = await currentUserYacht.users;
    console.log("yachtUsers");
    console.log(yachtUsers.length);
    res.json(yachtUsers);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getYachtUsers

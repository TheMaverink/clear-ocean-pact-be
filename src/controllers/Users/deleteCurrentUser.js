import User from "@models/User";
import Yacht from "@models/Yacht";

const deleteCurrentUser = async (req, res, next) => {
  const yachtWithThisAdmin = await Yacht.find({ admin: req.user._id });

  if (!yachtWithThisAdmin) {
    return res.status(400).json({
      msg: "Sorry, there is no yacht associated with this suser",
    });
  }

  const yachtWithThisAdminUsers = await yachtWithThisAdmin[0].users;

  let promises = yachtWithThisAdminUsers.map((id) =>
    User.findByIdAndRemove(id)
  );
  Promise.all(promises);

  await Yacht.findByIdAndRemove(yachtWithThisAdmin[0].id);

  res.status(200).send({ msg: "users deleted" });
};

export default deleteCurrentUser;

import Entry from "@models/Entry";

const deleteEntry = async (req, res, next) => {
  const entryId = req.params.id;
  try {
    await Entry.findOneAndRemove({ _id: entryId });

    res.json({ msg: "Entry deleted" });
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default deleteEntry;

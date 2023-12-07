import Entry from "@models/Entry";

const editEntry = async (req, res, next) => {
  const { entryType } = req.body;
  const entryId = req.params.id;

  try {
    const entryToUpdate = await Entry.findById(entryId);
    entryToUpdate["type"] = entryType;

    await entryToUpdate.save();

    res.status(200).send(entryToUpdate);
  } catch (error) {
    console.log("error from catch backend");
    console.log(error);
    res.status(400).send(error);
  }
};

export default editEntry;

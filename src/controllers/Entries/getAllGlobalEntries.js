import Entry from "@models/Entry";

const getAllGlobalEntries = async (req, res, next) => {
  try {
    const globalEntries = await Entry.find({}).populate(
      "author yacht",
      "-tokens -password"
    );

    res.json(globalEntries);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getAllGlobalEntries;

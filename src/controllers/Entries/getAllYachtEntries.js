import Entry from "@models/Entry";

const getAllYachtEntries = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;

    const yachtEntries = await Entry.find({ yacht: yachtId }).populate(
      "author yacht",
      "-tokens -password"
    );

    res.json(yachtEntries);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default getAllYachtEntries;

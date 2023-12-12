import { getObjectSignedUrl } from "@utils/s3";

const deleteImage = async (req, res, next) => {
  try {
    res.json({ msg: "image dleeted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
};

export default deleteImage;

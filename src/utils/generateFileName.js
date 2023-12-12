import crypto from "crypto";

const generateFileName = (bytes = 32, prependString = "") =>
  prependString + crypto.randomBytes(bytes).toString("hex");

export default generateFileName;

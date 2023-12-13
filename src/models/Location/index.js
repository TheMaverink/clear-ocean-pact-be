import mongoose, { Schema } from "mongoose";
import mongooseLeanGetters from "mongoose-lean-getters";

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, default: "Point" },
    coordinates: { type: [Numbers], index: "2dsphere" },
  },
  { timestamps: true }
);

locationSchema.set("toJSON", { getters: true, virtuals: false });

locationSchema.plugin(mongooseLeanGetters);

const Location = mongoose.model("Location", locationSchema);

export default Location;

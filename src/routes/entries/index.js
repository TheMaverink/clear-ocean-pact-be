import { Router } from "express";
import auth from "@middlewares/auth";
import entriesControllers from "@controllers/Entries";

const router = Router();

const {
  getAllGlobalEntries,
  getAllYachtEntries,
  createEntry,
  editEntry,
  deleteEntry,
} = entriesControllers;

var multer = require("multer");
var upload = multer({
  // limits: { fileSize: 1024 * 1024 },
});
var type = upload.single("entryImage");
var userType = upload.array("entryImage");

//ADD AUTH MIDDLEWARE!
router.get("/all/global", auth, getAllGlobalEntries);
router.get("/all/yacht", auth, getAllYachtEntries);
// router.post('/create', auth,userType, createEntry);
router.post("/create", auth, upload.array("entryImage", 5), createEntry);
router.post("/edit/:id", editEntry);
router.delete("/delete/:id", deleteEntry);

export default router;

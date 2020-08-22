import express from "express";
import Yacht from "./Yacht";
import User from "./User";
import Entry from "./Entry";

const router = express.Router();

router.use(...Yacht);
router.use(...User);
router.use(...Entry);


export default router;

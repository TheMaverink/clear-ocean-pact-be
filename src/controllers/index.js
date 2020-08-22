import express from "express";

import Yacht from "./Yacht";
import Users from "./Users";
import Entries from "./Entries";

const router = express.Router();

router.use(...Yacht);
router.use(...Users);
router.use(...Entries);


export default router;

import { Router } from "express";

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import yacht from "./yacht";
import users from "./users";
import entries from "./entries";
import test from "./test";

const router = Router();

router.use("/yacht", yacht);
router.use("/users", users);
router.use("/entries", entries);

if (process.env.ENABLE_TEST_ROUTES == "true") {
  router.use("/test", test);
}

export default router;

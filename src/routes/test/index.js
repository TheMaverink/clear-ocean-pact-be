import { Router } from "express";

import auth from "@middlewares/auth";

import testControllers from "@controllers/Test";

var multer = require("multer");
var upload = multer({
  // limits: { fileSize: 1024 * 1024 },
});
var type = upload.single("profileImage");
var userType = upload.single("profileImage");

const { uploadImage, getSignedUrl ,deleteImage} = testControllers;

console.log("testControllers")
console.log(testControllers)

const router = Router();

const feni = ()=>{
  console.log("feni")
}



//add new route to add users to permitted emails
//ADD AUTH ROUTES
router.post("/uploadImage", upload.array("image", 5), uploadImage);
router.get("/getSignedUrl", getSignedUrl);
router.get("/deleteImage", deleteImage);
// router.get("/current", auth, getCurrentUser);
// router.delete("/current", auth, deleteCurrentUser);
// router.delete("/:id", deleteUser);
// router.post("/register/user", userValidationRules(), validate, registerUser); //just use this from admin?
// router.get("/verify/:token", verifyUser);
// router.get("/isUserInvited", auth, isUserInvited);
// router.post("/updateUser", auth, userType, updateCurrentUser);
// router.post("/updateOtherUser", auth, userType, updateOtherUser);
// router.post("/joinYacht", auth, userType, joinYacht);
// router.post("/updateAdmin", auth, type, updateAdmin);
// router.post("/login", userValidationRules(), validate, loginUser);
// router.post("/join-yacht", auth, joinYacht);
// router.get("/all", getAllUsers);
// router.post("/invite", auth, inviteUsers);
// router.post("/password-reset-send-code", resetPasswordSendCode);
// router.post("/password-reset-confirm-code", resetPasswordConfirmCode);
// router.post("/password-reset", resetPassword);

export default router;

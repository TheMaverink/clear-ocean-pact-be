//POST users/register/user -> name,email,pass
//POST users/login/user -> name,email,pass
//POST users/register/admin -> flag,name, officialNumber,yachtImage,userImage,role,isAdmin:true
//PUT users/settings/edit -> settings:{private:true}
//POST users/register/user -> yachtUniqueName,role,userImage ?
//GET users/all
//GET users/$userId
//PUT users/$userId -> role
//DELETE users/$userId
//POST users/invite -> email, name

import { Router } from 'express';

import auth from '@middlewares/auth';
import { userValidationRules, validate } from '@utils/validator';

var multer = require('multer');
var upload = multer({
  limits: { fileSize: 1024 * 1024 },
});
var type = upload.single('profileImage');
var userType = upload.single('profileImage');

import {
  registerUser,
  verifyUser,
  getUser,
  updateUser,
  updateAdmin,
  loginUser,
  getAllUsers,
  deleteUser,
  joinYacht,
  isUserInvited,
  getCurrentUser,
} from '@controllers/Users';

const router = Router();

//add new route to add users to permitted emails
//ADD AUTH ROUTES
router.get('/user/:id', getUser);
router.get('/current', auth, getCurrentUser);
router.post('/register/user', userValidationRules(), validate, registerUser); //just use this from admin?
router.get('/verify/:token', verifyUser);
router.get('/isUserInvited', auth, isUserInvited);
router.post('/updateUser', userType, updateUser);
router.post('/updateAdmin', auth, type, updateAdmin);
router.post('/login', userValidationRules(), validate, loginUser);
router.post('/join-yacht', auth, joinYacht);
router.get('/all', getAllUsers);

router.delete('/:id', deleteUser);

// router.post('/register/admin', userValidationRules(), validate, registerUserAdmin)

// router.post('/logout', auth, logout)
// router.post('/logoutAll', auth, logoutAll)

// router.post('/invite', auth, inviteUsers)

// router.put('/settings/edit', auth, editSettings) ?

export default router;

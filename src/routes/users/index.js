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

import { Router } from 'express'

import auth from '@middlewares/auth';
import { userValidationRules, validate } from '@utils/validator';

const router = Router()

router.post('/register/user', userValidationRules(), validate, registerUser)
router.post('/register/admin', userValidationRules(), validate, registerUserAdmin)
router.post('/login/user', userValidationRules(), validate, loginUser)
router.post('/logout', auth, logout)
router.post('/logoutAll', auth, logoutAll)
router.put('/settings/edit', auth, editSettings)
router.get('/all', auth, getAllUsers)
router.get('/:id',auth,getUser)
router.put('/:id',auth,editUser)
router.delete('/:id', auth,deleteUser)
router.post('/invite', auth, inviteUsers)

export default router
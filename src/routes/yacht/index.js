//PUT yacht/edit -> settings:{private:true}
//POST yacht/new -> flag,name, officialNumber,yachtImage, userId

import { Router } from 'express';
import auth from '@middlewares/auth';
import {
  createYacht,
  populateInvites,
  // getYacht,
  getCurrentYacht,
  updateYacht,
  deleteCurrentYacht
} from '@controllers/Yacht';
var multer = require('multer');
var upload = multer({
  // limits: { fileSize: 0.5 * 1024 * 1024 },
});
var type = upload.single('yachtPhoto');

const router = Router();

router.get('/current', auth, getCurrentYacht);
router.delete('/current', auth, deleteCurrentYacht);
// router.get('/edit/:token', auth, editYacht);
router.post('/new', auth, type, createYacht);
router.get('/populate', populateInvites);
router.post('/updateYacht', auth, type, updateYacht);

export default router;

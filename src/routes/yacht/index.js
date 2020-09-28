//PUT yacht/edit -> settings:{private:true}
//POST yacht/new -> flag,name, officialNumber,yachtImage, userId

import { Router } from 'express'
import auth from '@middlewares/auth';

var multer = require('multer');


var upload = multer({
  limits:{fileSize: 1024 * 1024}
});
var type = upload.single('yachtPhoto');

import {createYacht} from '@controllers/Yacht'

const router = Router()

router.post('/new' ,auth,type, createYacht)
// router.put('/edit', auth, editYacht)

export default router
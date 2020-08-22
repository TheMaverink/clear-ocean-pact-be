//PUT yacht/edit -> settings:{private:true}
//POST yacht/new -> flag,name, officialNumber,yachtImage, userId

import { Router } from 'express'
import auth from '@middlewares/auth';

const router = Router()

router.post('/new' ,auth, addYacht)
router.put('/edit', auth, editYacht)

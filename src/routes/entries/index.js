//GET entries/all 
//GET entries/$entryId
//PUT entries/$entryId -> types,
//Delete entries/$entryId 

//PUT entries/new -> entryImage, location, types, isPrivate 

import { Router } from 'express'
import auth from '@middlewares/auth';

const router = Router()

// router.get('/all', auth, getAllEntries)
// router.get('/:id', auth, getEntry)
// router.put('/:id', auth, updateEntry)
// router.delete('/:id', auth, deleteEntry)
// router.post('/new' ,auth, addEntry)

export default router
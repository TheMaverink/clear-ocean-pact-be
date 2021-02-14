import { Router } from 'express';
import auth from '@middlewares/auth';

const router = Router();

import {
  getAllGlobalEntries,
  getAllYachtEntries,
  createEntry,
  editEntry,
  deleteEntry,
} from '@controllers/Entries';

//ADD AUTH MIDDLEWARE!
router.get('/all/global', getAllGlobalEntries);
router.get('/all/yacht', getAllYachtEntries);
router.post('/create', auth,createEntry);
router.post('/edit/:id', editEntry);
router.delete('/delete/:id', deleteEntry);

export default router;

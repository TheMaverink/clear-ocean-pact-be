import { Router } from 'express'

import yacht from './yacht'
import users from './users'
import entries from './entries'

const router = Router()

router.use('/yacht', yacht)
router.use('/users', users)
router.use('/entries', entries)

export default router




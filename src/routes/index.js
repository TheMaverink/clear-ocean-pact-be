import { Router } from 'express'
import users from './users'
import entries from './entries'

const router = Router()

router.use('/users', users)
router.use('/entries', entries)

export default router




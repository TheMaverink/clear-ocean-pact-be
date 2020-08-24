import jwt from 'jsonwebtoken';
import User from '@models/User';

import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      console.log('no user found');
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log("NOT AUTHORIZED")
    res.status(401).send({ error: 'Please Authenticate' });
  }
};

export default auth;

import express from 'express';
import bcrypt from 'bcrypt';
import User from '@models/User';
import Yacht from '@models/Yacht';

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            msg: 'Sorry, there is a user already registered with this email!',
          },
        ],
      });
    }

    user = new User({
      email,
      name,
      password
    })

    await user.save();

    const token = await user.generateJwtToken();

    // res.status(200).send({ vessel, token });
    res.status(200).send({ user: user.getPublicProfile(), token });

    

  }catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

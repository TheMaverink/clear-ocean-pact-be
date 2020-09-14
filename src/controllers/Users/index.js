import jwt from 'jsonwebtoken';

var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import User from '@models/User';
import Yacht from '@models/Yacht';

dotenv.config({ path: '.env' });

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
      })
    }

    user = new User({
      email,
      name,
      password,
    });

    await user.save();

    const token = await user.generateJwtToken();

    var data = {
      from: 'Clear Ocean Project <noreply@clearoceanproject.com>',
      to: 'teesace@gmail.com',
      subject: 'Email Verification',
      text: 'Please help us confirm your account for Clear Ocean Project',
      html: `
     
      <h2>Please click on the given link to activate your account</h2>

      <a href="${process.env.DEV_BASE_URL}/api/users/verify/${token}">This is a regular link</a>

     
      `,
    };

    mailgun.messages().send(data, function (error, body) {
      if (error) {
        console.log(error);
      }
      console.log('Email was sent');
      console.log(body);
    });

    // res.status(200).send({ vessel, token });
    res.status(200).send({ user: user.getPublicProfile(), token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const decodedId = Object.values(
      jwt.verify(req.params.token, process.env.JWT_SECRET)
    )[0];

    await User.findByIdAndUpdate(
      decodedId,
      { isEmailVerified: true },
      { new: true },
      function (error, result) {
        if (error) {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req, res, next) => {
  const updates = Object.keys(req.body);

  const allowedUpdates = [
    'name',
    'profileImage',
    'role',
    'entries',
    'settings',
  ];

  const updateAllowed = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!updateAllowed) {
    console.log('invalid updates');
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    console.log('error from catch backend');
    console.log(error);
    res.status(400).send(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  try {
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const token = await user.generateJwtToken();

    res.status(200).send({ user: user.getPublicProfile(), token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find(
      {},
      'name email isAdmin role entries settings'
    );
    res.json(allUsers);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getUser = async (req, res, send) => {
  try {
    const specificUser = await User.findById(
      req.params.id,
      'name email isAdmin role entries settings'
    );
    res.json(specificUser);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const deleteUser = async (req, res, send) => {
  try {
    await User.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

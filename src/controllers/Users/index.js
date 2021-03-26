import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});
// import S3 from 'aws-sdk/clients/s3';
dotenv.config({ path: '.env' });

let nodeEnv = process.env.NODE_ENV;

import express from 'express';
import bcrypt from 'bcrypt';
import User from '@models/User';
import Yacht from '@models/Yacht';
var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

export const inviteUsers = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;
    const { invitedEmail, invitedFirstName, invitedLastName} = req.body;

    const adminName = `${req.user.firstName} ${req.user.lastName}`;

    const currentYacht = await Yacht.findById(yachtId);

    const yachtUniqueName = currentYacht.yachtUniqueName;

    await currentYacht.invitedUsers.push({
      email: invitedEmail.toLowerCase(),
      invitedFirstName: invitedFirstName,
      invitedLastName: invitedLastName,
    });
    await currentYacht.save();

    var data = {
      from: 'Clear Ocean Project <noreply@clearoceanproject.com>',
      to: `${invitedEmail}`,
      subject: 'Invite',
      text: `hi ${invitedFirstName} Please help us confirm your account for Clear Ocean Project`,
      html: `<h1>${adminName} invited you to join the yacht with the unique name ${yachtUniqueName} </h1>
      <h2>Please download the app, create an account and join his yacht</h2>

      `,
    };

    mailgun.messages().send(data, function (error, body) {
      if (error) {
        console.log(error);
      }
      console.log('Email was sent');
      console.log(body);
    });

    res.json(currentYacht);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const specificUser = await User.findById(
      req.params.id,
      'firstName lastName email isAdmin position entries settings'
    );

    res.json(specificUser);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select(
      '-tokens -password'
    );

    res.json(currentUser);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const registerUser = async (req, res, next) => {
  const { firstName,lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg:'Sorry, there is a user already registered with this email!',
      });
    }

    user = new User({
      email,
      firstName,
      lastName,
      password,
    });

    await user.save();

    const token = await user.generateJwtToken();

    const baseUrl =
      nodeEnv === 'development'
        ? process.env.DEV_BASE_URL
        : process.env.PROD_BASE_URL;

    var data = {
      from: 'Clear Ocean Project <noreply@clearoceanproject.com>',
      to: `${email}`,
      subject: 'Email Verification',
      text: 'Please help us confirm your account for Clear Ocean Project',
      html: `
     
      <h1>Welcome ${firstName}</h1>
      <h2>Please click on the given link to activate your account</h2>

      <a href="${baseUrl}/api/users/verify/${token}">This is a regular link</a>

     
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
  const currentUserYacht = await Yacht.findById(req.user.yacht);
  const { yachtUniqueName } = currentUserYacht;

  const updates = Object.keys(req.body).filter(
    (item) => item !== 'token' && item !== 'yachtUniqueName'
  );

  console.log(updates)

  console.log(req.body.isPrivateProfile)

  try {
    if (req.file) {
      const bucketUrl =
        'https://' +
        process.env.BUCKET_NAME +
        '.s3.' +
        process.env.BUCKET_REGION +
        '.amazonaws.com/';

      let profileImage = null;
      function uploadFile(buffer, fileName) {
        return new Promise((resolve, reject) => {
          s3.upload(
            {
              Body: buffer,
              Key: fileName,
              Bucket: process.env.BUCKET_NAME,
              ContentType: 'image/jpeg',
            },
            (error) => {
              if (error) {
                reject(error);
              } else {
                console.info(fileName);
                resolve(fileName);
              }
            }
          );
        });
      }

      profileImage = await uploadFile(
        req.file.buffer,
        Date.now().toString()
      ).then((result) => bucketUrl + result);

      req.user['profileImage'] = profileImage;
    }

    const allowedUpdates = ['position', 'profileImage', 'isPrivateProfile'];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log('invalid updates');
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));

    //IF NOT EXISTENT
    const yachtToUpdate = await Yacht.findOneAndUpdate(
      { yachtUniqueName: yachtUniqueName },
      { $push: { users: req.user._id } }
    );

    const userToUpdate = await User.findOneAndUpdate(
      { _id: req.user.id },
      { yacht: yachtToUpdate._id }
    );

    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    console.log('error from catch backend');
    console.log(error);
    res.status(400).send(error);
  }
};

export const updateAdmin = async (req, res, next) => {
  const updates = Object.keys(req.body).filter((item) => item !== 'token');
console.log('updates')
console.log(updates)
  const bucketUrl =
    'https://' +
    process.env.BUCKET_NAME +
    '.s3.' +
    process.env.BUCKET_REGION +
    '.amazonaws.com/';

  let profileImage ;
  try {
    if (req.file) {
      function uploadFile(buffer, fileName) {
        return new Promise((resolve, reject) => {
          s3.upload(
            {
              Body: buffer,
              Key: fileName,
              Bucket: process.env.BUCKET_NAME,
              ContentType: 'image/jpeg',
            },
            (error) => {
              if (error) {
                reject(error);
              } else {
                console.info(fileName);
                resolve(fileName);
              }
            }
          );
        });
      }

      profileImage = await uploadFile(
        req.file.buffer,
        Date.now().toString()
      ).then((result) => bucketUrl + result);

      req.user['profileImage'] = profileImage;
    }

    //---

    const allowedUpdates = [
      'firstName',
      'lastName',
      'position',
      'settings',
      'password',
      'isEmailVerified',
      'isAdmin',
      //receive var is admin true?
      'profileImage',
    ];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log('invalid updates');
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));

    if (req.path === '/updateAdmin') {
      req.user['isAdmin'] = true;
    }
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
      return res.status(400).json({ msg:'Invalid Credentials'} );
    }

  const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg:'Invalid Credentials'} );
    }

    const token = await user.generateJwtToken();

    console.log(token);

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
      'firstName lastName email isAdmin role position entries settings yacht profileImage'
    ).populate('entries')

    console.log(allUsers)

    res.json(allUsers);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const isUserInvited = async (req, res, next) => {
  try {
    const { user } = await req;
    const query = await Yacht.find({ 'invitedUsers.email': user.email });

    if (!query[0]) {
      console.log('You need an invite first!');
      return res
        .status(400)
        .json({ errors: [{ msg: 'You need an invite first!' }] });
    }
    res.status(200).json({ yachtUniqueName: query[0].yachtUniqueName });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const joinYacht = async (req, res, next) => {
  try {
    const { user } = await req;

    const currentUser= await User.findById(req.user._id);

    const query = await Yacht.find({ 'invitedUsers.email': user.email });

const yachtId = query[0]._id
currentUser.yacht = yachtId

const updates = Object.keys(req.body).filter(
  (item) => item !== 'token' && item !== 'yachtUniqueName'
);

  if (req.file) {
    const bucketUrl =
      'https://' +
      process.env.BUCKET_NAME +
      '.s3.' +
      process.env.BUCKET_REGION +
      '.amazonaws.com/';

    let profileImage = null;
    function uploadFile(buffer, fileName) {
      return new Promise((resolve, reject) => {
        s3.upload(
          {
            Body: buffer,
            Key: fileName,
            Bucket: process.env.BUCKET_NAME,
            ContentType: 'image/jpeg',
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              console.info(fileName);
              resolve(fileName);
            }
          }
        );
      });
    }

    profileImage = await uploadFile(
      req.file.buffer,
      Date.now().toString()
    ).then((result) => bucketUrl + result);

    req.user['profileImage'] = profileImage;
  }

  const allowedUpdates = ['position', 'profileImage'];

  const updateAllowed = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!updateAllowed) {
    console.log('invalid updates');
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  updates.forEach((update) => (req.user[update] = req.body[update]));

 
  const yachtToUpdate = await Yacht.findOneAndUpdate(
    { _id: yachtId },
    { $push: { users: req.user._id } }
  );

  const userToUpdate = await User.findOneAndUpdate(
    { _id: req.user.id },
    { yacht: yachtId}
  );

  await req.user.save();

  res.status(200).send(req.user);
   
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

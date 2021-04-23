import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import nodemailerMailgun from 'nodemailer-mailgun-transport';
import uploadToS3 from '@utils/uploadToS3';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '@models/User';
import Yacht from '@models/Yacht';
import confirmationRedirect from '@resources/pages/confirmationRedirect';

// import nodeMailerTransporter from '@utils/nodeMailerTransporter';
import confirmUser from '@resources/emails/confirmUser';
import inviteUser from '@resources/emails/inviteUser';

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

let nodeMailerTransporter = nodemailer.createTransport(nodemailerMailgun(auth));

var mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

dotenv.config({ path: '.env' });

// let nodeEnv = process.env.NODE_ENV;

// const baseUrl =
//   nodeEnv === 'development'
//     ? process.env.DEV_BASE_URL
//     : process.env.PROD_BASE_URL;

export const deleteCurrentUser = async (req, res, next) => {
  const yachtWithThisAdmin = await Yacht.find({ admin: req.user._id });

  if (!yachtWithThisAdmin) {
    return res.status(400).json({
      msg: 'Sorry, there is no yacht associated with this suser',
    });
  }

  const yachtWithThisAdminUsers = await yachtWithThisAdmin[0].users;

  let promises = yachtWithThisAdminUsers.map((id) =>
    User.findByIdAndRemove(id)
  );
  Promise.all(promises);

  await Yacht.findByIdAndRemove(yachtWithThisAdmin[0].id);

  res.status(200).send({ msg: 'users deleted' });
};

export const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: 'Sorry, there is a user already registered with this email!',
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

    const confirmLink = `${process.env.PROD_BASE_URL}/api/users/verify/${token}`;

    let mailOptions = {
      from: 'Clear Ocean Project <noreply@clearoceanproject.com>',
      to: `${email}`,
      subject: 'Email Verification',
      html: confirmUser(firstName, confirmLink),
    };

    nodeMailerTransporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log('message sent');
      }
    });

    res.status(200).send({ user: user.getPublicProfile(), token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const inviteUsers = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;
    const { invitedEmail, invitedFirstName, invitedLastName } = req.body;

    const adminName = `${req.user.firstName} ${req.user.lastName}`;

    const currentYacht = await Yacht.findById(yachtId);

    const yachtUniqueName = currentYacht.yachtUniqueName;

    const yachtName = currentYacht.name;

    await currentYacht.invitedUsers.push({
      email: invitedEmail.toLowerCase(),
      invitedFirstName: invitedFirstName,
      invitedLastName: invitedLastName,
    });
    await currentYacht.save();

    let mailOptions = {
      from: 'Clear Ocean Project <noreply@clearoceanproject.com>',
      to: `${invitedEmail}`,
      subject: 'You have been invited!',
      html: inviteUser(invitedFirstName, adminName, yachtUniqueName, yachtName),
    };

    nodeMailerTransporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log('message sent');
      }
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
      'firstName lastName email isAdmin position entries settings profileImage'
    );

    res.json(specificUser);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .select('-tokens -password')
      .populate('yacht');

    // const currentUser = await User.findById(req.user.id).populate('yacht');

    // const currentUser = await User.findById(req.user.id)

    res.json(currentUser);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
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

    const confirmationRedirectPage = confirmationRedirect();
    res.status(200).send(confirmationRedirectPage);
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

  try {
    if (req.file) {
      let profileImage = null;

      profileImage = await uploadToS3(req.file.buffer, 'user-images/').then(
        (result) => result
      );

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

  console.log(req.body);

  let profileImage;
  try {
    if (req.file) {
      profileImage = await uploadToS3(req.file.buffer, 'user-images/').then(
        (result) => result
      );

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
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
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
      'firstName lastName email isAdmin role position entries settings yacht profileImage isEmailVerified isPrivateProfile'
    ).populate('entries');

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

    // if (!query[0]) {
    //   console.log('You need an invite first!');
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'You need an invite first!' }] });
    // }
    if (!query[0]) {
      console.log('You need an invite first!');
      return res
        .status(200)
        .json({ yachtUniqueName: null, isUserInvited: false });
    }
    res
      .status(200)
      .json({ yachtUniqueName: query[0].yachtUniqueName, isUserInvited: true });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const joinYacht = async (req, res, next) => {
  try {
    const { user } = await req;

    const { yachtUniqueName } = req.body;

    // const currentUser = await User.findById(req.user._id);
    const currentYacht = await Yacht.findOneAndUpdate(
      { yachtUniqueName: yachtUniqueName },
      { $push: { users: req.user._id } }
    );
    // const currentYacht = await Yacht.find({ yachtUniqueName: yachtUniqueName });
    console.log('currentYacht');
    console.log(currentYacht);

    // const query = await Yacht.find({ 'invitedUsers.email': user.email });

    // console.log('query')
    // console.log(query)

    // const yachtId = query[0]._id;
    req.user['yacht'] = await currentYacht._id;

    //   const currentYacht = await Yacht.findOneAndUpdate(
    //     { yachtUniqueName: yachtUniqueName },
    //   { $push: { users: req.user._id } }
    // );

    const updates = Object.keys(req.body).filter(
      (item) => item !== 'token' && item !== 'yachtUniqueName'
    );

    if (req.file) {
      let profileImage = null;

      profileImage = await uploadToS3(req.file.buffer, 'user-images/').then(
        (result) => result
      );

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

    // const yachtToUpdate = await Yacht.findOneAndUpdate(
    //   { _id: yachtId },
    //   { $push: { users: req.user._id } }
    // );

    // const userToUpdate = await User.findOneAndUpdate(
    //   { _id: req.user.id },
    //   { yacht: yachtId }
    // );

    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

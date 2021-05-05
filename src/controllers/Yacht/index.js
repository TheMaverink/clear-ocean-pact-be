import Yacht from '@models/Yacht';
import dotenv from 'dotenv';

import User from '@models/User';
import uploadToS3 from '@utils/uploadToS3';

dotenv.config({ path: '.env' });

export const deleteCurrentYacht = async (req, res, next) => {
  console.log('yeah');
};

export const createYacht = async (req, res, next) => {
  const { yachtName, flag, officialNumber, token } = req.body;
  let yachtImageUrl;
  // console.log(yachtName+flag+officialNumber)
  const { user } = req;
  const yachtUniqueName = yachtName.replace(/\s/g, '') + flag;

  console.log('req.body');
  console.log(req.body);

  try {
    let yacht = await Yacht.findOne({ yachtUniqueName });

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg:
              'Sorry, there is no user associated with this request, try again!',
          },
        ],
      });
    }

    if (yacht) {
      return res.status(400).json({
        errors: [
          {
            msg:
              'Sorry, there is a yacht already registered with this flag and name!',
          },
        ],
      });
    }

    if (req.file) {
      console.log('is gona upload yacht img');

      yachtImageUrl = await uploadToS3(req.file.buffer, 'yacht-images/').then(
        (result) => result
      );
    }

    yacht = new Yacht({
      yachtUniqueName,
      officialNumber,
      name: yachtName,
      flag,
      yachtImage: yachtImageUrl,
      admin: user._id,
      users: [user._id],
    });
    await yacht.save();

    const currentUser = await User.findById(req.user.id);

    currentUser['yacht'] = yacht._id;

    await currentUser.save();

    res.status(200).send({ yacht });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const populateInvites = async (req, res, next) => {
  try {
    let doc = await Yacht.findOneAndUpdate(
      { yachtUniqueName: 'AdminAUS' },
      {
        invitedUsers: [
          { email: 'a@a.com', firstName: 'ju' },
          { email: 'b@b.com', firstName: 'ju' },
          { email: 'c@c.com', firstName: 'ju' },
          { email: 'd@d.com', firstName: 'ju' },
          { email: 'e@e.com', firstName: 'ju' },
          { email: 'f@f.com', firstName: 'ju' },
          { email: 'g@g.com', firstName: 'ju' },
          { email: 'h@h.com', firstName: 'ju' },
          { email: 'i@i.com', firstName: 'ju' },
          { email: 'j@j.com', firstName: 'ju' },
          { email: 'k@k.com', firstName: 'ju' },
          { email: 'l@l.com', firstName: 'ju' },
          { email: 'm@m.com', firstName: 'ju' },
          { email: 'n@n.com', firstName: 'ju' },
          { email: 'o@o.com', firstName: 'ju' },
          { email: 'p@p.com', firstName: 'ju' },
          { email: 'q@q.com', firstName: 'ju' },
          { email: 'r@r.com', firstName: 'ju' },
          { email: 's@s.com', firstName: 'ju' },
          { email: 't@t.com', firstName: 'ju' },
          { email: 'u@u.com', firstName: 'ju' },
          { email: 'v@v.com', firstName: 'ju' },
          { email: 'w@w.com', firstName: 'ju' },
          { email: 'x@x.com', firstName: 'ju' },
          { email: 'y@y.com', firstName: 'ju' },
          { email: 'z@z.com', firstName: 'ju' },
        ],
      },
      {
        new: true,
      }
    );

    res.status(200).send(doc);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getCurrentYacht = async (req, res, next) => {
  try {
    const currentUserYacht = await Yacht.findById(req.user.yacht);

    res.json(currentUserYacht);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getYachtUsers = async (req, res, next) => {
  try {
    // const currentUserYacht = await Yacht.findById(req.user.yacht).populate(
    //   'users'
    // );

    const currentUserYacht = await Yacht.findById(req.user.yacht).populate({
      path: 'users',
      model: 'User',
      populate: {
        path: 'entries',
        model: 'Entry',
      },
    });

    const yachtUsers = await currentUserYacht.users;
    console.log('yachtUsers');
    console.log(yachtUsers);
    res.json(yachtUsers);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const updateYacht = async (req, res, next) => {
  try {
    // const currentUserYacht = await Yacht.findById(req.user.yacht);

    const updates = Object.keys(req.body).filter(
      (item) => item !== 'token' && item !== 'yachtId'
    );

    const currentUserYacht = await Yacht.findById(req.body.yachtId);

    console.log('updates');
    console.log(updates);
    console.log('currentUserYacht');
    console.log(currentUserYacht);

    if (req.file) {
      let yachtImage = null;

      yachtImage = await uploadToS3(req.file.buffer, 'yacht-images/').then(
        (result) => result
      );

      currentUserYacht['yachtImage'] = yachtImage;
    }

    const allowedUpdates = ['yachtImage', 'isPrivateProfile', 'officialNumber'];

    const updateAllowed = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!updateAllowed) {
      console.log('invalid updates');
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    updates.forEach((update) => {
      console.log('update');
      console.log(update);
      return (currentUserYacht[update] = req.body[update]);
    });

    await currentUserYacht.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

import Yacht from '@models/Yacht';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '@models/User';

dotenv.config({ path: '.env' });
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

export const createYacht = async (req, res, next) => {
  const bucketUrl =
    'https://' +
    process.env.BUCKET_NAME +
    '.s3.' +
    process.env.BUCKET_REGION +
    '.amazonaws.com/';
  const { yachtName, flag, officialNumber, token } = req.body;
  let yachtImageUrl = 'path to default image';
  // console.log(yachtName+flag+officialNumber)
  const { user } = req;
  const yachtUniqueName = flag + yachtName.trim();

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
                console.log(error);
                reject(error);
              } else {
                console.info(fileName);
                resolve(fileName);
              }
            }
          );
        });
      }

      yachtImageUrl = await uploadFile(
        req.file.buffer,
        Date.now().toString()
      ).then((result) => bucketUrl + result);
    }

    yacht = new Yacht({
      yachtUniqueName,
      officialNumber,
      name: yachtName,
      flag,
      yachtImage: yachtImageUrl,
      admin: user._id,
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
      { yachtUniqueName: 'LeoboatPOR' },
      {
        invitedUsers: [
          { email: 'a@a.com', name: 'ju' },
          { email: 'b@b.com', name: 'ju' },
          { email: 'c@c.com', name: 'ju' },
          { email: 'd@d.com', name: 'ju' },
          { email: 'e@e.com', name: 'ju' },
          { email: 'f@f.com', name: 'ju' },
          { email: 'g@g.com', name: 'ju' },
          { email: 'h@h.com', name: 'ju' },
          { email: 'i@i.com', name: 'ju' },
          { email: 'j@j.com', name: 'ju' },
          { email: 'k@k.com', name: 'ju' },
          { email: 'l@l.com', name: 'ju' },
          { email: 'm@m.com', name: 'ju' },
          { email: 'n@n.com', name: 'ju' },
          { email: 'o@o.com', name: 'ju' },
          { email: 'p@p.com', name: 'ju' },
          { email: 'q@q.com', name: 'ju' },
          { email: 'r@r.com', name: 'ju' },
          { email: 's@s.com', name: 'ju' },
          { email: 't@t.com', name: 'ju' },
          { email: 'u@u.com', name: 'ju' },
          { email: 'v@v.com', name: 'ju' },
          { email: 'w@w.com', name: 'ju' },
          { email: 'x@x.com', name: 'ju' },
          { email: 'y@y.com', name: 'ju' },
          { email: 'z@z.com', name: 'ju' },
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

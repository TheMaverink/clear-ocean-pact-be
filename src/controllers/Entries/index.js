import Yacht from '@models/Yacht';
import Entry from '@models/Entry';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '.env' });

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION,
});

export const createEntry = async (req, res, next) => {
  const { EntryImageInput, EntryLocationInput, EntryTypesInput } = req.body;
console.log(EntryImageInput)
  try {
    let entryImgUrl = null;

    if (EntryImageInput) {
      const bucketUrl =
        'https://' +
        process.env.BUCKET_NAME +
        '.s3.' +
        process.env.BUCKET_REGION +
        '.amazonaws.com/';

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

      // entryImgUrl = await uploadFile(
      //   req.file.buffer,
      //   Date.now().toString()
      // ).then((result) => bucketUrl + result);
    }

    const location = {
      type: 'Point',
      coordinates: [
        EntryLocationInput.coords.longitude,
        EntryLocationInput.coords.latitude,
      ],
    };

    const newEntry = new Entry({
      location,
      types: EntryTypesInput,
      // imageUrl: entryImgUrl || null,
      author: req.user.id,
      yacht: req.user.yacht,
    });

    await newEntry.save();

    const yachtToUpdate = await Yacht.findById(newEntry.yacht);

    await yachtToUpdate.entries.push(newEntry);

    await yachtToUpdate.save();

    res.status(200).send(newEntry);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }

  // const {
  //   entryImage,
  //   entryLocation,
  //   entryTypes,
  //   entryAuthor,
  //   entryYacht,
  // } = req.body;

  // const bucketUrl =
  //   'https://' +
  //   process.env.BUCKET_NAME +
  //   '.s3.' +
  //   process.env.BUCKET_REGION +
  //   '.amazonaws.com/';

  // // const { user } = req;

  // try {
  //   // let yacht = await Yacht.findOne({ yachtUniqueName });

  //   console.log('is gona upload yacht img');
  //   function uploadFile(buffer, fileName) {
  //     return new Promise((resolve, reject) => {
  //       s3.upload(
  //         {
  //           Body: buffer,
  //           Key: fileName,
  //           Bucket: process.env.BUCKET_NAME,
  //           ContentType: 'image/jpeg',
  //         },
  //         (error) => {
  //           if (error) {
  //             console.log(error);
  //             reject(error);
  //           } else {
  //             console.info(fileName);
  //             resolve(fileName);
  //           }
  //         }
  //       );
  //     });
  //   }

  //   entryImgUrl = await uploadFile(req.file.buffer, Date.now().toString()).then(
  //     (result) => bucketUrl + result
  //   );

  //   const entry = new Entry({
  //     author: entryAuthor,
  //     yacht: entryYacht,
  //     location: entryLocation,
  //     imageUrl: entryImgUrl,
  //     types: entryTypes,
  //   });
  //   await entry.save();
  //   res.status(200).send({ entry });
  // } catch (error) {
  //   console.error(error.message);
  //   res.status(500).send('Server error');
  // }
};

export const getAllGlobalEntries = async (req, res, next) => {
  try {
    const globalEntries = await Entry.find({});

    res.json(globalEntries);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getAllYachtEntries = async (req, res, next) => {
  const { yachtId } = req.body;

  try {
    const yachtEntries = await Yacht.find({ _id: yachtId }).populate('entries');

    res.json(yachtEntries.entries);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const editEntry = async (req, res, next) => {
  const { entryType } = req.body;
  const entryId = req.params.id;

  try {
    const entryToUpdate = await Entry.findById(entryId);
    entryToUpdate['type'] = entryType;

    await entryToUpdate.save();

    res.status(200).send(entryToUpdate);
  } catch (error) {
    console.log('error from catch backend');
    console.log(error);
    res.status(400).send(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  const entryId = req.params.id;
  try {
    await Entry.findOneAndRemove({ _id: entryId });

    res.json({ msg: 'Entry deleted' });
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

// export const populateEntries = async (req, res, next) => {
//   try {
//     let doc = await Yacht.findOneAndUpdate(
//       { yachtUniqueName: 'HugoBEL' },
//       {
//         invitedUsers: [
//           { email: 'userb@gmail.com', name: 'userB' },
//           { email: 'a@a.com', name: 'ju' },
//           { email: 'b@b.com', name: 'ju' },
//           { email: 'c@c.com', name: 'ju' },
//           { email: 'd@d.com', name: 'ju' },
//           { email: 'e@e.com', name: 'ju' },
//           { email: 'jf@jf.com', name: 'ju' },
//           { email: 'jm@jm.com', name: 'ju' },
//           { email: 'f@f.com', name: 'ju' },
//           { email: 'g@g.com', name: 'ju' },
//           { email: 'jh@jh.com', name: 'ju' },
//           { email: 'h@h.com', name: 'ju' },
//         ],
//       },
//       {
//         new: true,
//       }
//     );

//     res.status(200).send(doc);
//   } catch (error) {
//     res.status(500).send('Server Error');
//     console.log(error.message);
//   }
// };

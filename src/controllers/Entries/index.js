import Yacht from '@models/Yacht';
import User from '@models/User';
import Entry from '@models/Entry';
import dotenv from 'dotenv';
import uploadToS3 from '@utils/uploadToS3';

dotenv.config({ path: '.env' });

export const createEntry = async (req, res, next) => {
  const { latitude, longitude } = req.body;
  const types = JSON.parse(req.body.types);

  try {
    const promises = [];

    req.files.forEach((file) => {
      promises.push(uploadToS3(file.buffer).then((result) => result));
    });

    const imageSavedUrls = await Promise.all(promises).then((results) => {
      console.log('images uploaded');
      return results.map((file) => {
        return file;
      });
    });

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const newEntry = new Entry({
      location,
      types,
      imageUrls: imageSavedUrls || null,
      author: req.user.id,
      yacht: req.user.yacht,
    });

    console.log(req.user);

    await newEntry.save();

    const yachtToUpdate = await Yacht.findById(newEntry.yacht);

    await yachtToUpdate.entries.push(newEntry);

    await yachtToUpdate.save();

    const userToUpdate = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { entries: newEntry._id } }
    );
    await userToUpdate.save();
    res.status(200).send(newEntry);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getAllGlobalEntries = async (req, res, next) => {
  try {
    const globalEntries = await Entry.find({}).populate(
      'author',
      '-tokens -password'
    );

    res.json(globalEntries);
  } catch (error) {
    res.status(500).send('Server Error');
    console.log(error.message);
  }
};

export const getAllYachtEntries = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;

    const yachtEntries = await Entry.find({ yacht: yachtId }).populate(
      'author',
      '-tokens -password'
    );

    res.json(yachtEntries);
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

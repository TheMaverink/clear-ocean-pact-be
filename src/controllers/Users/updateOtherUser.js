import User from '@models/User';

 const updateOtherUser = async (req, res, next) => {
    const updates = Object.keys(req.body).filter(
      (item) => item !== 'token' && item !== 'userId'
    );
  
    const userToUpdate = await User.findById(req.body.userId).populate('entries');
  
    try {
      const allowedUpdates = ['position', 'firstName', 'lastName'];
  
      const updateAllowed = updates.every((update) =>
        allowedUpdates.includes(update)
      );
  
      if (!updateAllowed) {
        console.log('invalid updates');
        return res.status(400).send({ error: 'Invalid updates!' });
      }
  
      updates.forEach((update) => (userToUpdate[update] = req.body[update]));
  
      await userToUpdate.save();
  
      res.status(200).send(userToUpdate);
    } catch (error) {
      console.log('error from catch backend');
      console.log(error);
      res.status(400).send(error);
    }
  };

  export default updateOtherUser
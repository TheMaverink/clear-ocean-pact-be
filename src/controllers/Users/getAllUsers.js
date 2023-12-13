import User from '@models/User';

//Ensure signed images are not needed here
 const getAllUsers = async (req, res, next) => {
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

  export default getAllUsers
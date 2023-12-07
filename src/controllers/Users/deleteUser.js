import User from "@models/User";

 const deleteUser = async (req, res, next) => {
    try {
      // const user = await User.findById(req.params.id);
  
      await User.findByIdAndRemove(req.params.id);
  
      res.json({ msg: 'User deleted' });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  };

  export default deleteUser
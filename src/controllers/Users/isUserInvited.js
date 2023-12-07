import Yacht from '@models/Yacht';

 const isUserInvited = async (req, res, next) => {
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

  export default isUserInvited
import bcrypt from 'bcrypt';
import User from '@models/User';

 const loginUser = async (req, res, next) => {
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
  
  export default loginUser
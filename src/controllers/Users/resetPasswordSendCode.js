import seedrandom from 'seedrandom';
import User from '@models/User';
import resetPasswordUser from '@utils/emails/resetPasswordUser';
import nodeMailerTransporter from "@utils/nodemailerTransporter";


 const resetPasswordSendCode = async (req, res, next) => {
    try {
      const { email } = req.body;
      const resetCode = await new seedrandom()().toString().substring(3, 9);
  
      let user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({
          msg: 'Sorry, there is no user registered with this email!',
        });
      }
  
      user.resetPasswordCode = resetCode;
  
      const { firstName, lastName } = user;
  
      await user.save();
  
      let mailOptions = {
        from: 'Clear Ocean Pact <noreply@test.com>',
        to: `${email}`,
        subject: 'Reset Password',
        html: resetPasswordUser(firstName, lastName, resetCode),
      };
  
      nodeMailerTransporter.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log('message sent');
        }
      });
  
      console.log("user")
  
      console.log(user)
  
      res.status(200).send({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  };

  export default resetPasswordSendCode
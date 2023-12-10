import Yacht from "@models/Yacht";

import inviteUser from "@utils/emails/inviteUser";
import nodeMailerTransporter from "@utils/nodemailerTransporter";

const inviteUsers = async (req, res, next) => {
  try {
    const yachtId = req.user.yacht;
    const { invitedEmail, invitedFirstName, invitedLastName } = req.body;

    const adminName = `${req.user.firstName} ${req.user.lastName}`;

    const currentYacht = await Yacht.findById(yachtId);

    const yachtUniqueName = currentYacht.yachtUniqueName;

    const yachtName = currentYacht.name;

    await currentYacht.invitedUsers.push({
      email: invitedEmail.toLowerCase(),
      invitedFirstName: invitedFirstName,
      invitedLastName: invitedLastName,
    });
    await currentYacht.save();

    let mailOptions = {
      from: "Clear Ocean Pact <noreply@test.com>",
      to: `${invitedEmail}`,
      subject: "You have been invited!",
      html: inviteUser(invitedFirstName, adminName, yachtUniqueName, yachtName),
    };

    nodeMailerTransporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("message sent");
      }
    });

    res.json(currentYacht);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default inviteUsers;

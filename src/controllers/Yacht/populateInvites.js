import Yacht from "@models/Yacht";

 const populateInvites = async (req, res, next) => {
  try {
    let doc = await Yacht.findOneAndUpdate(
      { yachtUniqueName: "AdminAUS" },
      {
        invitedUsers: [
          { email: "a@a.com", firstName: "ju" },
          { email: "b@b.com", firstName: "ju" },
          { email: "c@c.com", firstName: "ju" },
          { email: "d@d.com", firstName: "ju" },
          { email: "e@e.com", firstName: "ju" },
          { email: "f@f.com", firstName: "ju" },
          { email: "g@g.com", firstName: "ju" },
          { email: "h@h.com", firstName: "ju" },
          { email: "i@i.com", firstName: "ju" },
          { email: "j@j.com", firstName: "ju" },
          { email: "k@k.com", firstName: "ju" },
          { email: "l@l.com", firstName: "ju" },
          { email: "m@m.com", firstName: "ju" },
          { email: "n@n.com", firstName: "ju" },
          { email: "o@o.com", firstName: "ju" },
          { email: "p@p.com", firstName: "ju" },
          { email: "q@q.com", firstName: "ju" },
          { email: "r@r.com", firstName: "ju" },
          { email: "s@s.com", firstName: "ju" },
          { email: "t@t.com", firstName: "ju" },
          { email: "u@u.com", firstName: "ju" },
          { email: "v@v.com", firstName: "ju" },
          { email: "w@w.com", firstName: "ju" },
          { email: "x@x.com", firstName: "ju" },
          { email: "y@y.com", firstName: "ju" },
          { email: "z@z.com", firstName: "ju" },
        ],
      },
      {
        new: true,
      }
    );

    res.status(200).send(doc);
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error.message);
  }
};

export default populateInvites
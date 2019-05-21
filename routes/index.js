const router = require("express").Router();
const apiRoutes = require("./api");
const authRoutes = require("./auth");
const path = require('path')

router.use("/auth", authRoutes);
router.use("/api", apiRoutes);

//healthcheck route
router.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "this is a test route"
  });
});

router.get("/reset/:token", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));

});
//google domain
router.get("/google7b7b93bf9368fb7e.html", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'google7b7b93bf9368fb7e.html'));

});



// 'https://' + req.headers.host + '/reset/' + token + '\n\n' +
// app.post('/confirmation', userController.confirmationPost);
// app.post('/resend', userController.resendTokenPost);

// router.get("/reset/" +  )
// router.get('/reset/:token', (req, res) => {
//   console.log(req.body)
//     res.json({received: req.params.token});
// });

// app.put("/api/resetpass", (req, res) => {
//   const { resetPassLink, newPassword } = req.body;
//   User.hashPassword(newPassword)
//     .then(hassedPass => {
//       return User;
//     })
//     .update(
//       { resetPassLink },
//       {
//         $set: {
//           "local.password": hassedPass,
//           resetPassLink: ""
//         }
//       },

//       function(err, feedback) {
//         if (error) return res.send(error);
//         return res.send(feedback);
//       }
//     );
// });

module.exports = router;

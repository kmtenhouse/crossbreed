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


//google domain
/* router.get("/google7b7b93bf9368fb7e.html", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'google7b7b93bf9368fb7e.html'));

});
 */
module.exports = router;

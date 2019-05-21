const express = require('express');
const router = express.Router();
const userController = require("../../controllers/userController");
const asyncMiddleWare = require('../middleware/async');

//UNPROTECTED ROUTES (GET)-- /api/users/:userId
router.get('/:userId', userController.findOne); //Find basic details + pets + eggs for a single user

//PROTECTED ROUTES - User
router.put('/:userId', asyncMiddleWare(userController.update)); //Update select user info (like their display name)
router.delete('/:userId', userController.delete); //Delete my user account (and all my pets/eggs)

module.exports = router;

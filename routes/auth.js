const express = require('express');
const router = express.Router();

//------------ Importing Controllers ------------//
const authController = require('../controllers/authController');

//------------ Login Route ------------//
router.get('/login', (req, res) => res.render('login'));

//------------ Forgot Password Route ------------//
router.get('/forgot', (req, res) => res.render('forgot'));

//------------ Reset Password Route ------------//
router.get('/reset/:id', (req, res) => {
    res.render('reset', { id: req.params.id })
});

//------------ Register Route ------------//  // Shivaji Update
router.get('/register', (req, res) => {
    console.log(req.query)
    res.render('register', {
        idid: req.query.idid,
        emaile: req.query.emaile
    })
});

//------------ Register POST Handle ------------//
router.post('/register', authController.registerHandle);

//------------ Email ACTIVATE Handle ------------//
router.get('/activate/:token', authController.activateHandle);

//------------ Forgot Password Handle ------------//
router.post('/forgot', authController.forgotPassword);

//------------ Reset Password Handle ------------//
router.post('/reset/:id', authController.resetPassword);

// Shivaji Update
router.post("/reflink", authController.reflink);
router.post("/dynamic/:email", authController.dynamic);
router.post('/editt/:id', authController.editProfile);
router.post('/change/:id', authController.changePasswd);
router.post('/dice/:id', authController.game1);
router.post('/card/:id', authController.game2);
router.post('/dice2/:id', authController.game3);
router.post('/paitry/:id', authController.game4);
router.post("/order1", authController.order1);
router.post("/verify1", authController.verify1);
router.post("/contact3", authController.contact3);
router.post("/contact4", authController.contact4);

//------------ Reset Password Handle ------------//
router.get('/forgot/:token', authController.gotoReset);

//------------ Login POST Handle ------------//
router.post('/login', authController.loginHandle);

//------------ Logout GET Handle ------------//
router.get('/logout', authController.logoutHandle);

module.exports = router;
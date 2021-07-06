const express = require('express');
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { ensureAuthenticated } = require('../config/checkAuth');
const e = require('connect-flash');

//------------ Welcome Route ------------//
router.get('/', (req, res) => {
    res.render('welcome');
});

//------------ Dashboard Route ------------// // Shivaji Update
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dash', {
    name: req.user.name,
    balance: req.user.balance,
    id: req.user._id
}));

// Shivaji Update

router.get('/success', ensureAuthenticated, (req, res) => res.render('success'));
router.get('/error', ensureAuthenticated, (req, res) => res.render('error'));
router.get('/reflink', ensureAuthenticated, (req, res) => res.render('reflink'));
router.get('/manual', ensureAuthenticated, (req, res) => res.render('manual'));
router.get('/dynamic/:email', ensureAuthenticated, (req, res) => res.render('dynamic'));
router.get('/invite', ensureAuthenticated, (req, res) => res.render('invite', {
    balance: req.user.balance,
    id: req.user._id,
    refcount: req.user.refcount,
    refbal: req.user.refbal,
    refto: req.user.refto
}));
router.get('/dice/:id', ensureAuthenticated, (req, res) => res.render('dice', {
    id: req.user._id
}));
router.get('/dice2/:id', ensureAuthenticated, (req, res) => res.render('dice2', {
    id: req.user._id
}));
router.get('/card/:id', ensureAuthenticated, (req, res) => res.render('card', {
    id: req.user._id
}));
router.get('/paitry/:id', ensureAuthenticated, (req, res) => res.render('paitry', {
    id: req.user._id
}));
router.get('/recharge', ensureAuthenticated, (req, res) => {
    res.render("recharge", {balance: req.user.balance, id: req.user._id });
});
router.get('/withdraw', ensureAuthenticated, (req, res) => res.render('withdraw', {
    balance: req.user.balance,
    id: req.user._id,
    name: req.user.withdrawname,
    num: req.user.whatsapp,
    upi: req.user.upiaddress
}));
router.get('/update', ensureAuthenticated, (req, res) => res.render('update'));
router.get('/profile', ensureAuthenticated, (req, res) => res.render('profile', {
    name: req.user.name,
    email: req.user.email,
    id: req.user._id
}));
router.get('/editt/:id', ensureAuthenticated, (req, res) => {
    res.render('editt', { id: req.user._id })
});
router.get('/change/:id', ensureAuthenticated, (req, res) => {
    res.render('change', { id: req.user._id })
}); 
router.get('/order', ensureAuthenticated, (req, res) => res.render('order', {
    game1: req.user.game1,
    game2: req.user.game2,
    game3: req.user.game3,
    game4: req.user.game4
}));
router.get('/finance', ensureAuthenticated, (req, res) => res.render('finance', {
    recharge: req.user.recharge,
    withdraw: req.user.withdraw
}));
router.get('/nav', ensureAuthenticated, (req, res) => res.render('nav'));

module.exports = router;
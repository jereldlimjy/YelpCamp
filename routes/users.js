const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    res.redirect('/campgrounds');
})

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/campgrounds');
})

module.exports = router;
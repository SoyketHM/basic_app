const express = require('express');
const  router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//bring in user model
const User = require('../models/user');

//register form
router.get('/register', (req, res) => {
    res.render('register');
});
// register proccess
router.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is required.');
    req.checkBody('emali', 'Email is required.');
    req.checkBody('username', 'Username is required.');
    req.checkBody('pasword', 'Pasword is required.');
    req.checkBody('pasword2', 'Re-pasword is required.');

    let errors = req.validationErrors();

    if(errors){
        res.render({
            errors: errors
        });
    }else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err,hash)=>{
                if (err){
                    console.log(err);
                }
                newUser.password =  hash;
                newUser.save((err)=>{
                    if (err){
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are registered and can log in.');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

// login form
router.get('/login', (req, res)=>{
    res.render('login');
})

//login process
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});

//logout
router.get('/logout', (req, res)=>{
   req.logout();
   req.flash('success', "You are logged out.");
   res.redirect('/users/login');
});

module.exports = router;
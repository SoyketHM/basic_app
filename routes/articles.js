const express = require('express');
const  router = express.Router();

//bring in article model
const Article = require('../models/article');
//user model
const User = require('../models/user');

// add route
router.get('/add',ensureAuthenticated, (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) console.log(err);
        res.render('addarticle', {
            title: 'Add Article'
        });
    });
});

//get single article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, (err, user)=>{
            res.render('article', {
                title: 'Article Details',
                article: article,
                auth: user.name
            });
        });
    });
});


// insert article
router.post('/add', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let errors = req.validationErrors();

    if(errors){
        res.render('addarticle', {
            title: 'Add Article',
            errors: errors
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((errors) => {
            if(errors){
                console.log(errors); return;
            }else{
                req.flash('success','Article Added.');
                res.redirect('/');
            }
        });
    }


});

//show edit form
router.get('/edit/:id',ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'You are not author!');
            res.redirect('/');
        }
        res.render('editarticle', {
            title: 'Edit Article',
            article: article
        });
    });
});

// update article
router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.update(query, article, (err) => {
        if(err){
            console.log(err); return;
        }else{
            req.flash('success','Article Updated.');
            res.redirect('/');
        }
    });
});

// delete article
router.delete('/:id', (req, res) => {
    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id:req.params.id};

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.status(500).send();
        }else {
            Article.remove(query, (err) => {
                if(err){
                    console.log(err); return;
                }else
                    res.send('Success');
            });
        }
    });


});

//access control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else {
        req.flash('denger', "Please Login.");
        res.redirect('/users/login');
    }
}


module.exports = router;
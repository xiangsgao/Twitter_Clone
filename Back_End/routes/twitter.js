const express = require('express');
const router = express.Router();
const {not_authen_redirect, authen_redirect, none_rediret_not_authen, none_redirect_authen}  = require('../app_compoents/protecting_routes');

/* GET home page. */
router.get('/main', function(req, res, next) {
    if(req.isAuthenticated()){
        return res.render('twitter_index', {sign_up_text:`Welcome ${req.user.username}`, login_text: 'Logout'});
    }
    res.render('twitter_index', {sign_up_text:`Sign Up`, login_text: 'Login'});
});

router.get('/search_item/', function(req, res, next) {
    if(req.isAuthenticated()){
        return res.render('twitter_search_item', {sign_up_text:`Welcome ${req.user.username}`, login_text: 'Logout', search_text: (req.query.username) ? req.query.username : ''});
    }
   return res.render('twitter_search_item', {sign_up_text:`Sign Up`, login_text: 'Login', search_text: (req.query.username) ? req.query.username : ''});
});


router.get('/add_item', not_authen_redirect, function(req, res, next) {
    res.render('twitter_add_item', {sign_up_text:`Welcome ${req.user.username}`, login_text: 'Logout'});
});

router.get('/all_users', function(req, res, next) {
    if(req.isAuthenticated()){
        return res.render('twitter_all_users', {sign_up_text:`Welcome ${req.user.username}`, login_text: 'Logout'});
    }
    res.render('twitter_all_users', {sign_up_text:`Sign Up`, login_text: 'Login'});
});

module.exports = router;
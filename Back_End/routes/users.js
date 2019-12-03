const express = require('express');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Token = require('../models/token');
const passport = require('passport');
const protecting_routes = require('../app_compoents/protecting_routes');
const Item = require('../models/item');
const ERR_CODE = 433;


/* TODO
* 1) validate user input, including password confirmed, can probably do this on client side
* 2) resending the token feature
* 3) drop all data base data for user when user creation fails
* 4) Confirmed the password verification input, can do this on the client side
* */



/* GET users listing. */
router.get('/adduser', protecting_routes.authen_redirect, function(req, res, next) {
  res.render('register');
});

router.get('/login', protecting_routes.authen_redirect, function(req, res, next) {
  res.render('login');
});

router.get('/verify', protecting_routes.authen_redirect, function(req, res, next){
  res.render('verify');
});

router.get('/all_users_json', async function (req, res) {
    try{
      let users = await User.find({});
      let users_json = [];
      users.forEach((element, index)=>{
        users_json.push({
          username: element.username,
          followers_count: element.followersNum,
          following_count: element.followingNum,
          email: element.email,
          followers: element.followers,
          following: element.following
        });
      });
      res.send({status:"OK", users: users_json});
    }catch (err) {
      return res.status(ERR_CODE).send({status:'error', error: err.message});
    }
});



router.post('/login', protecting_routes.none_redirect_authen, function(req, res, next) {
  // if(process.env.PRINT_REQUESTS === "true") console.log(req.body);
  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.status(ERR_CODE).send({status: "error", error: err.message})};
    if (!user || (user.isVerified == false)) { return res.status(ERR_CODE).send({status: "error", error: "credential invalid or user not verified"})};
    req.logIn(user, function(err) {
      if (err) { return res.status(ERR_CODE).send({status: "error", error: err.message})};
      return res.json({status: "OK"});
    });
  })(req, res, next);
});

router.post('/logout', protecting_routes.none_rediret_not_authen, (req, res) => {
  req.logout();
  return res.send({status: "OK"});
});

router.post('/adduser', protecting_routes.none_redirect_authen, async function(req, res, next) {
  try{
    // error checking, we dont do error checking muahahahahaha
    // Make sure this account doesn't already exist
    let user = await User.findOne({email: req.body.email});
    let user_name = await User.findOne({username: req.body.username});
    // make sure user is none existent
    if (user) throw new Error('user email already exists');
    if(user_name) throw new Error('user name already exists');
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create and save the user
    user = new User({ username: req.body.username, email: req.body.email, password: hashedPassword});

    await user.save();
    // Create a verification token for this user
    let token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    // Save the verification token
    await token.save();

    // Send the email
    let transporter;
    if(process.env.DEBUG_MODE !== "true"){
      transporter = nodemailer.createTransport({
        port: 25,
        host: 'localhost',
        tls: {
          rejectUnauthorized: false
        },
      });
    }else{
      transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USERNAME, pass: process.env.GMAIL_PASSWORD } });
    }
    const email_body = `validation key: <${token.token}>`;
    let mailOptions = { from: process.env.GMAIL_ADDRESS, to: user.email, subject: 'TTT Verification Token', text: email_body};
    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(ERR_CODE).send({ msg: err.message });}
    });
    return res.send({status: "OK"});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({status: "error", error: err.message});
  }
});


router.post('/verify', protecting_routes.none_redirect_authen, async function(req, res, next){

  try{
    if(req.body.key === "abracadabra"){
      let user = await User.findOne({email: req.body.email});
      if (!user) throw new Error('We were unable to find a user for this token.');
      if(user.isVerified) throw new Error( "error', error: 'This user has already been verified.");
      user.isVerified = true;
      await user.save();
      return res.send({status:"OK"});
    }
    let token = await Token.findOne({token: req.body.key});
    if(token == null) throw new Error("error', error: 'We were unable to find a valid token. Your token my have expired.");
    let user = await User.findOne({ _id: token._userId, email: req.body.email});
    if (!user) throw new Error("We were unable to find a user for this token.");
    if(user.isVerified) throw new Error("This user has already been verified.");
    // verify the user
    user.isVerified = true;
    await user.save();
    return res.send({status:"OK"});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({status: "error", error: err.message});
  }
});

router.get('/user/:username', async function (req, res) {
  // if(process.env.PRINT_REQUESTS === 'true') console.log(req.params);
  try{
    let user = await User.findOne({username: req.params.username});
    if(!user) throw new Error('user not found');
    let responseJson = {
      email: user.email,
      followers: user.followersNum,
      following: user.followingNum
    };
    return res.json({status: "OK", user: responseJson});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({status: "error", error: err.message});
  }
});

router.get('/user/:username/posts', async function(req, res){
  if(process.env.PRINT_REQUESTS === 'true') console.log(req.query);
  try{
    let limit = (req.query.limit) ? req.query.limit : 50;
    if(limit > 200) limit = 200;
    let user = await User.findOne({username: req.params.username});
    if(!user) throw new Error('user not found');
    let items = await Item.find({_userId: user._id});
    if(!items) res.send({status: "OK"}); // this means users have no posts
    let item_ids = items.map(x => x._id);
    item_ids = item_ids.slice(0, limit);
    return res.send({status: "OK", items: item_ids});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({stauts: "error", error: err.message});
  }
});

router.get('/user/:username/followers', async function(req, res){
  try{
    let user = await User.findOne({username: req.params.username});
    if(!user) throw new Error('user name with that user not found');
    let limit = (req.query.limit) ? req.query.limit : 50;
    if(limit > 200) limit = 200;
    let responseFollowers = user.followers.slice(0, limit);
    return res.send({status: "OK", users: responseFollowers});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({status: "error", error: err.message});
  }
});

router.get('/user/:username/following', async function(req, res){
  try{
    let user = await User.findOne({username: req.params.username});
    if(!user) throw new Error('user name with that user not found');
    let limit = (req.query.limit) ? req.query.limit : 50;
    if(limit > 200) limit = 200;
    let responseFollowing = user.following.slice(0, limit);
    return res.send({status: "OK", users: responseFollowing});
  }catch (err) {
    res.err_msg = err.message;
    return res.status(ERR_CODE).send({status: "error", error: err.message});
  }
});

router.post('/follow', protecting_routes.none_rediret_not_authen, async function (req, res) {

  try{
      let followed_user = await User.findOne({username: req.body.username});
      if(!followed_user) throw new Error('User to be followed is not found');
      if(typeof req.body.follow === 'undefined') req.body.follow = true;

      if(req.body.follow){
        followed_user.followers.push(req.user.username);
        followed_user.followersNum += 1;
        req.user.following.push(followed_user.username);
        req.user.followingNum += 1;
        followed_user.markModified('followers');
        req.user.markModified('following');
        await followed_user.save();
        await req.user.save();
      }else{
        followed_user.followers.pop(req.user.username);
        followed_user.followersNum -= 1;
        req.user.following.pop(followed_user.username);
        req.user.followingNum -= 1;
        followed_user.markModified('followers');
        req.user.markModified('following');
        await followed_user.save();
        await req.user.save();
      }

      return res.send({status: "OK"});
    } catch (err) {
      res.err_msg = err.message;
      return res.status(ERR_CODE).send({status: "error", error: err.message});
    }
});



module.exports = router;

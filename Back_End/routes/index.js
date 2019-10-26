const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' }); // default express index page
  // res.redirect('http://localhost:3000/'); // this is our react port
  res.redirect('/main');
});

module.exports = router;

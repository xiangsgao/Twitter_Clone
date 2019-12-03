const express = require('express');
const router = express.Router();
const Media = require('../models/media');
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
// Grid.mongo = mongoose.mongo;
const conn = mongoose.createConnection(process.env.MONGO_DATABASE_URL);
const {ObjectId} = require('mongodb');
const {not_authen_redirect, authen_redirect, none_rediret_not_authen, none_redirect_authen} = require('../app_compoents/protecting_routes');
let gfs; // this is what we are gonna use to retrieve images stored in the db
const ERR_CODE = 433;
conn.once('open', ()=>{
   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection('uploads');
});


// specify where the multer stores the uploaded file and how to name the file, cb is callback
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, process.env.UPLOAD_FILE_PATH);
//     },
//     filename: function (re, file, cb) {
//         cb(null, new Date().toISOString() + file.originalname); // prepend upload date to file name
//     }
// });

// this is better than the above, saved directly to a mongodb
const storage = new GridFsStorage({
    url: process.env.MONGO_DATABASE_URL,
    gfs : gfs,
    file: (req, file) => {
        req._contentId = mongoose.Types.ObjectId();
        return {
            // these are the fields in the collections
            filename: new Date().toISOString() + '_' + file.originalname,
            bucketName: 'uploads',
            id: req._contentId
        };
    }
});

// sets what files can be uploaded
// TODO needs to verify that the image is either image or video only
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        //cb(null, false); // use this if we are to just ignore if wrong file is uploaded instead of throwing error
        cb(new Error('wrong file type'), false);
    }
};

// set up the middle ware function for parsing multiform data
const upload = multer({
    storage: storage
    // limits:{ // we dont need to set size limit
    //     fileSize: 1024 * 1024 * 100,
    // },
    //fileFilter: fileFilter // not doing this at the moment cuz filtering is not done
});


router.post('/addmedia', none_rediret_not_authen, upload.single('content'), async function (req, res) {
    try{
        let media = new Media({_userId: req.user._id, _contentId: req._contentId});
        await media.save();
        let response = {status: "OK", id: media._contentId};
        if(process.env.PRINT_RESULT === 'true') console.log(response);
        return res.send(response);
    }catch (err) {
        res.err_msg = err.message;
        return  res.status(ERR_CODE).send({status: "error", error: err.message});
    }
});



// TODO needs to verifies the owner of the file so user that logs in can not access any images if he gets the image id somehow
router.get('/media/:id', none_rediret_not_authen, async function (req, res) {
    try{
        let file = await gfs.files.findOne({_id:  ObjectId(req.params.id)});
        if(!file || file.length === 0){
            return res.status(404).send({status: "error", error: "file not found"});
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        return;
    }catch (err) {
        res.err_msg = err.message;
        res.status(ERR_CODE).send({status: "error", error: err.message});
    }
});



module.exports = router;
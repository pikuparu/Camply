
const express=require('express');
const router=express.Router();
const catchAsync=require('../Utils/catchAsync')
const campgrounds=require('../controllers/campgrounds.js')
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware.js')
const Review=require('../models/review')
const multer  = require('multer')
const {storage}=require('../cloudinary');
const upload = multer({ storage });

const Campground=require('../models/campground')

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))


router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))


router.get('/debug/images', async (req, res, next) => {
    try {
        const campgrounds = await Campground.find({});
        console.log('🔥 All campgrounds debug info:');
        campgrounds.forEach(cg => {
            console.log('---');
            console.log('Title:', cg.title);
            console.log('images field:', cg.images);
            if(Array.isArray(cg.images)){
                console.log('Number of images:', cg.images.length);
                cg.images.forEach((img,i) => console.log(`Image ${i+1}:`, img.url));
            } else {
                console.log('images is NOT an array, current value:', cg.images);
            }
        });
        res.send('Check console logs for campground image debug info 🔥');
    } catch (e) {
        console.error('🔥 Debug route error:', e);
        next(e);
    }
});




module.exports=router;
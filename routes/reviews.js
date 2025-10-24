
const express=require('express')
const router=express.Router({mergeParams:true});
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware')
const expressErrors=require('../Utils/expressErrors')
const Campground=require('../models/campground')
const Review=require('../models/review')
const reviews=require('../controllers/reviews')
const catchAsync=require('../Utils/catchAsync')





router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports=router;
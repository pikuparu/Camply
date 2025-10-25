if(process.env.NODE_ENV !='production'){
    require('dotenv').config({quiet:true});
}
const sanitizeV5 = require('./Utils/mongoSanitizeV5.js');


const express=require('express')
const mongoose = require('mongoose');

const app=express();
app.set('query parser', 'extended');


const path=require('path');
const Campground=require('./models/campground')
const Review=require('./models/review')

const expressErrors=require('./Utils/expressErrors')
const methodOverride=require("method-override")
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const ejsMate=require('ejs-mate')
const session=require('express-session')
const flash=require('connect-flash')
const Joi=require('joi');
const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const {campgroundSchema,reviewSchema}=require('./errorValidationSchema.js')
const helmet=require('helmet');


const MongoDBStore= require('connect-mongo')(session);
const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp-maptiler';

mongoose.connect(dbUrl)
.then(() => {
    console.log("MongoDB connection successful 🚀");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))

app.use(sanitizeV5({ replaceWith: '_' }));

const secret=process.env.SECRET || 'thisshouldbeabettersecret';
const store=new MongoDBStore({
  url:dbUrl,
  secret,
  touchAfter:24*60*60
});

store.on('error',function(e){

  console.log('Session store error',e)
});

app.engine('ejs',ejsMate)
const validateCampground=(req,res,next)=>{

  
   const {error}=campgroundSchema.validate(req.body);
   if(error){
    const msg=error.details.map(el=>el.message).join(',')
    throw new expressErrors(msg,400)
   }else{ next();}
   

}

const validateReview=(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
    const msg=error.details.map(el=>el.message).join(',')
    throw new expressErrors(msg,400)
   }else{ next();}

}

const sessionConfig={
  store,
    name:'session',
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
 "https://stackpath.bootstrapcdn.com/",
 "https://kit.fontawesome.com/",
 "https://cdnjs.cloudflare.com/",

          "https://cdn.jsdelivr.net",
          "https://api.maptiler.com",
          "https://cdn.maptiler.com",
        ],
        workerSrc: ["'self'", "blob:"], // only here!
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
           "https://use.fontawesome.com/",
          "https://api.maptiler.com",
          "https://cdn.maptiler.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://images.unsplash.com",
          "https://plus.unsplash.com",
          "https://res.cloudinary.com/dfrh9yo3s/",
          "https://api.maptiler.com",
          "https://tile.maptiler.com",
          "https://cdn.maptiler.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.maptiler.com",
          "https://tile.maptiler.com",
          "https://cdn.maptiler.com",
          "https://res.cloudinary.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);








app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
     res.locals.error=req.flash('error');
res.locals.mapTilerApiKey = process.env.MAPTILER_API_KEY;
    next();
})
app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'colttt@gmail.com',username:'colttt'})
    const newUser=await User.register(user,'chicken');
    res.send(newUser)
})
app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)


app.get('/',(req,res)=>{
    res.render('home')
})



app.all(/.*/,(req,res,next)=>{
    next(new expressErrors('page not found',404))
})

app.use((err,req,res,next)=>{
    console.error("🔥 Error details:", err);
    const {message,statusCode=500}=err
    if(!err.message)err.message='oh no something went wrong';
   
    res.status(statusCode).render('error',{err})
})
const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
})
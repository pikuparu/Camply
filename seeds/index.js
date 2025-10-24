const mongoose = require('mongoose');

const cities=require('./cities')


const Campground=require('../models/campground')
const {places,descriptors}=require('./seedHelpers')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp-maptiler')
.then(() => {
    console.log("MongoDB connection successful 🚀");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
  const sample=(array)=>{
      return  array[Math.floor(Math.random()*array.length)]
  }
const seedDB= async()=>{
   await Campground.deleteMany({});
   
   for(let i=0;i<50;i++){
    const random1000=Math.floor(Math.random()*1000);
    const price=Math.floor(Math.random()*20)+10;
      const camp=  new Campground({
        author:'68f1e52e31ecb3e1bcdd87fa',
       location: `${cities[random1000].city},${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },

       title:`${sample(descriptors)} ${sample(places)}`,
       
       description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
       price,
       images:[
    {
      url: 'https://res.cloudinary.com/dfrh9yo3s/image/upload/v1760255318/yelpCamp/zvq1rvhmx0oormemvyvn.jpg',
      filename: 'yelpCamp/zvq1rvhmx0oormemvyvn',
      
    },
    {
      url: 'https://res.cloudinary.com/dfrh9yo3s/image/upload/v1760255321/yelpCamp/l1sonpsny0cosb6vjegf.jpg',
      filename: 'yelpCamp/l1sonpsny0cosb6vjegf',
      
    }
  ]

      })
      await camp.save();
   }
}
seedDB().then(()=>{
    mongoose.connection.close();
})
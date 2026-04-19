require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.resource('bl_materials/stkogyiif1tkhzllwzlc', {resource_type: 'image'})
  .then(res => console.log(res))
  .catch(err => console.log('Error as image:', err));

cloudinary.api.resource('bl_materials/stkogyiif1tkhzllwzlc', {resource_type: 'raw'})
  .then(res => console.log(res))
  .catch(err => console.log('Error as raw:', err));

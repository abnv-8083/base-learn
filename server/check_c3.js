require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.resources({ type: 'upload', prefix: 'bl_materials/', max_results: 10, resource_type: 'image' })
  .then(res => console.log('Images:', res.resources.map(r => r.public_id + '.' + r.format)))
  .catch(err => console.log(err));

cloudinary.api.resources({ type: 'upload', prefix: 'bl_materials/', max_results: 10, resource_type: 'raw' })
  .then(res => console.log('Raw:', res.resources.map(r => r.public_id)))
  .catch(err => console.log(err));

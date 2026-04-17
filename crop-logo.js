const { Jimp } = require('jimp');

async function processLogo() {
  try {
    const imagePath = 'web/public/logo-1080.png';
    const outputPath = 'web/public/logo-wide.png';

    const image = await Jimp.read(imagePath);
    
    // Crop the middle band: x=0, y=384, w=1024, h=256
    image.crop({ x: 0, y: 384, w: 1024, h: 256 });
    
    await image.write(outputPath);
    console.log("Logo hard-cropped and updated!");
  } catch (error) {
    console.error("Error processing logo:", error);
  }
}

processLogo();

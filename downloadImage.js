import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bbAssets = path.join(__dirname, 'bbAssets');
const jsonFilePath = path.join(bbAssets, 'imageUrls.json');

if (!fs.existsSync(bbAssets)) {
  console.error(`The folder "bbAssets" does not exist at path: ${bbAssets}`);
  process.exit(1);
}

if (!fs.existsSync(jsonFilePath)) {
  console.error(`The file "imageUrls.json" does not exist at path: ${jsonFilePath}`);
  process.exit(1);
}

// Function to extract the filename from the URL
function extractFileNameFromUrl(imageUrl) {
  const urlParts = imageUrl.split('/');
  return urlParts[urlParts.length - 1]; 
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logFailedImage(imageSrc, errorMessage) {
  const failedImagePath = path.join(bbAssets, 'FailedImages.json');
  let failedImages = [];
  
  // Read existing failed images if file exists
  if (fs.existsSync(failedImagePath)) {
    try {
      failedImages = JSON.parse(fs.readFileSync(failedImagePath, 'utf-8'));
    } catch (error) {
      console.error('Error reading FailedImages.json:', error.message);
    }
  }

  // Add new failed image with error message
  failedImages.push({
    imageSrc,
    errorMessage,
  });

  // Write updated failed images back to file
  fs.writeFileSync(failedImagePath, JSON.stringify(failedImages, null, 2), 'utf-8');
}

// Function to download a single image
async function downloadImage(imageSrc) {
  try {
    const fileName = extractFileNameFromUrl(imageSrc); // Extract the filename
    const response = await axios({
      url: imageSrc,
      method: 'GET',
      responseType: 'stream', // Stream binary data
    });

    const folderPath = path.join(bbAssets, 'assets'); // Define the folder to save images

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName); // Full path for the saved image

    // Pipe the data into the file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    console.log(`Downloaded: ${fileName}`);
  } catch (error) {
    console.error(`Failed to download ${imageSrc}:`, error.message);
    logFailedImage(imageSrc, error.message);
  }
}

// Function to download all images
async function downloadAllImages() {
  try {
    // Read image URLs from `imageUrls.json` file
    const data = fs.readFileSync(jsonFilePath, 'utf-8');
    const imageUrls = JSON.parse(data);

    for (const imageUrl of imageUrls) {
      await downloadImage(imageUrl); // Pass the full URL to downloadImage
      await delay(2000); // Add 2 second delay between downloads
    }

    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error.message);
  }
}

// Start the download process
downloadAllImages();
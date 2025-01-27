const fs = require('fs');
const xlsx = require('xlsx');

// Input JSON data
const jsonData = [
  {
    "url": "https://www.bebeautiful.in/fashion/what-to-wear/a-beginners-guide-to-an-office-wardrobe",
    "imageSources": [
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/The%20Best%20Face%20Moisturizers%20for%20Oily%20Skin.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/How%20to%20Use%20Glycolic%20Acid%20Serum.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/The%20Benefits%20of%20Vitamin%20C%20Face%20Wash%20that%20you%20didn%27t%20know%20about.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/How%20to%20Remove%20Tan%20from%20Face%20Immediately%20Using%20Tomato%20-%20A%20Natural%20Remedy.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/How%20Hair%20Spa%20Benefits%20Boost%20Hair%20Growth%20-%20The%20Ultimate%20Haircare%20Routine.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2025-01/Syncing%20your%20skincare%20routine%20to%20your%20skin%E2%80%99s%20circadian%20rhythm%20is%20important%2C%20and%20here%27s%20why.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/2024-07/2.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/2024-07/3.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/2024-07/4_2.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/a-beginners-guide-to-an-office-wardrobe-500x300.jpg",
      "https://www.bebeautiful.in/themes/custom/bebeautiful/images/virtual_try_on_banner.jpg",
      "https://static-bebeautiful-in-unileverservices-c7a7h6fgarfxdbbt.z01.azurefd.net/new-stage-bebeautiful-in/bb-logo.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/MobileHomeFeature_bbpicks.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/MobileHomeFeatured_17.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/PicMobileHomeFeature_18.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/PicMobileHomeFeature_2.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/icons/apple-touch-icon.png",
      "https://img.bebeautiful.in/www-bebeautiful-in/Make%20my%20hair%20thicker_MobileHomeFeature_2_0.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/4-simple-pimple-solutions-to-change-skin-game-forever_pichome.jpg",
      "https://img.bebeautiful.in/www-bebeautiful-in/5-benefits-of-eating-neem-leaves-on-an-empty-stomach_pichome.jpg"
    ],
    "videoSources": [],
    "backgroundImages": []
  }
];

// Prepare data for Excel
const excelData = jsonData.map((entry) => {
  // Flattening data: Adding imageSources into separate rows
  const rows = entry.imageSources.map((image, index) => ({
    url: entry.url,
    imageSource: image,
    index: index + 1
  }));
  return rows;
}).flat(); // Flatten the nested array

// Create a workbook and a worksheet
const ws = xlsx.utils.json_to_sheet(excelData);

// Create a new workbook with the sheet
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'URLs and Images');

// Write the workbook to a file
const outputFile = 'output.xlsx';
xlsx.writeFile(wb, outputFile);

console.log(`Excel file created successfully: ${outputFile}`);

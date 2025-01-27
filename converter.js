import fs from 'fs';

// File paths
const inputFile = 'url.json'; 
const outputFile = 'fixed_urls1.json';
// const baseURL = 'https://www.bebeautiful.in'; 

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading ${inputFile}:`, err);
    return;
  }

  try {

    const fixedLines = data
      .split('\n') // Split into lines
      .map((line) => {
        // Trim and validate each line
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('/')) {

          return `${trimmedLine}`; 
        }
        return null; // Ignore invalid lines
      })
      .filter((line) => line !== null); // Remove null entries

    // Prepare final JSON object
    const fixedData = {
      urlSources: fixedLines, // Use processed URLs
    };

    fs.writeFile(outputFile, JSON.stringify(fixedData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`Error writing to ${outputFile}:`, writeErr);
      } else {
        console.log(`Fixed URLs saved to ${outputFile}`);
      }
    });
  } catch (parseErr) {
    console.error('Error processing the input file:', parseErr);
  }
});

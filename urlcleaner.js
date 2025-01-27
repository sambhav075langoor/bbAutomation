import data from './url.json' assert { type: 'json' };
import fs from 'fs';

//Returns the last part of the URL
const values = data.map(entry => {
    const url = Object.values(entry)[0];
    return url.split("/").pop();
});

//Joins the values with a newline
const output = values.join('\n');

//Writes the output to a file
fs.writeFile('output.json', output, 'utf8', (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('File successfully written to output.json');
  }
});
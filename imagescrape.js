import * as cheerio from 'cheerio'; 
import axios from 'axios';
import url from 'url';
import fs from 'fs';



const jsonData = JSON.parse(fs.readFileSync('./fixed_urls1.json', 'utf8'));
const urlSources = jsonData.urlSources;
const delay = (min, max) => {
    const randomDelay = Math.random() * (max - min) + min; 
    return new Promise(resolve => setTimeout(resolve, randomDelay * 1000)); 
  };
  async function performScraping() {
    const processedUrls = new Set();
    const commonUrls = [
        'https://www.bebeautiful.in/themes/custom/bebeautiful/images/svg/mob-menu.svg',
        'https://www.bebeautiful.in/themes/custom/bebeautiful/images/svg/logo-footer.svg',
        'https://www.bebeautiful.in/themes/custom/bebeautiful/images/unilever.png',
        'https://www.bebeautiful.in/themes/custom/bebeautiful/images/homepage-v1/svg/logo_b.svg'
    ];
    
    try {
        fs.writeFileSync('output.json', '[\n', 'utf-8');
        let isFirstEntry = true;
        
        for (const currentUrl of urlSources) {
            if (processedUrls.has(currentUrl)) {
                continue;
            }
            
            try {
                const axiosResponse = await axios.request({
                    method: 'GET',
                    url: currentUrl,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'TE': 'Trailers',
                        'Referer': currentUrl, 
                    },
                });

                const $ = cheerio.load(axiosResponse.data);
                const baseUrl = new URL(currentUrl).origin; 

                const imageSources = [];
                $('img').each((_, element) => {
                    let imgSrc = $(element).attr('src');
                    if (imgSrc) {
                        if (!imgSrc.startsWith('http')) {
                            imgSrc = url.resolve(baseUrl, imgSrc);
                        }
                        // Only add if not in commonUrls and not already in imageSources
                        if (!commonUrls.includes(imgSrc) && !imageSources.includes(imgSrc)) {
                            imageSources.push(imgSrc);
                        }
                    }
                });

                const videoSources = [];
                $('video').each((_, element) => {
                    let videoSrc = $(element).attr('poster');
                    if (videoSrc && !videoSrc.startsWith('http')) {
                        videoSrc = url.resolve(baseUrl, videoSrc);
                    }
                    if (videoSrc && !commonUrls.includes(videoSrc) && !videoSources.includes(videoSrc)) {
                        videoSources.push(videoSrc);
                    }
                });

                const backgroundImages = [];
                $('*').each((_, element) => {
                    const style = $(element).attr('style');
                    if (style && style.includes('background-image')) {
                        const match = style.match(/url\((['"]?)(.*?)\1\)/);
                        if (match && match[2]) {
                            let bgImageUrl = match[2];
                            if (!bgImageUrl.startsWith('http')) {
                                bgImageUrl = url.resolve(baseUrl, bgImageUrl);
                            }
                            if (!commonUrls.includes(bgImageUrl) && !backgroundImages.includes(bgImageUrl)) {
                                backgroundImages.push(bgImageUrl);
                            }
                        }
                    }
                });

                const jsonData = {
                    url: currentUrl,
                    imageSources,
                    videoSources,
                    backgroundImages,
                };

                if (!isFirstEntry) {
                    fs.appendFileSync('output.json', ',\n', 'utf-8');
                }
                
                fs.appendFileSync('output.json', JSON.stringify(jsonData, null, 2), 'utf-8');
                isFirstEntry = false;

                processedUrls.add(currentUrl);
                console.log(`Scraped data from ${currentUrl}`);
                
            } catch (error) {
                console.error(`Error scraping ${currentUrl}:`, error.message);
                
                const errorData = {
                    url: currentUrl,
                    imageSources: [],
                    videoSources: [],
                    backgroundImages: [],
                    error: error.message
                };

                if (!isFirstEntry) {
                    fs.appendFileSync('output.json', ',\n', 'utf-8');
                }
                
                fs.appendFileSync('output.json', JSON.stringify(errorData, null, 2), 'utf-8');
                isFirstEntry = false;
                
                processedUrls.add(currentUrl);
            }
        }

        fs.appendFileSync('output.json', '\n]', 'utf-8');
        
    } catch (error) {
        console.error('Error:', error.message);
        try {
            fs.appendFileSync('output.json', '\n]', 'utf-8');
        } catch (e) {
            console.error('Error closing output file:', e.message);
        }
    }
}
// async function performUrlScraping() {
//     try {
//         const axiosResponse = await axios.request({
//             method: 'GET',
//             url: 'https://www.bebeautiful.in/sitemap.xml',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
//             },
//         });

//         const $ = cheerio.load(axiosResponse.data);
//         const urlSources = [];
        
//         $('url > loc').each((_, element) => {
//             const url = $(element).text();
//             urlSources.push(url);
//         });
        
//         fs.writeFileSync('output1.json', JSON.stringify({ urlSources }, null, 2), 'utf-8');
//         console.log('URLs have been saved to output1.json');
//     } catch (error) {
//         console.error('Error fetching sitemap:', error.message);
//     }
// }

(async () => {
    // await performUrlScraping();
    await performScraping();
})();


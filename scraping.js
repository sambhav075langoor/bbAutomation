const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const urlSources = require('./output2.json').urlSources;

// Utility function for delays
const delay = (min, max) => {
  const randomDelay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
};

// Convert main content into the specified format
const convertMainContent = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const blocks = [];

  // Recursive function to process child nodes
  const processNode = (node) => {
    if (node.type === 'text') {
      const text = $(node).text().trim();
      if (text) {
        return {
          _type: 'span',
          text,
          _key: Math.random().toString(36).substring(2, 15),
        };
      }
      return null;
    } else if (node.type === 'tag') {
      const tagName = node.tagName.toLowerCase();

      if (tagName === 'a') {
        // Handle anchor tags
        const href = $(node).attr('href');
        const text = $(node).text().trim();
        if (text) {
          return {
            _type: 'span',
            text,
            href, // Include href directly in the span
            _key: Math.random().toString(36).substring(2, 15),
          };
        }
      } else if (tagName === 'img') {
        // Handle image tags
        const src = $(node).attr('src');
        if (src) {
          return {
            _type: 'image',
            src,
            _key: Math.random().toString(36).substring(2, 15),
          };
        }
      } else if (['strong', 'b', 'em', 'i'].includes(tagName)) {
        // Handle formatting tags
        const text = $(node).text().trim();
        return {
          _type: 'span',
          text,
          style: tagName,
          _key: Math.random().toString(36).substring(2, 15),
        };
      } else if (['ul', 'ol'].includes(tagName)) {
        // Handle list tags
        const items = $(node)
          .find('li')
          .map((_, li) => {
            return {
              _type: 'listItem',
              style: 'normal',
              children: [processNode(li)],
              _key: Math.random().toString(36).substring(2, 15),
            };
          })
          .get();
        return {
          _type: tagName,
          children: items,
          _key: Math.random().toString(36).substring(2, 15),
        };
      } else if (tagName === 'br') {
        // Handle line breaks
        return {
          _type: 'span',
          text: '\n',
          _key: Math.random().toString(36).substring(2, 15),
        };
      } else if (tagName === 'div') {
        // Handle div tags recursively
        const children = $(node)
          .contents()
          .map((_, child) => processNode(child))
          .get()
          .filter(Boolean);
        return {
          _type: 'block',
          style: 'div',
          _key: Math.random().toString(36).substring(2, 15),
          children,
        };
      } else {
        // Generic handling for other tags
        const children = $(node)
          .contents()
          .map((_, child) => processNode(child))
          .get()
          .filter(Boolean);
        return {
          _type: 'block',
          style: tagName,
          _key: Math.random().toString(36).substring(2, 15),
          children,
        };
      }
    }
    return null;
  };

  // Process all main content child nodes
  $('main').contents().each((_, element) => {
    const processedNode = processNode(element);
    if (processedNode) {
      blocks.push(processedNode);
    }
  });

  return { blocks };
};

// Main scraping function
async function performScraping() {
  const processedUrls = new Set();

  try {
    fs.writeFileSync('articleData.json', '[\n', 'utf-8');
    let isFirstEntry = true;

    for (const currentUrl of urlSources) {
      if (processedUrls.has(currentUrl)) {
        continue;
      }

      try {
        // Fetch the page
        const axiosResponse = await axios.request({
          method: 'GET',
          url: currentUrl,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            TE: 'Trailers',
            Referer: currentUrl,
          },
        });

        const $ = cheerio.load(axiosResponse.data);
        const baseUrl = new URL(currentUrl).origin;

        // Scrape metadata and main content
        const title = $('head > title').text().trim();
        const description =
          $('meta[name="description"]').attr('content') || '';
        const keywords = $('meta[name="keywords"]').attr('content') || '';
        const mainContent = $('main').html() || '';

        // Convert main content into the specified format
        const { blocks } = convertMainContent(mainContent);

        // Create slug from URL
        const slug = currentUrl.replace(baseUrl, '').replace(/\/+$/, '');

        // Prepare JSON object
        const jsonData = {
          url: currentUrl,
          slug,
          metadata: {
            title,
            description,
            keywords,
          },
          mainContent: {
            blocks,
          },
        };

        // Write data to JSON file
        if (!isFirstEntry) {
          fs.appendFileSync('articleData.json', ',\n', 'utf-8');
        }
        fs.appendFileSync(
          'articleData.json',
          JSON.stringify(jsonData, null, 2),
          'utf-8'
        );
        isFirstEntry = false;

        processedUrls.add(currentUrl);
        console.log(`Scraped and structured data from ${currentUrl}`);
      } catch (error) {
        console.error(`Error scraping ${currentUrl}:`, error.message);
      }
    }

    fs.appendFileSync('articleData.json', '\n]', 'utf-8');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Main function execution
(async () => {
  await performScraping();
})();

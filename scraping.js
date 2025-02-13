const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const urlSources = require('./output2.json').urlSources;

async function scrapeArticle(html) {
    const $ = cheerio.load(html);
    let articleData = {
        title: '',
        subtitle: '', // Added subtitle
        author: '',
        date: '',
        sections: [],
        authorBio: '',
        authorImage: '', // Added author image
        mainImage: '', // Added main banner image
        tags: [], // Added tags
        breadcrumbs: [], // Added breadcrumbs
        relatedArticles: [], // Added related articles
        readingList: [] // Added "Also your vibe" section
    };

    // Extract title and subtitle
    articleData.title = $('.headline-section h1.hd1').text().trim();
    articleData.subtitle = $('.headline-section .subHd').text().trim();

    // Extract breadcrumbs
    $('.breadcrumb li').each((i, el) => {
        articleData.breadcrumbs.push($(el).text().trim());
    });

    // Extract main banner image
    const mainImage = $('.banner-wrapper img').first();
    if (mainImage.length) {
        articleData.mainImage = {
            src: mainImage.attr('src'),
            alt: mainImage.attr('alt'),
            caption: $('.banner-wrapper .img_sre').text().trim()
        };
    }

    // Extract author and date with enhanced details
    const authorBox = $('.author_box');
    articleData.author = authorBox.find('.f18i').first().text().trim();
    articleData.date = authorBox.find('.f12i span').first().text().trim();
    articleData.authorImage = authorBox.find('figure img').first().attr('src');

    // Extract tags/keywords from marquee
    $('.marquee1.hd40 strong').each((i, el) => {
        const tag = $(el).text().trim();
        if (tag && !articleData.tags.includes(tag)) {
            articleData.tags.push(tag);
        }
    });

    // Enhanced section extraction with images and formatting
    $('.art-detail-box').find('h2.f36').each((index, element) => {
        const sectionTitle = $(element).text().trim();
        const sectionContent = [];
        let currentElement = $(element).next();
        
        while (currentElement.length && !currentElement.is('h2')) {
            if (currentElement.is('figure')) {
                // Handle figure elements with captions
                const img = currentElement.find('img');
                if (img.length) {
                    sectionContent.push({
                        type: 'image',
                        src: img.attr('src'),
                        alt: img.attr('alt') || '',
                        caption: currentElement.find('figcaption').text().trim()
                    });
                }
            } else if (currentElement.is('ol, ul')) {
                // Handle ordered and unordered lists
                const listItems = [];
                currentElement.find('li').each((i, li) => {
                    listItems.push($(li).text().trim());
                });
                sectionContent.push({
                    type: 'list',
                    style: currentElement.is('ol') ? 'ordered' : 'unordered',
                    items: listItems
                });
            } else if (currentElement.is('p')) {
                // Handle paragraphs with potential strong/em formatting
                const formattedText = currentElement.html()
                    .replace(/<strong>/g, '**')
                    .replace(/<\/strong>/g, '**')
                    .replace(/<em>/g, '_')
                    .replace(/<\/em>/g, '_');
                sectionContent.push({
                    type: 'text',
                    content: formattedText.trim()
                });
            }
            currentElement = currentElement.next();
        }
        
        articleData.sections.push({
            title: sectionTitle,
            content: sectionContent
        });
    });

    // Extract author bio with enhanced details
    const authorDetail = $('.writer-detail');
    articleData.authorBio = {
        text: authorDetail.find('.MT30 p').text().trim(),
        image: authorDetail.find('figure img').attr('src'),
        name: authorDetail.find('.more-details p').first().text().trim()
    };

    // Extract related articles
    $('.read-cards .card').each((i, el) => {
        const card = $(el);
        articleData.relatedArticles.push({
            title: card.find('.card-title a').text().trim(),
            link: card.find('.card-title a').attr('href'),
            image: card.find('img').attr('src'),
            date: card.find('.info_bx span').text().trim(),
            author: card.find('.author').text().trim()
        });
    });

    return convertToMarkdown(articleData);
}

function convertToMarkdown(articleData) {
    let markdown = '';

    // Title and subtitle
    markdown += `# ${articleData.title}\n\n`;
    if (articleData.subtitle) {
        markdown += `*${articleData.subtitle}*\n\n`;
    }

    // Breadcrumbs
    markdown += `> ${articleData.breadcrumbs.join(' > ')}\n\n`;

    // Metadata
    markdown += `**Author:** ${articleData.author}\n`;
    markdown += `**Date:** ${articleData.date}\n\n`;

    // Main image
    if (articleData.mainImage?.src) {
        markdown += `![${articleData.mainImage.alt}](${articleData.mainImage.src})\n\n`;
        if (articleData.mainImage.caption) {
            markdown += `*${articleData.mainImage.caption}*\n\n`;
        }
    }

    // Tags
    if (articleData.tags.length) {
        markdown += `**Tags:** ${articleData.tags.join(', ')}\n\n`;
    }

    // Sections
    articleData.sections.forEach(section => {
        markdown += `## ${section.title}\n\n`;
        section.content.forEach(content => {
            if (content.type === 'image') {
                markdown += `![${content.alt}](${content.src})${content.caption ? `\n*${content.caption}*` : ''}\n\n`;
            } else if (content.type === 'list') {
                content.items.forEach((item, index) => {
                    markdown += content.style === 'ordered' ? 
                        `${index + 1}. ${item}\n` : 
                        `* ${item}\n`;
                });
                markdown += '\n';
            } else {
                markdown += `${content.content}\n\n`;
            }
        });
    });

    // Author bio
    markdown += `---\n\n`;
    markdown += `### About the Author\n\n`;
    if (articleData.authorBio.image) {
        markdown += `![${articleData.authorBio.name}](${articleData.authorBio.image})\n\n`;
    }
    markdown += `${articleData.authorBio.text}\n\n`;

    // Related articles
    if (articleData.relatedArticles.length) {
        markdown += `### Related Articles\n\n`;
        articleData.relatedArticles.forEach(article => {
            markdown += `- [${article.title}](${article.link}) - ${article.author} (${article.date})\n`;
        });
    }

    return markdown;
}

async function fetchAndProcessArticles() {
    let articles = [];
    for (let currentUrl of urlSources) {
        try {
            console.log(`Fetching: ${currentUrl}`);
            const axiosResponse = await axios.request({
                method: 'GET',
                url: currentUrl,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    TE: 'Trailers',
                    Referer: currentUrl,
                },
            });
            const markdown = await scrapeArticle(axiosResponse.data);
            articles.push({ url: currentUrl, content: markdown });
        } catch (error) {
            console.error(`Error fetching ${currentUrl}:`, error.message);
        }
    }

    // Save to file
    fs.writeFileSync('articleData.json', JSON.stringify(articles, null, 2));
    console.log('Scraping complete. Data saved to articleData.json');
}

fetchAndProcessArticles();
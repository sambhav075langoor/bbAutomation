import {
    wcmcommand_path,
    authorpath,
    int_crftoken,
    int_cookie,
} from "./aem_config.js";
import { promises as fs } from 'fs';

import extractAuthorInfo from "./authorAem.js";
const delay = (min, max) => {
    const randomDelay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
};

let tabId = [124888478];

async function readArticleData() {
    try {
        const data = await fs.readFile('articleData.json', 'utf8');
        const articles = JSON.parse(data);
 
        for (const article of articles) {
            if (!article || !article.url || !article.content) {
                console.warn("Skipping invalid article data:", article);
                continue;
            }
 
            const slug = article.url.split('/').pop();
            const titleMatch = article.content.match(/# (.*?)\n/);
            const title = titleMatch ? titleMatch[1] : '';
 
            const subtitleMatch = article.content.match(/# .*?\n\n\*(.*?)\*.*?Home/s);
            const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';
 
            const tagsMatch = article.content.match(/\*\*Tags:\*\* (.*?)\n/);
            const tags = tagsMatch ? tagsMatch[1].trim() : '';
 
            const dateMatch = article.content.match(/\*\*Date:\*\*\s*(\d{1,2})\s*(\w{3})\s*['''](\d{2})/);
            let formattedDate = '';
            if (dateMatch) {
                const day = dateMatch[1].padStart(2, '0');
                const month = convertMonth(dateMatch[2]);
                const year = `20${dateMatch[3]}`;
                formattedDate = `${year}-${month}-${day}`;
            }
 
            console.log("Processing article:", title);
            const { blocks, imageCount } = splitContentIntoBlocks(article.content);
            const authorInfo = extractAuthorInfo(article.content);
            await createArticleDetailFragment(slug, title);
            await addArticleDetailsContent(slug, title, subtitle, tags, blocks, authorInfo.slug, formattedDate, imageCount);
        }
    } catch (err) {
        console.error("Error reading the file:", err);
    }
}

function convertMonth(monthStr) {
    const monthMap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return monthMap[monthStr] || '01'; 
}

function splitContentIntoBlocks(content) {
    const blocks = [];
    let imageCount = 0;
    let currentBlock = '';
    
    const mainContent = content.split('### About the Author')[0];
    const contentAfterMetadata = mainContent.split(/##/)[1] ? '##' + mainContent.split(/##/).slice(1).join('##') : '';
    const lines = contentAfterMetadata.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.match(/!\[.*?\]\(.*?\)/) || line.match(/\*\*<img.*?>\*\*/)) {
            if (currentBlock.trim()) {
                blocks.push({
                    type: 'description',
                    content: formatContent(currentBlock)
                });
                currentBlock = '';
            }
            imageCount++;
            continue;
        }

        if (line.startsWith('## ')) {
            if (currentBlock.trim()) {
                blocks.push({
                    type: 'description',
                    content: formatContent(currentBlock)
                });
                currentBlock = '';
            }
            currentBlock = line + '\\n\\n';  
        } else if (line) {
            currentBlock += line + '\\n\\n';
        }
        if (i === lines.length - 1 && currentBlock.trim()) {
            blocks.push({
                type: 'description',
                content: formatContent(currentBlock)
            });
        }
    }

    return {
        blocks: blocks.filter(block => {
            if (block.type === 'description') {
                return block.content.length > 0;
            }
            return true;
        }),
        imageCount
    };
}

function formatContent(content) {
    return content
        .split(/\\n\\n|\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\\n\\n')
        .replace(/\\n\\n$/, '');  
}

async function createArticleDetailFragment(slug, title) {
    await delay(3, 5);
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath", "/content/dam/headless/bebeautiful/in-en/all-things-makeup/everyday");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/article-detail");
        formData.append("./jcr:title", slug);
        formData.append("description", "");
        formData.append("name", slug);

        const response = await fetch(wcmcommand_path, {
            method: "POST",
            headers: {
                "cookie": int_cookie,
                "csrf-token": int_crftoken,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        console.log(`Fragment created successfully for: ${slug}`);
    } catch (error) {
        console.error(`Error creating fragment for ${slug}:`, error.message);
    }
}

async function addArticleDetailsContent(slug, title, subtitle, tags, blocks, authorslug, publishDate, imageCount) {
    console.log("publishDate", publishDate);
    try {
        const formData = new FormData();
        formData.append(":type", "multiple");
        formData.append("_charset_", "utf-8");
        formData.append(":newVersion", "false");
        formData.append("slug", slug);
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("features", tags);
        formData.append("authorDetails", `/content/dam/headless/bebeautiful/in-en/authors/${authorslug}`);
        formData.append("publishDate", publishDate); 
 
        let blockCount = 1;
        let imageIndex = 0;
 
        blocks.forEach((block) => {
            if (blockCount > 20) return;
 
            if (block.type === 'description') {
                formData.append(`descriptionblock${blockCount}@ContentType`, "text/html");
 
                const formattedContent = block.content
                    .replace(/^## (.*?)\\n\\n/, '## $1\\n\\n')
                    .replace(/([^\\n])$/, '$1\\n\\n');  
                formData.append(`descriptionblock${blockCount}`, formattedContent);
                
                // Use tabId for image blocks where images were found
                if (imageIndex < imageCount) {
                    formData.append(`imagetab${blockCount}`, tabId[0].toString());
                    imageIndex++;
                } else {
                    formData.append(`imagetab${blockCount}`, String(blockCount));
                }
                blockCount++;
            }
        });
 
        while (blockCount <= 20) {
            formData.append(`descriptionblock${blockCount}@ContentType`, "text/html");
            formData.append(`descriptionblock${blockCount}`, "");
            formData.append(`imagetab${blockCount}`, String(blockCount));
            blockCount++;
        }
 
        const response = await fetch(`${authorpath}/all-things-makeup/everyday/${slug}.cfm.content.json`, {
            method: "POST",
            headers: {
                "cookie": int_cookie,
                "csrf-token": int_crftoken,
            },
            body: formData,
        });
 
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
 
        console.log(`Content updated successfully for: ${slug}`);
    } catch (error) {
        console.error(`Error updating content for ${slug}:`, error.message);
    }
}

readArticleData();
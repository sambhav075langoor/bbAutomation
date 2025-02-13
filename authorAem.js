import {
    wcmcommand_path,
    authorpath,
    int_crftoken,
    int_cookie,
} from "./aem_config.js";
import { promises as fs } from 'fs';

const delay = (min, max) => {
    const randomDelay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, randomDelay * 1000));
};

async function readArticleData() {
    try {
        const data = await fs.readFile('articleData.json', 'utf8');
        const articles = JSON.parse(data);

        for (const article of articles) {
            if (!article || !article.content) {
                console.warn("Skipping invalid article data:", article);
                continue;
            }

            const authorInfo = extractAuthorInfo(article.content);
            if (!authorInfo) {
                console.warn("No author information found in article");
                continue;
            }

            console.log("Processing author:", authorInfo.authorName);
            
            await createAuthoreDetailFragment(authorInfo);
            await updateAuthoreDetail(authorInfo);
        }
    } catch (err) {
        console.error("Error reading the file:", err);
    }
}

 export default function extractAuthorInfo(content) {
    try {
        // Extract content between "About the Author" and "Related Articles"
        const authorSection = content.split('### About the Author')[1]?.split('### Related Articles')[0]?.trim();
        if (!authorSection) return null;

        // Extract author image and name
        const imageMatch = authorSection.match(/!\[(.*?)\]\((.*?)\)/);
        if (!imageMatch) return null;

        const authorName = imageMatch[1];
        const profileImage = imageMatch[2];

        // Extract and clean author description
        // First, remove the image markdown
        let cleanedSection = authorSection.replace(/!\[.*?\]\(.*?\)/, '').trim();
        
        // Remove the repeated author name at the start
        cleanedSection = cleanedSection.replace(new RegExp(`^${authorName}${authorName}`), authorName);
        
        // Get the description part after the author name
        const descriptionMatch = cleanedSection.match(new RegExp(`${authorName}(.*?)$`, 's'));
        let authorDescription = descriptionMatch 
            ? descriptionMatch[1].trim()
            : '';

        // Prepend author name to the description
        authorDescription = `${authorName} ${authorDescription}`;

        // Create slug from author name
        const slug = authorName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        return {
            authorName,
            profileImage,
            authorDescription,
            slug
        };
    } catch (error) {
        console.error("Error extracting author information:", error);
        return null;
    }
}

async function createAuthoreDetailFragment(authorInfo) {
    await delay(3, 5);
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath", "/content/dam/headless/bebeautiful/in-en/authors");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/author");
        formData.append("./jcr:title", authorInfo.authorName);
        formData.append("description", "");
        formData.append("name", authorInfo.slug);

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

        console.log(`Fragment created successfully for: ${authorInfo.slug}`);
    } catch (error) {
        console.error(`Error creating fragment for ${authorInfo.slug}:`, error.message);
    }
}

async function updateAuthoreDetail(authorInfo) {
    try {
        const formData = new FormData();
        formData.append(":type", "multiple");
        formData.append("_charset_", "utf-8");
        formData.append(":newVersion", "false");
        formData.append("slug", authorInfo.slug);
        formData.append("authorType", "Author");
        formData.append("profileImageId", authorInfo.profileImage);
        formData.append("authorName", authorInfo.authorName);
        formData.append("authorDescription", authorInfo.authorDescription);

        const response = await fetch(`${authorpath}/authors/${authorInfo.slug}.cfm.content.json`, {
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

        console.log(`Details updated successfully for: ${authorInfo.slug}`);
    } catch (error) {
        console.error(`Error updating content for ${authorInfo.slug}:`, error.message);
    }
}

// Initialize the process
readArticleData();

//
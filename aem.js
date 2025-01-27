import { title } from "process";
import {
    wcmcommand_path,
    authorpath,
    int_crftoken,
    int_cookie,
} from "./aem_config.js";
// import articleData from "./articleData.json";

// import * as fsPromises from 'fs/promises';

// const fs = require('fs').promises;

import { promises as fs } from 'fs';

let splitResult = [];

async function readArticleData() {
    try {
      // Read the JSON file
      const data = await fs.readFile('articleData.json', 'utf8');
      const jsonData = JSON.parse(data);
  
      for (const article of jsonData) {
        const slug = article.slug; 
        const lasSlug = slug.split('/').pop();
        const title = article.metadata.title; 
        const blocks = article.mainContent;
        // console.log("jsonArray",blocks);
        // console.log("Processing Article:");
        // console.log("Title:", title);
        // console.log("Full Slug:", slug);
        // console.log("Last Slug:", lasSlug);
  
        // Call your functions for each article
        // await createArticleDetailFragment(lasSlug, title);
        // await addArticleDetailsContent(lasSlug, title);
        splitResult = splitJsonByImage(jsonArray);
      }
    } catch (err) {
      console.error("Error reading the file:", err);
    }
  }


  function splitJsonByImage(jsonArray) {
    const result = [];
    let tempArray = [];
  
    jsonArray.forEach((item) => {
      if (
        item._type === "image" ||
        item._type === "video" 
      ) {
        if (tempArray.length) {
          result.push(tempArray);
        }
        tempArray = [];
      } else {
        tempArray.push(item);
      }
    });
  
    if (tempArray.length) {
      result.push(tempArray);
    }
  
    return result;
  }
readArticleData();

// console.log("slug", slug);
export async function createBannerMediaFragment(mediaName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath","/content/dam/headless/bebeautiful/in-en/testing-grounds");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/banner-media-group");
        formData.append("./jcr:title", `${mediaName}`);
        formData.append("description","");
        formData.append("name", `${mediaName}`);
        const response = await fetch(`${wcmcommand_path}`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}
export async function createBannerTeaserGroupFragment(teaserName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath","/content/dam/headless/bebeautiful/in-en/testing-grounds");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/banner-teaser-group");
        formData.append("./jcr:title", `${teaserName}`);
        formData.append("description","");
        formData.append("name", `${teaserName}`);
        const response = await fetch(`${wcmcommand_path}`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}
export async function createBannerGroupFragment(bannerName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath","/content/dam/headless/bebeautiful/in-en/testing-grounds");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/banner-group");
        formData.append("./jcr:title", `${bannerName}`);
        formData.append("description","");
        formData.append("name", `${bannerName}`);
        const response = await fetch(`${wcmcommand_path}`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}
export async function createArticleDetailFragment(lasSlug,){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append("parentPath","/content/dam/headless/bebeautiful/in-en/testing-grounds");
        formData.append("template", "/conf/bebeautiful/settings/dam/cfm/models/article-detail");
        formData.append("./jcr:title", `${lasSlug}`);
        formData.append("description","");
        formData.append("name", `${lasSlug}`);
        const response = await fetch(`${wcmcommand_path}`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
     
    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}
export async function addBannerMediaGroupContent(mediaName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append(":newVersion", "false");
        formData.append(":type", "multiple");
        formData.append("slug","helllo");
        formData.append("mobileimageid", "hiiii");
        formData.append("mobileimagealt", "hiiii");
        formData.append("mobileimagetype","");
        formData.append("desktopimageid", "hiiii");
        formData.append("desktopimagealt", "hiiii");
        formData.append("desktopimagetype","");
        formData.append("videoid","");
        formData.append("videotype","");
        formData.append("youtubeid","");
        formData.append("imageSource", "text/html");
        formData.append("videosource", "");
        const response = await fetch(`${authorpath}/testing-grounds/${mediaName}.cfm.content.json`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}
export async function addBannerTeaserGroupContent(teaserName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append(":newVersion", "false");
        formData.append(":type", "multiple");
        formData.append("slug","helllo");
        formData.append("title", "hiiii");
        formData.append("subtitle", "hiiii");
        formData.append("description","");
        formData.append("description@ContentType", "text/html");
        formData.append("ctatext", "");
        formData.append("ctalink", "");
        formData.append("bannerteasergroup", "/content/dam/headless/bebeautiful/in-en/beginner-makeup-steps/beginner-makeup-content1");
        const response = await fetch(`${authorpath}/testing-grounds/${teaserName}.cfm.content.json`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}

export async function addBannerGroupContent(bannerName){
    try {
        const formData = new FormData();
        formData.append("_charset_", "utf-8");
        formData.append(":type", "multiple");
        formData.append(":newVersion", "false");
        formData.append("slug","helllo");
        formData.append("title", "hiiii");
        formData.append("subtitle", "hiiii");
        formData.append("description","");
        formData.append("description@ContentType", "text/html");
        formData.append("bannertype", "");
        formData.append("bannerteasergroup", "/content/dam/headless/bebeautiful/in-en/beginner-makeup-steps/beginner-makeup-content1");
        const response = await fetch(`${authorpath}/testing-grounds/${bannerName}.cfm.content.json`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error creating fragment: for fragment`, error.message);
    }
}

export async function addArticleDetailsContent(lasSlug,title){
    try {
        const formData = new FormData();
        formData.append(":type", "multiple");
        formData.append("_charset_", "utf-8");
        formData.append(":newVersion", "false");
        formData.append("slug",`${lasSlug}`);
        formData.append("title", `${title}`);
        formData.append("subtitle", "hiiii");
        formData.append("descriptionblock1@ContentType", "text/html");
        formData.append("descriptionblock1", "1");
        formData.append("imagetab1", "1");
        formData.append("descriptionblock2@ContentType", "text/html");
        formData.append("descriptionblock2", "2");
        formData.append("imagetab2", "2");
        formData.append("descriptionblock3@ContentType", "text/html");
        formData.append("descriptionblock3", "3");
        formData.append("imagetab3", "3");
        formData.append("descriptionblock4@ContentType", "text/html");
        formData.append("descriptionblock4", "");
        formData.append("imagetab4", "");
        formData.append("descriptionblock5@ContentType", "text/html");
        formData.append("descriptionblock5", "");
        formData.append("imagetab5", "");
        formData.append("descriptionblock6@ContentType", "text/html");
        formData.append("descriptionblock6", "");
        formData.append("imagetab6", "");
        formData.append("descriptionblock7@ContentType", "text/html");
        formData.append("descriptionblock7", "");
        formData.append("imagetab7", "");
        formData.append("descriptionblock8@ContentType", "text/html");
        formData.append("descriptionblock8", "");
        formData.append("imagetab8", "");
        formData.append("descriptionblock9@ContentType", "text/html");
        formData.append("descriptionblock9", "");
        formData.append("imagetab9", "");
        formData.append("descriptionblock10@ContentType", "text/html");
        formData.append("descriptionblock10", "");
        formData.append("imagetab10", "");
        // formData.append("articlebanner", `/content/dam/headless/bebeautiful/in-en/beginner-makeup-steps/${lasSlug}`);
        // formData.append("articlecontent", "/content/dam/headless/bebeautiful/in-en/beginner-makeup-steps/beginner-makeup-content1");
        const response = await fetch(`${authorpath}/testing-grounds/${lasSlug}.cfm.content.json`, {
            method: "POST",
            headers: {
                "cookie": `${int_cookie}`,
                "crsf-token": `${int_crftoken}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

    } catch (error) {
        console.error(`Error in updating creating fragment: for fragment`, error.message);
    }
}

// createBannerMediaFragment('dummy1');
// addBannerMediaGroupContent('dummy1');

// createArticleDetailFragment(slug);
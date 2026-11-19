import { access, readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../data/sites.json", import.meta.url), "utf8"));
const articleData = JSON.parse(await readFile(new URL("../data/articles.json", import.meta.url), "utf8"));
const errors = [];
const seenCategoryIds = new Set();
const seenUrls = new Map();
const requiredLocalizedFields = ["name", "description", "tags"];

const normalizeUrl = (value) => {
  const url = new URL(value);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    url.searchParams.delete(key);
  });
  url.searchParams.sort();
  return url.toString();
};

if (!Array.isArray(data.categories) || data.categories.length === 0) {
  errors.push("categories must be a non-empty array");
}

for (const [categoryIndex, category] of (data.categories || []).entries()) {
  const categoryLabel = `categories[${categoryIndex}]`;
  if (!category.id || seenCategoryIds.has(category.id)) {
    errors.push(`${categoryLabel}.id is missing or duplicated`);
  }
  seenCategoryIds.add(category.id);

  for (const language of ["zh", "en"]) {
    if (!category.name?.[language] || !category.description?.[language]) {
      errors.push(`${categoryLabel} is missing ${language} name or description`);
    }
  }

  if (!Array.isArray(category.sites)) {
    errors.push(`${categoryLabel}.sites must be an array`);
    continue;
  }

  for (const [siteIndex, site] of category.sites.entries()) {
    const siteLabel = `${categoryLabel}.sites[${siteIndex}]`;

    for (const field of requiredLocalizedFields) {
      for (const language of ["zh", "en"]) {
        const value = site[field]?.[language];
        if (field === "tags" ? !Array.isArray(value) || value.length === 0 : !value) {
          errors.push(`${siteLabel}.${field}.${language} is required`);
        }
      }
    }

    try {
      const parsed = new URL(site.url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported protocol");
      const normalized = normalizeUrl(site.url);
      if (seenUrls.has(normalized)) {
        errors.push(`${siteLabel}.url duplicates ${seenUrls.get(normalized)}`);
      } else {
        seenUrls.set(normalized, siteLabel);
      }
    } catch {
      errors.push(`${siteLabel}.url is not a valid HTTP(S) URL`);
    }

    if (site.addedAt && !/^\d{4}-\d{2}-\d{2}$/.test(site.addedAt)) {
      errors.push(`${siteLabel}.addedAt must use YYYY-MM-DD`);
    }
    if (site.sourceUrl) {
      try {
        new URL(site.sourceUrl);
      } catch {
        errors.push(`${siteLabel}.sourceUrl must be a valid URL`);
      }
    }
  }
}

const seenArticleSlugs = new Set();
for (const [articleIndex, article] of (articleData.articles || []).entries()) {
  const articleLabel = `articles[${articleIndex}]`;
  if (!article.slug || seenArticleSlugs.has(article.slug) || !/^[a-z0-9-]+$/.test(article.slug)) {
    errors.push(`${articleLabel}.slug is missing, invalid or duplicated`);
  }
  seenArticleSlugs.add(article.slug);

  if (!article.toolName || !article.toolUrl || !article.publishedAt || !article.testedAt) {
    errors.push(`${articleLabel} is missing toolName, toolUrl, publishedAt or testedAt`);
  }
  for (const language of ["zh", "en"]) {
    if (!article.title?.[language] || !article.summary?.[language]) {
      errors.push(`${articleLabel} is missing ${language} title or summary`);
    }
  }
  if (!Array.isArray(article.sections) || article.sections.length < 2) {
    errors.push(`${articleLabel}.sections must contain at least two sections`);
    continue;
  }

  let screenshotCount = 0;
  for (const [sectionIndex, section] of article.sections.entries()) {
    for (const language of ["zh", "en"]) {
      if (!section.heading?.[language] || !Array.isArray(section.paragraphs?.[language]) || section.paragraphs[language].length === 0) {
        errors.push(`${articleLabel}.sections[${sectionIndex}] is missing ${language} content`);
      }
    }
    if (section.screenshot) {
      screenshotCount += 1;
      const relativePath = section.screenshot.src.replace(/^\.\.\/\.\.\//, "");
      try {
        await access(new URL(`../${relativePath}`, import.meta.url));
      } catch {
        errors.push(`${articleLabel}.sections[${sectionIndex}] screenshot file does not exist`);
      }
      for (const language of ["zh", "en"]) {
        if (!section.screenshot.alt?.[language] || !section.screenshot.caption?.[language]) {
          errors.push(`${articleLabel}.sections[${sectionIndex}] screenshot needs ${language} alt and caption`);
        }
      }
    }
  }
  if (screenshotCount < 2) {
    errors.push(`${articleLabel} must include at least two real usage screenshots`);
  }
}

const articleSlugsUsedBySites = new Set((data.categories || []).flatMap((category) =>
  category.sites.map((site) => site.articleSlug).filter(Boolean)
));
for (const slug of articleSlugsUsedBySites) {
  if (!seenArticleSlugs.has(slug)) errors.push(`site articleSlug ${slug} has no matching article`);
}

if (errors.length > 0) {
  console.error(`Site data validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${seenUrls.size} sites, ${seenCategoryIds.size} categories and ${seenArticleSlugs.size} article(s).`);

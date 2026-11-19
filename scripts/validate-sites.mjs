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
const contentTypes = new Set(["tool", "synthesis", "supply-chain", "soho", "book", "e-bike", "marketing", "compliance", "case-study"]);
for (const [articleIndex, article] of (articleData.articles || []).entries()) {
  const articleLabel = `articles[${articleIndex}]`;
  if (!article.slug || seenArticleSlugs.has(article.slug) || !/^[a-z0-9-]+$/.test(article.slug)) {
    errors.push(`${articleLabel}.slug is missing, invalid or duplicated`);
  }
  seenArticleSlugs.add(article.slug);

  const contentType = article.contentType || "tool";
  if (!contentTypes.has(contentType)) {
    errors.push(`${articleLabel}.contentType is not supported`);
  }
  if (!article.publishedAt || (!article.testedAt && !article.verifiedAt)) {
    errors.push(`${articleLabel} is missing publishedAt or a testedAt/verifiedAt date`);
  }
  if (contentType === "tool" && (!article.toolName || !article.toolUrl || !article.testedAt)) {
    errors.push(`${articleLabel} tool articles require toolName, toolUrl and testedAt`);
  }
  if (contentType !== "tool") {
    for (const language of ["zh", "en"]) {
      if (!article.category?.[language]) errors.push(`${articleLabel}.category.${language} is required`);
    }
  }
  if (article.primaryUrl) {
    try {
      new URL(article.primaryUrl);
    } catch {
      errors.push(`${articleLabel}.primaryUrl must be a valid URL`);
    }
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
    const image = section.image || section.screenshot;
    if (image) {
      screenshotCount += 1;
      const relativePath = image.src.replace(/^\.\.\/\.\.\//, "");
      try {
        await access(new URL(`../${relativePath}`, import.meta.url));
      } catch {
        errors.push(`${articleLabel}.sections[${sectionIndex}] screenshot file does not exist`);
      }
      for (const language of ["zh", "en"]) {
        if (!image.alt?.[language] || !image.caption?.[language]) {
          errors.push(`${articleLabel}.sections[${sectionIndex}] image needs ${language} alt and caption`);
        }
      }
      if (section.image) {
        if (!new Set(["screenshot", "licensed", "public-domain"]).has(image.kind)) {
          errors.push(`${articleLabel}.sections[${sectionIndex}] image.kind must be screenshot, licensed or public-domain`);
        }
        try {
          new URL(image.sourceUrl);
        } catch {
          errors.push(`${articleLabel}.sections[${sectionIndex}] image.sourceUrl must be a valid URL`);
        }
        if (image.kind === "licensed" || image.kind === "public-domain") {
          for (const language of ["zh", "en"]) {
            if (!image.credit?.[language]) {
              errors.push(`${articleLabel}.sections[${sectionIndex}] sourced image needs ${language} credit`);
            }
          }
        }
      }
    }
  }
  if (screenshotCount < 2) {
    errors.push(`${articleLabel} must include at least two real sourced images or usage screenshots`);
  }

  if (!Array.isArray(article.sources) || article.sources.length < 2) {
    errors.push(`${articleLabel}.sources must contain at least two references`);
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

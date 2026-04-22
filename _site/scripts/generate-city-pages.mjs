import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://www.thefridgerepair.com";
const PHONE_NUMBER = "645-224-9787";

const cityPages = [
  { city: "Miami", slug: "miami" },
  { city: "Fort Lauderdale", slug: "fort-lauderdale" },
  { city: "Hollywood", slug: "hollywood" },
  { city: "Hallandale Beach", slug: "hallandale-beach" },
  { city: "Dania Beach", slug: "dania-beach" },
  { city: "Boca Raton", slug: "boca-raton" },
  { city: "Pompano Beach", slug: "pompano-beach" }
];

const repoRoot = process.cwd();
const outputDir = path.resolve(process.argv[2] || "_site");
const sourceIndexPath = path.join(repoRoot, "index.html");

function replaceOrThrow(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in the template.`);
  }

  pattern.lastIndex = 0;
  return html.replace(pattern, replacement);
}

function createCityPage(template, { city, slug }) {
  const pageUrl = `${SITE_URL}/${slug}/`;
  const title = `The Fridge Repair | Refrigerator Repair in ${city}, FL`;
  const description = `The Fridge Repair provides fast refrigerator repair in ${city}, Florida. Call ${PHONE_NUMBER} for same day or next day service availability.`;
  const keywordContent = [
    `refrigerator repair ${city}`,
    `fridge repair ${city}`,
    `same day refrigerator repair ${city}`,
    `${city} refrigerator repair`,
    `LG refrigerator repair ${city}`,
    `Samsung fridge repair ${city}`,
    `Whirlpool refrigerator repair ${city}`
  ].join(", ");
  const heroEyebrow = `${city} Refrigerator Repair`;
  const heroHeading = `${city} refrigerator repair without the wait.`;
  const heroSubcopy = `${city} homeowners and businesses can get cooling problems handled fast with simple booking, mobile-first service, and same day or next day availability when schedules allow.`;
  const jsonDescription = `Refrigerator repair service for ${city}, Florida.`;

  let page = template;

  page = replaceOrThrow(
    page,
    /<title>[\s\S]*?<\/title>/,
    `<title>${title}</title>`,
    "page title"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`,
    "meta description"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/>/,
    `<meta name="keywords" content="${keywordContent}" />`,
    "meta keywords"
  );
  page = replaceOrThrow(
    page,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${pageUrl}" />`,
    "canonical URL"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`,
    "Open Graph title"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`,
    "Open Graph description"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${pageUrl}" />`,
    "Open Graph URL"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${title}" />`,
    "Twitter title"
  );
  page = replaceOrThrow(
    page,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${description}" />`,
    "Twitter description"
  );
  page = replaceOrThrow(
    page,
    /"url":\s*"[^"]*"/,
    `"url": "${pageUrl}"`,
    "JSON-LD URL"
  );
  page = replaceOrThrow(
    page,
    /"areaServed":\s*\[[\s\S]*?\],/,
    `"areaServed": ["${city}, FL"],`,
    "JSON-LD area served"
  );
  page = replaceOrThrow(
    page,
    /"description":\s*"[^"]*"/,
    `"description": "${jsonDescription}"`,
    "JSON-LD description"
  );
  page = replaceOrThrow(
    page,
    /<p class="eyebrow">South Florida Refrigerator Repair<\/p>/,
    `<p class="eyebrow">${heroEyebrow}</p>`,
    "hero eyebrow"
  );
  page = replaceOrThrow(
    page,
    /<h1>South Florida refrigerator repair without the wait\.<\/h1>/,
    `<h1>${heroHeading}</h1>`,
    "hero heading"
  );
  page = replaceOrThrow(
    page,
    /<p class="subcopy">[\s\S]*?<\/p>/,
    `<p class="subcopy">The Fridge Repair helps ${heroSubcopy}</p>`,
    "hero subcopy"
  );

  return page;
}

function createSitemap(dateStamp) {
  const urls = [
    `${SITE_URL}/`,
    ...cityPages.map(({ slug }) => `${SITE_URL}/${slug}/`)
  ];

  const entries = urls
    .map(
      (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${dateStamp}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === `${SITE_URL}/` ? "1.0" : "0.9"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

async function main() {
  const template = await fs.readFile(sourceIndexPath, "utf8");
  const dateStamp = new Date().toISOString().slice(0, 10);

  await Promise.all(
    cityPages.map(async (cityPage) => {
      const cityDir = path.join(outputDir, cityPage.slug);
      await fs.mkdir(cityDir, { recursive: true });
      const cityHtml = createCityPage(template, cityPage);
      await fs.writeFile(path.join(cityDir, "index.html"), cityHtml);
    })
  );

  await fs.writeFile(path.join(outputDir, "sitemap.xml"), createSitemap(dateStamp));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

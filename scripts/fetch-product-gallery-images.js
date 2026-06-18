/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const dataPath = path.join(rootDir, 'app', 'data.ts');
const sourcesPath = path.join(rootDir, 'public', 'products', 'sources.json');
const galleryDir = path.join(rootDir, 'public', 'products', 'gallery');
const targetCategories = new Set(['racket', 'shoes', 'bag', 'backpack']);
const maxGalleryImages = 4;
const productIdFilter = new Set(
  (process.env.PRODUCT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);
const pageOverrides = {
  p3: 'https://www.badmintonplaza.com/product_info.php?cPath=62_104_174&language=en&products_id=4507',
  p5: 'https://e78.us/products/axforce-cannon-%E5%B0%8F%E9%8B%BC%E7%82%AE-black',
  p9: 'https://world-champ.com.sg/products/k520pro-4u',
  p15: 'https://galaxysports.my/product/victor-racket-backpack-badminton-bag-br6013',
  p20: 'https://badmintondirect.com/products/2023-victor-sh970-ace-m-unisex-performance-badminton-shoes',
  p24: 'https://badmintonhq.co.uk/products/li-ning-halbertec-8000-4u-badminton-racket-capri-breeze-neon-iridescent-pink',
  p25: 'https://www.badmintonalley.com/Yonex_ArcSaber_11_Play_4UG5_Badminton_Racket_p/racket-yonex-arc11play-4ug5-gp.htm',
  p30: 'https://www.shopnings.com/li-ning-saga-lite-men-s-professional-badminton-shoes/',
  p44: 'https://www.e1981.com/product-2785.html',
  p45: 'https://www.badmintonplanet.eu/yonex-pro-backpack-92412bex-sand-beige',
  p46: 'https://www.victorsport.com/product/br8009-dc'
};

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const blockedPatterns = [
  /logo/i,
  /icon/i,
  /favicon/i,
  /placeholder/i,
  /loading/i,
  /sprite/i,
  /banner/i,
  /payment/i
];

function findProductsArray(source) {
  const markerIndex = source.indexOf('export const PRODUCTS');
  const assignmentIndex = source.indexOf('=', markerIndex);
  const start = source.indexOf('[', assignmentIndex);

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return { start, end: i };
  }

  throw new Error('Could not locate PRODUCTS array.');
}

function parseProductBlocks(source) {
  const { start, end } = findProductsArray(source);
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = start + 1; i < end; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) inString = false;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{') {
      if (depth === 0) blockStart = i;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0 && blockStart !== -1) {
        blocks.push({ start: blockStart, end: i + 1, text: source.slice(blockStart, i + 1) });
        blockStart = -1;
      }
    }
  }

  return blocks;
}

function getStringProperty(block, property) {
  const match = block.match(new RegExp(`${property}:\\s*'([^']+)'`));
  return match ? match[1] : undefined;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/');
}

function normalizeImageUrl(rawUrl, pageUrl) {
  if (!rawUrl) return undefined;

  let value = decodeEntities(rawUrl.trim());
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return undefined;

  value = value.split(/\s+/)[0];
  value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');

  if (value.startsWith('//')) value = `https:${value}`;

  try {
    return new URL(value, pageUrl).toString();
  } catch {
    return undefined;
  }
}

function looksLikeProductImage(url) {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return imageExtensions.some((extension) => cleanUrl.endsWith(extension))
    && !blockedPatterns.some((pattern) => pattern.test(url));
}

function scoreImageUrl(url, sourceImage) {
  let score = 0;
  const lower = url.toLowerCase();

  if (/cdn|shop|product|products|files|image|upload|media/.test(lower)) score += 4;
  if (/1200|1000|1024|900|800|large|xl|zoom|full/.test(lower)) score += 3;
  if (/thumb|small|compact|preview|avatar|crop=/.test(lower)) score -= 3;
  if (sourceImage && stripImageSize(url) === stripImageSize(sourceImage)) score -= 8;

  return score;
}

function stripImageSize(url) {
  return url
    .split('?')[0]
    .replace(/_[0-9]+x[0-9]+(?=\.)/i, '')
    .replace(/_[0-9]+x(?=\.)/i, '')
    .replace(/-[0-9]+x[0-9]+(?=\.)/i, '');
}

function collectImageCandidates(html, pageUrl, sourceImage) {
  const found = new Map();
  const patterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|og:image:secure_url)["'][^>]+content=["']([^"']+)["']/gi,
    /<img[^>]+(?:src|data-src|data-original|data-zoom|data-image)=["']([^"']+)["']/gi,
    /<source[^>]+srcset=["']([^"']+)["']/gi,
    /(?:srcset|data-srcset)=["']([^"']+)["']/gi,
    /"((?:https?:)?\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi,
    /'((?:https?:)?\/\/[^']+\.(?:jpg|jpeg|png|webp)(?:\?[^']*)?)'/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) {
      const values = match[1].split(',');
      for (const value of values) {
        const normalized = normalizeImageUrl(value, pageUrl);
        if (!normalized || !looksLikeProductImage(normalized)) continue;
        const key = stripImageSize(normalized);
        const score = scoreImageUrl(normalized, sourceImage);
        if (!found.has(key) || found.get(key).score < score) {
          found.set(key, { url: normalized, score });
        }
      }
    }
  }

  if (sourceImage) {
    const normalizedSource = normalizeImageUrl(sourceImage, pageUrl);
    if (normalizedSource) found.delete(stripImageSize(normalizedSource));
  }

  return [...found.values()]
    .sort((a, b) => b.score - a.score)
    .map((item) => item.url);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml',
      'accept-language': 'vi,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
    }
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'referer': new URL(url).origin,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
    }
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function saveCandidate(productId, index, imageUrl) {
  const buffer = await fetchBuffer(imageUrl);
  const metadata = await sharp(buffer).metadata();
  const minEdge = Math.min(metadata.width ?? 0, metadata.height ?? 0);

  if (minEdge < 180) {
    throw new Error(`image too small (${metadata.width}x${metadata.height})`);
  }

  const fileName = `${productId}-gallery-${index}.webp`;
  const outputPath = path.join(galleryDir, fileName);
  await sharp(buffer)
    .rotate()
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: '#ffffff' })
    .webp({ quality: 90 })
    .toFile(outputPath);

  return `/products/gallery/${fileName}`;
}

function replaceGalleryImages(block, gallery) {
  const galleryText = `galleryImages: [${gallery.map((image) => `'${image}'`).join(', ')}]`;

  if (/galleryImages:\s*\[[\s\S]*?\],?/.test(block)) {
    return block.replace(/galleryImages:\s*\[[\s\S]*?\],?/, `${galleryText},`);
  }

  const imageUrlMatch = block.match(/\n(\s*)imageUrl:\s*'[^']+',?/);
  if (!imageUrlMatch) return block;

  const indent = imageUrlMatch[1];
  return block.replace(imageUrlMatch[0], `${imageUrlMatch[0]}\n${indent}${galleryText},`);
}

async function main() {
  fs.mkdirSync(galleryDir, { recursive: true });

  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
  const dataSource = fs.readFileSync(dataPath, 'utf8');
  const blocks = parseProductBlocks(dataSource);
  const replacements = new Map();
  const report = [];

  for (const block of blocks) {
    const id = getStringProperty(block.text, 'id');
    const category = getStringProperty(block.text, 'category');
    const source = sources[id];

    if (!id || !category || !targetCategories.has(category) || !source?.page) continue;
    if (productIdFilter.size > 0 && !productIdFilter.has(id)) continue;

    try {
      const page = pageOverrides[id] ?? source.page;
      const html = await fetchText(page);
      const candidates = collectImageCandidates(html, page, source.image);
      const gallery = [];

      for (const candidate of candidates) {
        if (gallery.length >= maxGalleryImages) break;

        try {
          const localPath = await saveCandidate(id, gallery.length + 1, candidate);
          gallery.push(localPath);
        } catch (error) {
          console.warn(`Skip image for ${id}: ${candidate} (${error.message})`);
        }
      }

      if (gallery.length > 0) {
        replacements.set(block.start, {
          ...block,
          text: replaceGalleryImages(block.text, gallery)
        });
      }

      report.push({ id, page, images: gallery.length });
      console.log(`${id}: ${gallery.length} images`);
    } catch (error) {
      const page = pageOverrides[id] ?? source.page;
      report.push({ id, page, images: 0, error: error.message });
      console.warn(`${id}: ${error.message}`);
    }
  }

  let updated = '';
  let cursor = 0;
  for (const block of blocks) {
    const replacement = replacements.get(block.start);
    if (!replacement) continue;
    updated += dataSource.slice(cursor, block.start);
    updated += replacement.text;
    cursor = block.end;
  }
  updated += dataSource.slice(cursor);

  fs.writeFileSync(dataPath, updated, 'utf8');
  fs.writeFileSync(
    path.join(galleryDir, 'sources-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

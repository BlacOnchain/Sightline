import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #D9E2D5; }
      .sheet { fill: #EADFC8; stroke: #AFBFAA; stroke-width: 1.5; }
      .ink { fill: #18271F; font-family: Georgia, serif; }
      .sans { fill: #18271F; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .muted { fill: #4A5D52; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .accent { fill: #1F4A3B; }
      .highlight { fill: #F0D874; }
      .clay { fill: #A3441C; }
    </style>
  </defs>

  <!-- Background Canvas: Sage Mist #D9E2D5 -->
  <rect width="1200" height="630" class="bg" />

  <!-- Outer frame border with subtle margin in Surface #E5ECE1 -->
  <rect x="48" y="48" width="1104" height="534" fill="#E5ECE1" stroke="#AFBFAA" stroke-width="1.5" rx="4" />

  <!-- Top Masthead inside frame -->
  <g transform="translate(88, 88)">
    <!-- Wordmark Logo -->
    <g transform="translate(0, 0)">
      <line x1="0" y1="20" x2="24" y2="20" stroke="#4A5D52" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="0" y1="20" x2="17" y2="7" stroke="#1F4A3B" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="18" cy="6" r="3.5" fill="#1F4A3B"/>
      <text x="36" y="20" class="ink" font-size="28" font-weight="600" letter-spacing="-0.02em">Sightline</text>
    </g>

    <!-- Subtitle -->
    <text x="180" y="19" class="muted" font-size="14">Weekly brand briefs for conversational search</text>
  </g>

  <!-- Divider line -->
  <line x1="88" y1="130" x2="1112" y2="130" stroke="#AFBFAA" stroke-width="1" />

  <!-- Main Headline in Newsreader / Serif -->
  <g transform="translate(88, 210)">
    <text x="0" y="0" class="ink" font-size="52" font-weight="600" letter-spacing="-0.02em">When someone asks an AI</text>
    <text x="0" y="66" class="ink" font-size="52" font-weight="600" letter-spacing="-0.02em">about your category,</text>
    <text x="0" y="132" class="ink" font-size="52" font-weight="600" letter-spacing="-0.02em">are you in the answer?</text>

    <!-- Supporting subtitle -->
    <text x="0" y="195" class="muted" font-size="20">Sightline tracks when your brand is named, in what order, and which</text>
    <text x="0" y="225" class="muted" font-size="20">sources are cited across search-grounded queries.</text>
  </g>

  <!-- Right Paper Card with Warm Sand Sheet (#EADFC8) & Pen Marker Highlight -->
  <g transform="translate(730, 180) rotate(1.5)">
    <!-- Sheet shadow & body in warm sand #EADFC8 -->
    <rect x="0" y="0" width="370" height="280" fill="#CDD8C8" rx="3" opacity="0.4" transform="translate(3, 4)" />
    <rect x="0" y="0" width="370" height="280" fill="#EADFC8" stroke="#AFBFAA" stroke-width="1.5" rx="3" />

    <!-- Sheet Header -->
    <g transform="translate(24, 28)">
      <text x="0" y="0" class="muted" font-size="11">QUESTION EVALUATION</text>
      <text x="0" y="20" class="sans" font-size="14" font-weight="600">"apps that help kids learn before they play"</text>
    </g>

    <!-- Line divider -->
    <line x1="24" y1="65" x2="346" y2="65" stroke="#AFBFAA" stroke-width="1" />

    <!-- Sheet Answer Content -->
    <g transform="translate(24, 92)">
      <text x="0" y="0" class="muted" font-size="13">Among popular learning tools,</text>
      
      <!-- Highlight 1: Northwind Kids -->
      <rect x="0" y="12" width="128" height="20" class="highlight" rx="2" />
      <text x="4" y="27" class="sans" font-size="13" font-weight="600" fill="#18271F">Northwind Kids¹</text>
      <text x="134" y="27" class="muted" font-size="13">locks entertainment</text>

      <text x="0" y="52" class="muted" font-size="13">until lessons are finished. Other options include</text>

      <!-- Highlight 2: Bright Steps -->
      <rect x="0" y="64" width="98" height="20" class="highlight" rx="2" />
      <text x="4" y="79" class="sans" font-size="13" font-weight="600" fill="#18271F">Bright Steps²</text>
      <text x="104" y="79" class="muted" font-size="13">and Little Lantern.</text>
    </g>

    <!-- Margin note -->
    <g transform="translate(24, 215)">
      <rect x="0" y="0" width="322" height="42" fill="#E5ECE1" stroke="#AFBFAA" stroke-width="1" rx="3" />
      <circle cx="14" cy="21" r="3.5" fill="#1F4A3B" />
      <text x="26" y="18" class="sans" font-size="11" font-weight="600" fill="#1F4A3B">Position #1: Northwind Kids</text>
      <text x="26" y="32" class="muted" font-size="10">Ranked first in 9 of 12 evaluations this period</text>
    </g>
  </g>

  <!-- Bottom Footer Line -->
  <g transform="translate(88, 545)">
    <text x="0" y="0" class="muted" font-size="13">Sightline · Grounded Brand Visibility · Powered by Gemini Search Grounding</text>
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath);

  console.log(`Generated OG Image at ${outPath} (1200x630)`);
}

generate().catch(console.error);

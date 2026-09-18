const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const items = [
  {
    filename: 'jumper_maroon.svg',
    title: 'V-Neck Maroon Jumper',
    bg: '#450a0a',
    accent: '#dc2626',
    draw: `<path d="M 180 160 L 250 160 L 300 250 L 350 160 L 420 160 L 460 280 L 420 460 L 180 460 L 140 280 Z" fill="#881337" stroke="#e11d48" stroke-width="4"/>`
  },
  {
    filename: 'skirt_pleated.svg',
    title: 'Navy Pleated Skirt',
    bg: '#0f172a',
    accent: '#38bdf8',
    draw: `<path d="M 220 180 L 380 180 L 440 460 L 160 460 Z" fill="#1e293b" stroke="#0284c7" stroke-width="4"/><line x1="260" y1="180" x2="230" y2="460" stroke="#0284c7" stroke-width="2"/><line x1="300" y1="180" x2="300" y2="460" stroke="#0284c7" stroke-width="2"/><line x1="340" y1="180" x2="370" y2="460" stroke="#0284c7" stroke-width="2"/>`
  },
  {
    filename: 'trousers_grey.svg',
    title: 'Charcoal Grey Trousers',
    bg: '#18181b',
    accent: '#a1a1aa',
    draw: `<path d="M 220 160 L 380 160 L 370 480 L 310 480 L 300 280 L 290 480 L 230 480 Z" fill="#3f3f46" stroke="#71717a" stroke-width="4"/>`
  },
  {
    filename: 'pe_shirt.svg',
    title: 'House PE Kit Polo',
    bg: '#064e3b',
    accent: '#34d399',
    draw: `<path d="M 160 160 L 240 160 L 300 210 L 360 160 L 440 160 L 470 260 L 410 260 L 410 460 L 190 460 L 190 260 L 130 260 Z" fill="#047857" stroke="#10b981" stroke-width="4"/>`
  },
  {
    filename: 'school_tie.svg',
    title: 'DGS Striped School Tie',
    bg: '#1e1b4b',
    accent: '#818cf8',
    draw: `<path d="M 270 140 L 330 140 L 340 180 L 300 200 L 260 180 Z" fill="#312e81"/><path d="M 270 200 L 330 200 L 350 420 L 300 480 L 250 420 Z" fill="#3730a3" stroke="#6366f1" stroke-width="4"/><line x1="260" y1="240" x2="340" y2="280" stroke="#fbbf24" stroke-width="8"/><line x1="260" y1="320" x2="340" y2="360" stroke="#fbbf24" stroke-width="8"/>`
  },
  {
    filename: 'school_shoes.svg',
    title: 'Black Leather School Shoes',
    bg: '#18181b',
    accent: '#e4e4e7',
    draw: `<path d="M 140 320 C 140 260 260 250 320 280 C 380 290 460 320 460 380 C 460 410 400 420 320 420 C 200 420 140 400 140 320 Z" fill="#27272a" stroke="#52525b" stroke-width="4"/><rect x="140" y="390" width="100" height="30" fill="#09090b"/>`
  },
  {
    filename: 'winter_coat.svg',
    title: 'Padded Waterproof Winter Coat',
    bg: '#0f172a',
    accent: '#64748b',
    draw: `<path d="M 160 140 L 440 140 L 470 260 L 420 260 L 420 480 L 180 480 L 180 260 L 130 260 Z" fill="#1e293b" stroke="#475569" stroke-width="4"/><line x1="300" y1="140" x2="300" y2="480" stroke="#e2e8f0" stroke-width="4"/>`
  }
];

items.forEach(item => {
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#0f172a"/>
  <rect x="50" y="50" width="500" height="500" rx="16" fill="${item.bg}"/>
  ${item.draw}
  <text x="300" y="540" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f8fafc" text-anchor="middle">${item.title}</text>
</svg>`;
  fs.writeFileSync(path.join(dir, item.filename), content);
});

console.log('Sample SVGs generated successfully!');

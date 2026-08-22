// Self-contained professional vector SVG avatar illustrations for Indian HRMS dataset
// Designed specifically for Dayflow HRMS (Odoo x NMIT Hackathon)

const svgToDataUri = (svgString) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.replace(/\s+/g, ' ').trim())}`;
};

// 1. Priya Iyer - HR Manager & People Ops Lead (Professional Woman, Hair Bun, Gold Studs, Corporate Blazer)
const priyaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="priyaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
    <linearGradient id="priyaBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#priyaBg)" />
  <circle cx="70" cy="30" r="18" fill="#1e1b4b" /> <!-- Hair Bun -->
  <!-- Shoulders / Blazer -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#priyaBlazer)" />
  <!-- Inner Blouse -->
  <polygon points="70,92 56,120 84,120" fill="#e0e7ff" />
  <polygon points="70,105 62,140 78,140" fill="#c7d2fe" />
  <!-- Neck -->
  <rect x="62" y="72" width="16" height="22" rx="4" fill="#d97706" fill-opacity="0.3" />
  <rect x="62" y="70" width="16" height="22" rx="4" fill="#e5a87b" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="24" fill="#e5a87b" />
  <!-- Hair Front -->
  <path d="M50 48 C50 32, 60 26, 70 26 C80 26, 90 32, 90 48 C85 40, 77 36, 70 36 C63 36, 55 40, 50 48 Z" fill="#1e1b4b" />
  <!-- Gold Bindi -->
  <circle cx="70" cy="48" r="1.5" fill="#f59e0b" />
  <!-- Eyes -->
  <ellipse cx="62" cy="54" rx="2.5" ry="3" fill="#1e1b4b" />
  <ellipse cx="78" cy="54" rx="2.5" ry="3" fill="#1e1b4b" />
  <circle cx="63" cy="53" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="53" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M58 48 Q62 46, 66 48" stroke="#1e1b4b" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <path d="M74 48 Q78 46, 82 48" stroke="#1e1b4b" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 54 L69 61 L72 61" stroke="#c27848" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 66 Q70 71, 76 66" stroke="#b91c1c" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- Gold Earrings -->
  <circle cx="49" cy="58" r="2.5" fill="#fbbf24" stroke="#d97706" stroke-width="0.8" />
  <circle cx="91" cy="58" r="2.5" fill="#fbbf24" stroke="#d97706" stroke-width="0.8" />
  <!-- Glasses -->
  <rect x="55" y="50" width="13" height="9" rx="3" fill="none" stroke="#fbbf24" stroke-width="1.2" />
  <rect x="72" y="50" width="13" height="9" rx="3" fill="none" stroke="#fbbf24" stroke-width="1.2" />
  <line x1="68" y1="54" x2="72" y2="54" stroke="#fbbf24" stroke-width="1.2" />
</svg>
`;

// 2. Ananya Sharma - Senior Fullstack Engineer (Tech Professional, Modern Hairstyle, Smart Glasses, Teal Tech Jacket)
const ananyaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="ananyaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
    <linearGradient id="ananyaJacket" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#134e4a" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#ananyaBg)" />
  <!-- Long Side Hair Back -->
  <path d="M44 45 C44 75, 42 95, 48 110 C52 95, 52 75, 52 45 Z" fill="#18181b" />
  <path d="M96 45 C96 75, 98 95, 92 110 C88 95, 88 75, 88 45 Z" fill="#18181b" />
  <!-- Body/Jacket -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#ananyaJacket)" />
  <polygon points="70,92 58,140 82,140" fill="#2dd4bf" />
  <polygon points="70,105 64,140 76,140" fill="#ccfbf1" />
  <!-- Neck -->
  <rect x="62" y="70" width="16" height="22" rx="4" fill="#e8af84" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="23" fill="#e8af84" />
  <!-- Hair Top & Side Waves -->
  <path d="M46 52 C44 32, 55 24, 70 24 C85 24, 96 32, 94 52 C88 38, 80 34, 70 34 C60 34, 52 38, 46 52 Z" fill="#18181b" />
  <!-- Eyes -->
  <ellipse cx="62" cy="54" rx="2.5" ry="3" fill="#18181b" />
  <ellipse cx="78" cy="54" rx="2.5" ry="3" fill="#18181b" />
  <circle cx="63" cy="53" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="53" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M58 48 Q62 46, 66 48" stroke="#18181b" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <path d="M74 48 Q78 46, 82 48" stroke="#18181b" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 54 L69 61 L72 61" stroke="#c27848" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 66 Q70 71, 76 66" stroke="#be123c" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- Stylish Modern Glasses (Teal frames) -->
  <rect x="54" y="49" width="14" height="10" rx="3" fill="none" stroke="#2dd4bf" stroke-width="1.4" />
  <rect x="72" y="49" width="14" height="10" rx="3" fill="none" stroke="#2dd4bf" stroke-width="1.4" />
  <line x1="68" y1="54" x2="72" y2="54" stroke="#2dd4bf" stroke-width="1.4" />
</svg>
`;

// 3. Rohan Nair - Lead UI/UX Designer (Creative Designer, Styled Pompadour Hair, Trimmed Stubble, Purple Designer Shirt)
const rohanSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="rohanBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" color="#6d28d9" />
    </linearGradient>
    <linearGradient id="rohanShirt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4c1d95" />
      <stop offset="100%" stop-color="#2e1065" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#rohanBg)" />
  <!-- Body/Shirt -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#rohanShirt)" />
  <!-- Collar -->
  <polygon points="70,96 58,116 70,112" fill="#c4b5fd" />
  <polygon points="70,96 82,116 70,112" fill="#ddd6fe" />
  <!-- Neck -->
  <rect x="61" y="70" width="18" height="24" rx="4" fill="#dfa579" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="24" fill="#dfa579" />
  <!-- Trimmed Beard & Stubble -->
  <path d="M52 56 C52 74, 58 82, 70 82 C82 82, 88 74, 88 56 C88 64, 82 76, 70 76 C58 76, 52 64, 52 56 Z" fill="#27272a" fill-opacity="0.8" />
  <!-- Modern Hairstyle (Pompadour) -->
  <path d="M48 48 C44 26, 60 18, 72 18 C86 18, 94 28, 92 48 C88 34, 80 28, 70 28 C60 28, 52 34, 48 48 Z" fill="#27272a" />
  <!-- Eyes -->
  <ellipse cx="62" cy="52" rx="2.5" ry="3" fill="#18181b" />
  <ellipse cx="78" cy="52" rx="2.5" ry="3" fill="#18181b" />
  <circle cx="63" cy="51" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="51" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M57 46 Q62 44, 67 46" stroke="#18181b" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <path d="M73 46 Q78 44, 83 46" stroke="#18181b" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 51 L69 59 L72 59" stroke="#b87a4c" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 66 Q70 71, 76 66" stroke="#27272a" stroke-width="1.8" fill="none" stroke-linecap="round" />
</svg>
`;

// 4. Arjun Menon - Director of Marketing (Corporate Executive, Short Trimmed Hair, Navy Suit & Burgundy Tie)
const arjunSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="arjunBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="arjunSuit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#arjunBg)" />
  <!-- Body/Suit -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#arjunSuit)" />
  <!-- White Shirt V -->
  <polygon points="70,92 56,125 84,125" fill="#ffffff" />
  <!-- Red/Burgundy Tie -->
  <polygon points="70,96 66,140 74,140" fill="#991b1b" />
  <polygon points="68,94 72,94 73,100 67,100" fill="#b91c1c" />
  <!-- Neck -->
  <rect x="61" y="70" width="18" height="24" rx="4" fill="#dfa579" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="24" fill="#dfa579" />
  <!-- Corporate Side-Part Hair -->
  <path d="M48 46 C46 28, 58 20, 72 20 C86 20, 94 28, 92 46 C88 32, 78 28, 68 28 C58 28, 52 34, 48 46 Z" fill="#1c1917" />
  <!-- Eyes -->
  <ellipse cx="62" cy="52" rx="2.5" ry="3" fill="#1c1917" />
  <ellipse cx="78" cy="52" rx="2.5" ry="3" fill="#1c1917" />
  <circle cx="63" cy="51" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="51" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M57 45 Q62 43, 67 45" stroke="#1c1917" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <path d="M73 45 Q78 43, 83 45" stroke="#1c1917" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 51 L69 60 L72 60" stroke="#b87a4c" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 67 Q70 72, 76 67" stroke="#1c1917" stroke-width="1.8" fill="none" stroke-linecap="round" />
</svg>
`;

// 5. Sneha Kulkarni - Financial Controller (Elegant Finance Leader, Saree/Blazer, Pearl Earrings)
const snehaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="snehaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="snehaBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#172554" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#snehaBg)" />
  <!-- Hair Behind Shoulders -->
  <path d="M46 50 C44 75, 42 100, 48 115 C52 100, 52 75, 52 50 Z" fill="#0f172a" />
  <path d="M94 50 C96 75, 98 100, 92 115 C88 100, 88 75, 88 50 Z" fill="#0f172a" />
  <!-- Body/Blazer -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#snehaBlazer)" />
  <polygon points="70,92 56,120 84,120" fill="#f8fafc" />
  <polygon points="70,105 62,140 78,140" fill="#bae6fd" />
  <!-- Neck -->
  <rect x="62" y="70" width="16" height="22" rx="4" fill="#e2a77e" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="23" fill="#e2a77e" />
  <!-- Sleek Hair Top -->
  <path d="M48 50 C46 30, 56 24, 70 24 C84 24, 94 30, 92 50 C86 36, 78 32, 70 32 C62 32, 54 36, 48 50 Z" fill="#0f172a" />
  <!-- Bindi -->
  <circle cx="70" cy="47" r="1.3" fill="#991b1b" />
  <!-- Eyes -->
  <ellipse cx="62" cy="53" rx="2.5" ry="3" fill="#0f172a" />
  <ellipse cx="78" cy="53" rx="2.5" ry="3" fill="#0f172a" />
  <circle cx="63" cy="52" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="52" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M58 47 Q62 45, 66 47" stroke="#0f172a" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <path d="M74 47 Q78 45, 82 47" stroke="#0f172a" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 53 L69 60 L72 60" stroke="#bf7545" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 66 Q70 71, 76 66" stroke="#991b1b" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <!-- Pearl Earrings -->
  <circle cx="49" cy="57" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8" />
  <circle cx="91" cy="57" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8" />
</svg>
`;

// 6. Karthik Reddy - Senior DevOps Engineer (Cloud Tech Engineer, Fade Haircut, Trimmed Stubble, Polo Shirt)
const karthikSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <defs>
    <linearGradient id="karthikBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="karthikPolo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="140" height="140" rx="36" fill="url(#karthikBg)" />
  <!-- Body/Polo -->
  <path d="M22 140 C22 102, 45 92, 70 92 C95 92, 118 102, 118 140 Z" fill="url(#karthikPolo)" />
  <polygon points="70,96 58,114 70,110" fill="#93c5fd" />
  <polygon points="70,96 82,114 70,110" fill="#bfdbfe" />
  <!-- Neck -->
  <rect x="61" y="70" width="18" height="24" rx="4" fill="#dfa579" />
  <!-- Face -->
  <ellipse cx="70" cy="56" rx="20" ry="24" fill="#dfa579" />
  <!-- Stubble -->
  <path d="M52 56 C52 74, 58 82, 70 82 C82 82, 88 74, 88 56 C88 64, 82 76, 70 76 C58 76, 52 64, 52 56 Z" fill="#18181b" fill-opacity="0.85" />
  <!-- Modern Fade Hair -->
  <path d="M49 46 C48 26, 58 20, 70 20 C82 20, 92 26, 91 46 C87 32, 79 26, 70 26 C61 26, 53 32, 49 46 Z" fill="#18181b" />
  <!-- Eyes -->
  <ellipse cx="62" cy="52" rx="2.5" ry="3" fill="#18181b" />
  <ellipse cx="78" cy="52" rx="2.5" ry="3" fill="#18181b" />
  <circle cx="63" cy="51" r="0.8" fill="#ffffff" />
  <circle cx="79" cy="51" r="0.8" fill="#ffffff" />
  <!-- Eyebrows -->
  <path d="M57 45 Q62 43, 67 45" stroke="#18181b" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <path d="M73 45 Q78 43, 83 45" stroke="#18181b" stroke-width="1.4" fill="none" stroke-linecap="round" />
  <!-- Nose & Smile -->
  <path d="M70 51 L69 59 L72 59" stroke="#b87a4c" stroke-width="1" fill="none" stroke-linecap="round" />
  <path d="M64 66 Q70 71, 76 66" stroke="#18181b" stroke-width="1.8" fill="none" stroke-linecap="round" />
</svg>
`;

// 7. Generic / Alternate Professional Avatar Generator
const generateGenericAvatar = (name = 'Dayflow Team') => {
  const charCode = name.charCodeAt(0) || 65;
  // Alternate between distinct male and female professional vector designs
  if (charCode % 2 === 0) {
    return svgToDataUri(ananyaSvg);
  }
  return svgToDataUri(rohanSvg);
};

const demoAvatars = {
  priya: svgToDataUri(priyaSvg),
  ananya: svgToDataUri(ananyaSvg),
  rohan: svgToDataUri(rohanSvg),
  arjun: svgToDataUri(arjunSvg),
  sneha: svgToDataUri(snehaSvg),
  karthik: svgToDataUri(karthikSvg),
  generic: (name) => generateGenericAvatar(name),
};

module.exports = demoAvatars;

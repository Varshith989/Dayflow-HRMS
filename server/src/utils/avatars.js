// Self-contained professional SVG avatar data URIs for Indian demo dataset

const generateSvgAvatar = (bgGradientStart, bgGradientEnd, initials, accentColor = '#ffffff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradientStart}" />
        <stop offset="100%" stop-color="${bgGradientEnd}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="28" fill="url(#grad)" />
    <circle cx="60" cy="46" r="22" fill="${accentColor}" fill-opacity="0.25" />
    <path d="M26 100 C26 78, 42 70, 60 70 C78 70, 94 78, 94 100 Z" fill="${accentColor}" fill-opacity="0.25" />
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const demoAvatars = {
  priya: generateSvgAvatar('#7c3aed', '#4f46e5', 'PI', '#c4b5fd'),
  ananya: generateSvgAvatar('#059669', '#0d9488', 'AS', '#6ee7b7'),
  rohan: generateSvgAvatar('#9333ea', '#db2777', 'RN', '#f472b6'),
  arjun: generateSvgAvatar('#d97706', '#ea580c', 'AM', '#fcd34d'),
  sneha: generateSvgAvatar('#0284c7', '#2563eb', 'SK', '#7dd3fc'),
  karthik: generateSvgAvatar('#4f46e5', '#3b82f6', 'KR', '#93c5fd'),
  generic: (initials = 'DF') => generateSvgAvatar('#6366f1', '#8b5cf6', initials, '#ffffff'),
};

module.exports = demoAvatars;

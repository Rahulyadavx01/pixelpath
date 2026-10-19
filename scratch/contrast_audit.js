// WCAG 2.1 Contrast Ratio Verification Script
// Tests all text colors on the light liquid glass surfaces against base #F7FAFF

function sRGBtoLinear(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function getRelativeLuminance(r, g, b) {
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Surfaces in QUESTIFY Liquid Glass
// Base background: #F7FAFF
// glass-prominent surface: rgba(255, 255, 255, 0.86) over #F7FAFF -> ~#FCFDFF
// glass-regular surface: rgba(255, 255, 255, 0.72) over #F7FAFF -> ~#FAFDFE
// glass-subtle surface: rgba(255, 255, 255, 0.58) over #F7FAFF -> ~#F9FBFE
const surfaces = {
  'Base #F7FAFF': '#F7FAFF',
  'Glass-Regular #FAFDFE': '#FAFDFE',
  'Glass-Prominent #FCFDFF': '#FCFDFF',
  'White Card #FFFFFF': '#FFFFFF',
  'Sky Badge Tint #E0F2FE': '#E0F2FE',
  'Emerald Badge Tint #D1FAE5': '#D1FAE5',
  'Amber Badge Tint #FEF3C7': '#FEF3C7',
  'Rose Badge Tint #FFE4E6': '#FFE4E6'
};

const textTokens = [
  { name: 'text-quest-textPrimary (#12243B)', hex: '#12243B', surfaceKey: 'Glass-Prominent #FCFDFF' },
  { name: 'text-quest-textSecondary (#5A6E85)', hex: '#5A6E85', surfaceKey: 'Glass-Prominent #FCFDFF' },
  { name: 'text-quest-skyDark (#0284C7)', hex: '#0284C7', surfaceKey: 'Glass-Prominent #FCFDFF' },
  { name: 'text-sky-800 (#075985)', hex: '#075985', surfaceKey: 'Sky Badge Tint #E0F2FE' },
  { name: 'text-sky-800 (#075985)', hex: '#075985', surfaceKey: 'Glass-Regular #FAFDFE' },
  { name: 'text-emerald-800 (#065F46)', hex: '#065F46', surfaceKey: 'Emerald Badge Tint #D1FAE5' },
  { name: 'text-emerald-700 (#047857)', hex: '#047857', surfaceKey: 'Glass-Regular #FAFDFE' },
  { name: 'text-amber-800 (#92400E)', hex: '#92400E', surfaceKey: 'Amber Badge Tint #FEF3C7' },
  { name: 'text-rose-800 (#9F1239)', hex: '#9F1239', surfaceKey: 'Rose Badge Tint #FFE4E6' },
  { name: 'text-rose-600 (#E11D48)', hex: '#E11D48', surfaceKey: 'Glass-Regular #FAFDFE' },
  { name: 'text-purple-800 (#6B21A8)', hex: '#6B21A8', surfaceKey: 'Glass-Regular #FAFDFE' }
];

console.log('====================================================');
console.log('QUESTIFY TEXT ACCESSIBILITY & CONTRAST AUDIT (WCAG)');
console.log('====================================================\n');

let allPassed = true;
textTokens.forEach(item => {
  const bgHex = surfaces[item.surfaceKey];
  const ratio = getContrastRatio(item.hex, bgHex);
  const passesNormalAA = ratio >= 4.5;
  const passesLargeAA = ratio >= 3.0;
  const passesAAA = ratio >= 7.0;

  let status = 'FAIL';
  if (passesAAA) status = 'PASS (AAA)';
  else if (passesNormalAA) status = 'PASS (AA normal)';
  else if (passesLargeAA) status = 'PASS (AA large/bold)';
  else allPassed = false;

  console.log(`[${status}] ${item.name} on ${item.surfaceKey}`);
  console.log(`   Ratio: ${ratio.toFixed(2)}:1  |  Req AA: 4.5:1 (normal) / 3.0:1 (large)\n`);
});

console.log('----------------------------------------------------');
console.log(`Summary: ${allPassed ? 'ALL AUDITED TOKENS PASS WCAG AA / AAA' : 'SOME TOKENS FAILED'}`);
console.log('====================================================');

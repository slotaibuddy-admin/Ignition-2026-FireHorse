/**
 * CardGenerator Service
 * Generates Pokemon-style card front and back layouts
 * Front: Dynamic creature card with stats
 * Back: Static Fire Horse branded back
 */

const RARITY_COLORS = {
  Common: '#A0A0A0',
  Rare: '#0099FF',
  Epic: '#9933FF',
  Legendary: '#FFD700',
  Mythic: '#FF1493'
};

const RARITY_BORDER_GRADIENTS = {
  Common: 'linear-gradient(135deg, #C0C0C0, #808080)',
  Rare: 'linear-gradient(135deg, #0099FF, #0066CC)',
  Epic: 'linear-gradient(135deg, #9933FF, #6600CC)',
  Legendary: 'linear-gradient(135deg, #FFD700, #FFA500)',
  Mythic: 'linear-gradient(135deg, #FF1493, #FF69B4)'
};

/**
 * Generates a simple SVG creature illustration based on creature type and stats
 * @param {Object} creatureData - Creature data including asset3dType and power/heat/speed
 * @returns {string} Data URL of the generated SVG creature image
 */
function generateCreatureSVG(creatureData) {
  const assetType = creatureData.asset3dType || 'phoenix';
  const flames = creatureData.heat || 75;
  const power = creatureData.power || 50;
  
  let svgContent = '';
  
  // Different SVG creatures based on asset type
  switch (assetType) {
    case 'phoenix':
      svgContent = generatePhoenixSVG(flames, power);
      break;
    case 'drake':
      svgContent = generateDrakeSVG(flames, power);
      break;
    case 'blaze_wolf':
      svgContent = generateWolfSVG(flames, power);
      break;
    case 'magma_beast':
      svgContent = generateBeastSVG(flames, power);
      break;
    case 'inferno_core':
      svgContent = generateCoreSVG(flames, power);
      break;
    default:
      svgContent = generatePhoenixSVG(flames, power);
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
    ${svgContent}
  </svg>`;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

function generatePhoenixSVG(heat, power) {
  const glowIntensity = Math.min((heat / 100) * 0.8, 0.8);
  
  return `
    <defs>
      <radialGradient id="phoenixGlow" cx="50%" cy="40%">
        <stop offset="0%" stopColor="#FFFF00" stopOpacity="0.9" />
        <stop offset="40%" stopColor="#FF8C00" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#DC143C" stopOpacity="0.1" />
      </radialGradient>
      <linearGradient id="fireWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFF00" />
        <stop offset="50%" stopColor="#FF6B00" />
        <stop offset="100%" stopColor="#DC143C" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background aura -->
    <circle cx="150" cy="140" r="110" fill="url(#phoenixGlow)" opacity="${glowIntensity}" />
    
    <!-- Main body -->
    <ellipse cx="150" cy="170" rx="55" ry="45" fill="#DC143C" />
    <ellipse cx="150" cy="168" rx="50" ry="40" fill="#FF6B00" />
    
    <!-- Head -->
    <circle cx="150" cy="85" r="40" fill="#FF4500" filter="url(#glow)" />
    <circle cx="150" cy="85" r="35" fill="#FF6B00" />
    
    <!-- Left wing (detailed flame) -->
    <path d="M 110 120 Q 70 90 50 140 Q 70 130 90 135 Q 85 100 110 110" fill="url(#fireWing)" opacity="0.85" />
    <path d="M 105 125 Q 65 105 45 155 Q 70 140 95 145 Q 90 110 105 120" fill="#FF8C00" opacity="0.6" />
    
    <!-- Right wing (detailed flame) -->
    <path d="M 190 120 Q 230 90 250 140 Q 230 130 210 135 Q 215 100 190 110" fill="url(#fireWing)" opacity="0.85" />
    <path d="M 195 125 Q 235 105 255 155 Q 230 140 205 145 Q 210 110 195 120" fill="#FF8C00" opacity="0.6" />
    
    <!-- Tail flame -->
    <path d="M 140 210 Q 130 250 120 290 Q 140 260 150 240 Q 160 260 170 290 Q 160 250 160 210" fill="url(#fireWing)" opacity="0.8" />
    
    <!-- Head details -->
    <path d="M 140 50 L 145 25 L 150 50 L 155 25 L 160 50" fill="#FF2D00" />
    
    <!-- Eye -->
    <circle cx="145" cy="80" r="5" fill="#FFFF00" filter="url(#glow)" />
    <circle cx="155" cy="80" r="5" fill="#FFFF00" filter="url(#glow)" />
  `;
}

function generateDrakeSVG(heat, power) {
  const glowIntensity = Math.min((heat / 100) * 0.7, 0.7);
  
  return `
    <defs>
      <linearGradient id="drakeBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF4500" />
        <stop offset="50%" stopColor="#DC143C" />
        <stop offset="100%" stopColor="#8B0000" />
      </linearGradient>
      <linearGradient id="drakeWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FF6B00" />
        <stop offset="100%" stopColor="#FF0000" />
      </linearGradient>
      <filter id="drakeGlow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Aura ring -->
    <circle cx="150" cy="150" r="115" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="${glowIntensity * 0.6}" />
    
    <!-- Serpentine body -->
    <path d="M 150 220 Q 120 200 140 170 Q 160 150 140 120 Q 130 100 150 80" stroke="url(#drakeBody)" strokeWidth="45" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    
    <!-- Left wing large -->
    <path d="M 115 140 Q 50 120 40 170 Q 80 160 115 150 Q 100 130 115 140" fill="url(#drakeWing)" opacity="0.85" filter="url(#drakeGlow)" />
    <!-- Left wing detail flame -->
    <path d="M 110 145 Q 55 130 35 185 Q 75 170 110 160 Q 98 135 110 145" fill="#FF8C00" opacity="0.6" />
    
    <!-- Right wing large -->
    <path d="M 185 140 Q 250 120 260 170 Q 220 160 185 150 Q 200 130 185 140" fill="url(#drakeWing)" opacity="0.85" filter="url(#drakeGlow)" />
    <!-- Right wing detail flame -->
    <path d="M 190 145 Q 245 130 265 185 Q 225 170 190 160 Q 202 135 190 145" fill="#FF8C00" opacity="0.6" />
    
    <!-- Head -->
    <ellipse cx="150" cy="65" rx="40" ry="50" fill="url(#drakeBody)" filter="url(#drakeGlow)" />
    <ellipse cx="150" cy="65" rx="35" ry="45" fill="#FF6B00" />
    
    <!-- Horns -->
    <path d="M 125 30 Q 110 10 105 -5" stroke="#FF2D00" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M 175 30 Q 190 10 195 -5" stroke="#FF2D00" strokeWidth="7" fill="none" strokeLinecap="round" />
    
    <!-- Dragon eye glowing -->
    <circle cx="140" cy="55" r="6" fill="#FFFF00" filter="url(#drakeGlow)" />
    <circle cx="160" cy="55" r="6" fill="#FFFF00" filter="url(#drakeGlow)" />
    
    <!-- Flame spikes on back -->
    <polygon points="145,160 140,130 155,160" fill="#FF4500" opacity="0.7" />
    <polygon points="155,140 150,115 160,140" fill="#FF2D00" opacity="0.7" />
  `;
}

function generateWolfSVG(heat, power) {
  return `
    <defs>
      <linearGradient id="wolfBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B00" />
        <stop offset="50%" stopColor="#DC143C" />
        <stop offset="100%" stopColor="#8B0000" />
      </linearGradient>
      <linearGradient id="wolfFire" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFF00" />
        <stop offset="100%" stopColor="#FF2D00" />
      </linearGradient>
      <filter id="wolfGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Flame aura -->
    <circle cx="150" cy="150" r="100" fill="url(#wolfFire)" opacity="0.1" />
    
    <!-- Wolf head large -->
    <ellipse cx="150" cy="110" rx="50" ry="55" fill="url(#wolfBody)" filter="url(#wolfGlow)" />
    <ellipse cx="150" cy="110" rx="45" ry="50" fill="#FF8C00" />
    
    <!-- Left ear -->
    <polygon points="120,65 105,25 135,70" fill="url(#wolfBody)" />
    <polygon points="120,65 110,35 130,70" fill="#FF6B00" />
    
    <!-- Right ear -->
    <polygon points="180,65 195,25 165,70" fill="url(#wolfBody)" />
    <polygon points="180,65 190,35 170,70" fill="#FF6B00" />
    
    <!-- Snout -->
    <ellipse cx="150" cy="140" rx="30" ry="25" fill="#FF8C00" />
    <ellipse cx="150" cy="140" rx="25" ry="20" fill="#FFD700" opacity="0.7" />
    
    <!-- Eyes glowing -->
    <circle cx="135" cy="100" r="6" fill="#FFFF00" filter="url(#wolfGlow)" />
    <circle cx="165" cy="100" r="6" fill="#FFFF00" filter="url(#wolfGlow)" />
    
    <!-- Neck/mane flames -->
    <path d="M 110 140 Q 90 130 80 160" stroke="#FF4500" strokeWidth="25" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M 190 140 Q 210 130 220 160" stroke="#FF4500" strokeWidth="25" fill="none" strokeLinecap="round" opacity="0.8" />
    
    <!-- Flame mane details -->
    <path d="M 110 140 Q 95 135 85 170" stroke="#FF6B00" strokeWidth="15" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M 190 140 Q 205 135 215 170" stroke="#FF6B00" strokeWidth="15" fill="none" strokeLinecap="round" opacity="0.6" />
    
    <!-- Chest flame -->
    <ellipse cx="150" cy="180" rx="45" ry="35" fill="#FF4500" opacity="0.7" />
    <ellipse cx="150" cy="180" rx="35" ry="28" fill="#FF6B00" opacity="0.5" />
  `;
}

function generateBeastSVG(heat, power) {
  const scale = Math.min((power / 100) * 1.3, 1.3);
  
  return `
    <defs>
      <linearGradient id="beastBody" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B0000" />
        <stop offset="50%" stopColor="#DC143C" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <filter id="beastGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Main rocky body -->
    <polygon points="150,240 90,180 110,120 150,80 190,120 210,180" fill="url(#beastBody)" filter="url(#beastGlow)" />
    <polygon points="150,240 95,180 115,125 150,90 185,125 205,180" fill="#FF6B00" opacity="0.8" />
    
    <!-- Lava cracks glowing -->
    <line x1="150" y1="80" x2="150" y2="230" stroke="#FF2D00" strokeWidth="4" opacity="0.9" filter="url(#beastGlow)" />
    <line x1="120" y1="120" x2="180" y2="200" stroke="#FF4500" strokeWidth="3" opacity="0.7" />
    <line x1="180" y1="120" x2="120" y2="200" stroke="#FF4500" strokeWidth="3" opacity="0.7" />
    
    <!-- Spike spines top -->
    <polygon points="140,80 135,45 150,80" fill="#FF2D00" filter="url(#beastGlow)" />
    <polygon points="150,80 150,40 160,80" fill="#FF4500" filter="url(#beastGlow)" />
    <polygon points="160,80 165,45 150,80" fill="#FF2D00" filter="url(#beastGlow)" />
    
    <!-- Side spikes -->
    <polygon points="90,180 70,170 100,190" fill="#FF4500" />
    <polygon points="210,180 230,170 200,190" fill="#FF4500" />
    
    <!-- Lava glow spots -->
    <circle cx="150" cy="150" r="8" fill="#FFFF00" opacity="0.8" filter="url(#beastGlow)" />
    <circle cx="130" cy="160" r="5" fill="#FF6B00" opacity="0.6" filter="url(#beastGlow)" />
    <circle cx="170" cy="160" r="5" fill="#FF6B00" opacity="0.6" filter="url(#beastGlow)" />
  `;
}

function generateCoreSVG(heat, power) {
  const pulseIntensity = Math.min((power / 100) * 75, 75);
  const glowAmount = Math.min((heat / 100) * 0.9, 0.9);
  
  return `
    <defs>
      <radialGradient id="coreCenter" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#FFFF00" stopOpacity="1" />
        <stop offset="30%" stopColor="#FFD700" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FF0000" stopOpacity="0.2" />
      </radialGradient>
      <radialGradient id="coreOuter" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#DC143C" stopOpacity="0.1" />
      </radialGradient>
      <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Outer aura rings -->
    <circle cx="150" cy="150" r="${110 + pulseIntensity * 0.3}" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="${glowAmount * 0.4}" />
    <circle cx="150" cy="150" r="${95 + pulseIntensity * 0.2}" fill="none" stroke="#FF8C00" strokeWidth="1.5" opacity="${glowAmount * 0.3}" />
    
    <!-- Main sphere -->
    <circle cx="150" cy="150" r="70" fill="url(#coreCenter)" filter="url(#coreGlow)" />
    
    <!-- Secondary glow layer -->
    <circle cx="150" cy="150" r="65" fill="url(#coreOuter)" opacity="0.7" />
    
    <!-- Inner bright pulse -->
    <circle cx="150" cy="150" r="50" fill="#FFFF00" opacity="${0.6 + (heat / 100) * 0.3}" filter="url(#coreGlow)" />
    <circle cx="150" cy="150" r="35" fill="#FFFF00" opacity="0.8" filter="url(#coreGlow)" />
    
    <!-- Energy beams radiating -->
    <line x1="150" y1="80" x2="150" y2="30" stroke="#FF6B00" strokeWidth="3" opacity="${glowAmount}" />
    <line x1="150" y1="220" x2="150" y2="270" stroke="#FF6B00" strokeWidth="3" opacity="${glowAmount}" />
    <line x1="80" y1="150" x2="30" y2="150" stroke="#FF8C00" strokeWidth="2.5" opacity="${glowAmount * 0.7}" />
    <line x1="220" y1="150" x2="270" y2="150" stroke="#FF8C00" strokeWidth="2.5" opacity="${glowAmount * 0.7}" />
    
    <!-- Diagonal energy beams -->
    <line x1="110" y1="110" x2="70" y2="70" stroke="#FF4500" strokeWidth="2" opacity="${glowAmount * 0.5}" />
    <line x1="190" y1="190" x2="230" y2="230" stroke="#FF4500" strokeWidth="2" opacity="${glowAmount * 0.5}" />
  `;
}


/**
 * Generates a canvas-based Pokemon-style card front
 * @param {Object} creatureData - NFT creature data from Gemini
 * @param {string} imageUrl - Optional image URL for the creature
 * @returns {string} Data URL of the generated card image
 */
export function generateCardFront(creatureData, imageUrl = null) {
  const canvas = document.createElement('canvas');
  const width = 400;
  const height = 560;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context from canvas');
    throw new Error('Canvas 2D context unavailable');
  }
  
  // Ensure canvas has proper scaling
  ctx.scale(1, 1);
  
  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(1, '#16213e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Rarity border (top-left corner accent)
  const rarityColor = RARITY_COLORS[creatureData.rarity] || RARITY_COLORS.Common;
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  
  // Corner accent
  ctx.fillStyle = rarityColor;
  ctx.fillRect(width - 40, 8, 32, 32);
  
  // Header: Name + Type
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(creatureData.name, 20, 40);
  
  ctx.font = '12px Arial';
  ctx.fillStyle = rarityColor;
  ctx.fillText(`${creatureData.rarity} • Year: 2026`, 20, 60);
  
  // HP Display
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#FF6B6B';
  ctx.textAlign = 'right';
  ctx.fillText(`HP: ${creatureData.hp}`, width - 20, 40);
  ctx.textAlign = 'left';
  
  // Image placeholder (centered) - now with creature SVG
  const imageAreaY = 80;
  const imageAreaHeight = 220;
  
  // Generate and render creature SVG
  try {
    const creatureSvgUrl = generateCreatureSVG(creatureData);
    // For now, just draw a background so the image renders. In PokemonCard, we'll load the actual creature SVG
    const creatureGradient = ctx.createLinearGradient(20, imageAreaY, 20, imageAreaY + imageAreaHeight);
    creatureGradient.addColorStop(0, '#1a3a52');
    creatureGradient.addColorStop(0.5, '#0d1f2d');
    creatureGradient.addColorStop(1, '#051119');
    ctx.fillStyle = creatureGradient;
    ctx.fillRect(20, imageAreaY, width - 40, imageAreaHeight);
    
    // Draw flame effect
    ctx.fillStyle = 'rgba(255, 107, 0, 0.2)';
    ctx.beginPath();
    ctx.arc((width - 40) / 2 + 20, imageAreaY + imageAreaHeight / 2, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 45, 0, 0.15)';
    ctx.beginPath();
    ctx.arc((width - 40) / 2 + 20, imageAreaY + imageAreaHeight / 2, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Creature name in image area (will be replaced by creature SVG in component)
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 ' + creatureData.name, (width - 40) / 2 + 20, imageAreaY + imageAreaHeight / 2);
    ctx.textAlign = 'left';
  } catch (err) {
    console.warn('Could not generate creature SVG:', err);
    // Fallback gradient
    const imgGradient = ctx.createLinearGradient(20, imageAreaY, 20, imageAreaY + imageAreaHeight);
    imgGradient.addColorStop(0, '#FF8C00');
    imgGradient.addColorStop(0.5, '#FF6B00');
    imgGradient.addColorStop(1, '#FF2D00');
    ctx.fillStyle = imgGradient;
    ctx.fillRect(20, imageAreaY, width - 40, imageAreaHeight);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 Creature Image', width / 2, imageAreaY + imageAreaHeight / 2);
    ctx.textAlign = 'left';
  }
  
  // Stats section (bottom area)
  const statsY = imageAreaY + imageAreaHeight + 10;
  
  // Weakness & Resistance
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Weakness:', 20, statsY);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(creatureData.weakness, 120, statsY);
  
  ctx.fillStyle = '#00FF00';
  ctx.fillText('Resistance:', 20, statsY + 25);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(creatureData.resistance, 120, statsY + 25);
  
  // Power, Speed, Heat bars
  const barY = statsY + 55;
  const barWidth = (width - 40) / 3 - 8;
  
  drawStatBar(ctx, 20, barY, barWidth, 'POW', creatureData.power, '#FF6B00');
  drawStatBar(ctx, 20 + barWidth + 10, barY, barWidth, 'SPD', creatureData.speed, '#00D4FF');
  drawStatBar(ctx, 20 + (barWidth + 10) * 2, barY, barWidth, 'HEAT', creatureData.heat, '#FF2D00');
  
  // ID and date at bottom
  ctx.font = '10px Arial';
  ctx.fillStyle = '#808080';
  ctx.textAlign = 'left';
  ctx.fillText(`ID: ${creatureData.uniqueId.slice(0, 12)}...`, 20, height - 15);
  ctx.textAlign = 'right';
  const date = new Date(creatureData.generatedAt).toLocaleDateString();
  ctx.fillText(date, width - 20, height - 15);
  
  const dataUrl = canvas.toDataURL('image/png');
  console.log('Card front generated:', {
    dataUrl: dataUrl.slice(0, 100) + '...',
    length: dataUrl.length,
    creatureName: creatureData.name
  });
  
  return dataUrl;
}

/**
 * Generates the Pokemon-style card back (static, branded)
 * @returns {string} Data URL of the generated card back image
 */
export function generateCardBack() {
  const canvas = document.createElement('canvas');
  const width = 400;
  const height = 560;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context from canvas for back');
    throw new Error('Canvas 2D context unavailable');
  }
  
  ctx.scale(1, 1);
  
  // Background with fire gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(0.5, '#2D1B1B');
  bgGradient.addColorStop(1, '#16213e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  
  // Central logo area (Fire Horse)
  const centerX = width / 2;
  const centerY = height / 2 - 40;
  
  // Draw fire horse silhouette (stylized)
  ctx.fillStyle = 'rgba(255, 107, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Fire Horse text
  ctx.font = 'bold 48px Arial';
  const gradient = ctx.createLinearGradient(0, centerY - 30, 0, centerY + 30);
  gradient.addColorStop(0, '#FF8C00');
  gradient.addColorStop(0.5, '#FF2D00');
  gradient.addColorStop(1, '#DC143C');
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.fillText('🔥', centerX, centerY + 20);
  
  // Collection name
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('FIRE HORSE', centerX, centerY + 80);
  
  // Subtitle
  ctx.font = '14px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('NFT Collection', centerX, centerY + 110);
  ctx.fillText('Year of the Dragon - 2026', centerX, centerY + 135);
  
  // Bottom section
  ctx.font = '12px Arial';
  ctx.fillStyle = '#C0C0C0';
  ctx.textAlign = 'center';
  ctx.fillText('One Digital Creature', centerX, height - 100);
  ctx.fillText('Unique • Limited • Tradeable', centerX, height - 75);
  
  // QR code placeholder
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - 40, height - 60, 80, 40);
  ctx.fillStyle = '#000000';
  ctx.font = '10px Arial';
  ctx.fillText('Visit:', centerX, height - 25);
  
  const dataUrl = canvas.toDataURL('image/png');
  console.log('Card back generated:', {
    dataUrl: dataUrl.slice(0, 100) + '...',
    length: dataUrl.length
  });
  
  return dataUrl;
}

/**
 * Helper: Draws a stat bar on the card
 */
function drawStatBar(ctx, x, y, width, label, value, color) {
  // Label
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(label, x, y - 5);
  
  // Bar background
  ctx.fillStyle = '#333333';
  ctx.fillRect(x, y, width, 12);
  
  // Bar fill
  const fillWidth = (value / 100) * width;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, fillWidth, 12);
  
  // Bar border
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, 12);
  
  // Value text
  ctx.font = '10px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'right';
  ctx.fillText(value.toString(), x + width - 3, y + 10);
  ctx.textAlign = 'left';
}

/**
 * Validates card data - ensures all required fields exist
 */
export function validateCardData(creatureData) {
  const requiredFields = ['name', 'rarity', 'description', 'hp', 'weakness', 'resistance', 'power', 'speed', 'heat'];
  const missingFields = requiredFields.filter(field => creatureData[field] === undefined);
  
  if (missingFields.length > 0) {
    throw new Error(`Invalid creature data for card generation. Missing: ${missingFields.join(', ')}`);
  }
  
  return true;
}

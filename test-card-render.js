/**
 * Test script to verify card generation works
 */

// Simulate creatureData
const testCreatureData = {
  name: 'Phoenix Fire',
  rarity: 'Legendary',
  description: 'A legendary fire phoenix',
  hp: 95,
  weakness: 'Water',
  resistance: 'Fire',
  power: 85,
  speed: 88,
  heat: 92,
  uniqueId: 'test-unique-id-12345',
  generatedAt: new Date().toISOString()
};

// Canvas test
try {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 560;
  
  const ctx = canvas.getContext('2d');
  console.log('Canvas context created:', !!ctx);
  
  // Draw a test rectangle
  ctx.fillStyle = '#FF6B00';
  ctx.fillRect(0, 0, 400, 560);
  
  const dataUrl = canvas.toDataURL('image/png');
  console.log('Canvas data URL length:', dataUrl.length);
  console.log('Data URL starts with:', dataUrl.slice(0, 50));
  
  // Try to display it
  const img = new Image();
  img.onload = () => console.log('Image loaded successfully');
  img.onerror = () => console.error('Image failed to load');
  img.src = dataUrl;
  
} catch (error) {
  console.error('Canvas error:', error);
}

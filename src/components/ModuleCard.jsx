export default function ModuleCard({ module }) {
  const getRarityClass = (rarity) => {
    const rarityMap = {
      'Common': 'rarity-common',
      'Rare': 'rarity-rare',
      'Epic': 'rarity-epic',
      'Legendary': 'rarity-legendary',
      'Mythic': 'rarity-mythic'
    };
    return rarityMap[rarity] || 'rarity-common';
  };

  return (
    <div className="glass-card p-8 max-w-2xl w-full fade-in">
      <div className="space-y-6">
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-3xl font-bold text-white mb-2">{module.name}</h2>
          <p className={`text-xl font-semibold ${getRarityClass(module.rarity)}`}>
            {module.rarity}
          </p>
        </div>
        
        <p className="text-gray-300 text-lg leading-relaxed">
          {module.description}
        </p>
        
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="glass-container p-4 text-center">
            <div className="text-3xl font-bold fire-text">{module.power}</div>
            <div className="text-sm text-gray-400 mt-1">Power</div>
          </div>
          <div className="glass-container p-4 text-center">
            <div className="text-3xl font-bold fire-text">{module.speed}</div>
            <div className="text-sm text-gray-400 mt-1">Speed</div>
          </div>
          <div className="glass-container p-4 text-center">
            <div className="text-3xl font-bold fire-text">{module.heat}</div>
            <div className="text-sm text-gray-400 mt-1">Heat</div>
          </div>
        </div>
      </div>
    </div>
  );
}

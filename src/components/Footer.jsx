export default function Footer() {
  return (
    <footer className="py-12 px-4 mt-auto border-t border-gray-800/50">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h4 className="text-lg font-bold fire-text mb-2">Ignition 2026</h4>
          <p className="text-gray-500 text-sm">The Year of the Fire Horse</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-2">Network</h4>
          <p className="text-gray-500 text-sm">Powered by Polygon</p>
          <p className="text-gray-600 text-xs mt-1">RPC via Alchemy</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-2">Technology</h4>
          <p className="text-gray-500 text-sm">AI-Generated NFTs via Google Gemini</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <p className="text-gray-600 text-xs">Created for the 2026 AI + Web3 Evolution</p>
      </div>
    </footer>
  );
}

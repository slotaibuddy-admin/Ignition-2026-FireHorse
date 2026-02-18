import WalletButton from './WalletButton';

export default function Header({ walletAddress, chainId, balance, onConnect, isConnecting }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 header-glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo/brand */}
        <div className="flex items-center gap-3">
          <span className="text-lg md:text-2xl font-bold fire-text tracking-tight">IGNITION 2026</span>
          {chainId === 137 && <span className="polygon-badge hidden sm:inline-flex">Polygon</span>}
        </div>

        {/* Center: Nav links */}
        <nav className="hidden md:flex gap-6 text-sm text-gray-400">
          <a href="#forge" className="hover:text-white transition-colors">Forge</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </nav>

        {/* Right: Wallet */}
        <WalletButton
          walletAddress={walletAddress}
          chainId={chainId}
          balance={balance}
          onConnect={onConnect}
          isConnecting={isConnecting}
        />
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import MagicBento from '../components/MagicBento';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 pt-20 pb-0">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-32 mt-16"
      >
        <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6 leading-tight">
          Send crypto gifts wrapped in{' '}
          <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-normal">
            Generative Art
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Create unique NFT gift cards with embedded tokens. Perfect for birthdays, celebrations, or just because.
        </p>

        {/* CTA Buttons */}
        {isConnected ? (
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/create">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                Create Gift Card
              </motion.button>
            </Link>
            <Link to="/my-gifts">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all duration-200 shadow-lg"
              >
                My Gifts
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="glass-card glow-border rounded-lg p-6 max-w-md mx-auto">
            <p className="text-slate-400">Connect your wallet to get started</p>
          </div>
        )}
      </motion.div>

      {/* Magic Bento Grid */}
      <div className="mb-32">
        <MagicBento
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="168, 85, 247"
        />
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-white/10">
          <FeatureCard
            icon={<PaletteIcon />}
            title="AI-Generated Art"
            description="Create unique gift cards with AI-powered artwork using simple text prompts"
            delay={0.1}
            className="border-r border-b border-white/10"
          />
          <FeatureCard
            icon={<VaultIcon />}
            title="Token Vaults"
            description="Lock ERC-20 tokens inside NFTs. Recipients can liquidate to claim the tokens"
            delay={0.2}
            className="border-b border-white/10"
          />
          <FeatureCard
            icon={<ShoppingIcon />}
            title="Marketplace"
            description="Buy artist designs or trade gift card NFTs on the secondary market"
            delay={0.3}
            className="border-r border-white/10"
          />
          <FeatureCard
            icon={<MailIcon />}
            title="Email Delivery"
            description="Send gift cards via email with secure claim links"
            delay={0.4}
            className=""
          />
        </div>
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-24 max-w-7xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white text-center mb-20">
          How It Works
        </h2>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            <StepCard
              number="01"
              title="Create Gift Card"
              description="Generate AI artwork and lock tokens in an NFT gift card with embedded value"
              icon={<CreateIcon />}
              delay={0.1}
            />

            <StepCard
              number="02"
              title="Send to Recipient"
              description="Share via email with secure claim link or transfer the NFT directly to recipient's wallet"
              icon={<SendIcon />}
              delay={0.2}
            />

            <StepCard
              number="03"
              title="Claim Tokens"
              description="Recipient liquidates the NFT to receive the locked tokens directly to their wallet"
              icon={<ClaimIcon />}
              delay={0.3}
            />
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-32 border-t border-white/10 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-medium text-white mb-4">About CRYPT</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                CRYPT is a revolutionary NFT gift card platform that combines the power of blockchain technology with AI-generated art. Send crypto gifts wrapped in beautiful, unique artwork to your loved ones.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Built on Polygon Amoy testnet, CRYPT enables seamless token transfers through NFTs, making crypto gifting accessible and delightful for everyone.
              </p>
            </div>

            {/* Made By Section */}
            <div>
              <h3 className="text-xl font-medium text-white mb-4">Made by Jayant</h3>
              <p className="text-slate-400 mb-6">
                Blockchain Developer & Web3 Enthusiast
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://github.com/Iam-jayant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-violet-400 transition-colors group"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/jayant-kurekar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-violet-400 transition-colors group"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
            <p>© 2024 CRYPT. Built with ❤️ on Polygon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay, className = "" }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`bg-transparent p-8 hover:bg-white/[0.02] transition-all duration-300 group ${className}`}
    >
      <div className="flex flex-col items-start h-full">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-medium tracking-tight text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Icon Components
function PaletteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="white" />
      <circle cx="17.5" cy="10.5" r=".5" fill="white" />
      <circle cx="8.5" cy="7.5" r=".5" fill="white" />
      <circle cx="6.5" cy="12.5" r=".5" fill="white" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function ShoppingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// Step Card Component
function StepCard({ number, title, description, icon, delay }: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative z-10 h-full"
    >
      <div className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300 group h-full min-h-[280px] flex flex-col relative">
        {/* Number Badge - Top Right */}
        <div className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-violet-500 bg-transparent flex items-center justify-center text-white font-bold text-sm">
          {number}
        </div>

        {/* Title */}
        <h3 className="text-xl font-medium tracking-tight text-white mb-6 pr-16">{title}</h3>

        {/* Icon */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 flex items-center justify-center mb-6 group-hover:from-violet-500/20 group-hover:to-purple-600/20 transition-colors">
          {icon}
        </div>

        {/* Description */}
        <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
}




// Step Icon Components
function CreateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function ClaimIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

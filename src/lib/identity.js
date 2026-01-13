/**
 * 🏛️ PIXEL PALACE IDENTITY SYSTEM (GENESIS OMNI)
 * VERSION: 3.0.0 (GENESIS)
 * STATUS: LOCKED // BRAND-ENFORCED
 */

export const BRAND = {
  // 🏷️ NOMENCLATURE
  name: "Pixel Palace",
  shortName: "PXP",
  slug: "pixelpalace",
  tagline: "The Sovereign Standard for Competitive Esports.",
  version: "v3.0.0.G", // Genesis Revision
  
  // 🔗 INFRASTRUCTURE
  domain: "pixel-palace.pages.dev",
  cdn: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration",
  
  // 🖼️ ASSETS (Sovereign Hash Verified)
  logo: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png",
  favicon: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png",
  heroBackground: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80", // High-fidelity placeholder

  // 🌐 THE NEURAL LINK (Community)
  links: {
    discord: "https://discord.gg/JdXheQbvec",
    twitch: "https://www.twitch.tv/pXpLgg",
    twitter: "https://x.com/pixelpalace",
    support: "mailto:support@pixelpalace.gg",
  },

  // 📅 TEMPORAL DATA
  established: 2024,
  copyrightYear: new Date().getFullYear(),
  
  // 🎨 FALLBACK REALITY (The Emergency Theme)
  // Ensures UI legibility during DB propagation delays
  theme: {
    primary: '#c026d3', // Fuchsia 600
    dim: '#701a75',     // Fuchsia 900
    glow: '#e879f9',    // Fuchsia 400
    accent: '#10b981',  // Emerald 500 (Success color)
    surface: '#09090b', // Zinc 950 (Darkest backdrop)
  }
};

/**
 * 🛠️ UTILITY: SEO METADATA GENERATOR
 * Generates OpenGraph tags for match pages.
 */
export const getSEO = (pageTitle) => ({
  title: `${pageTitle} | ${BRAND.name}`,
  description: BRAND.tagline,
  openGraph: {
    type: 'website',
    url: `https://${BRAND.domain}`,
    site_name: BRAND.name,
    images: [{ url: BRAND.logo }],
  }
});

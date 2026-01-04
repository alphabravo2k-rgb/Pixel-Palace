/**
 * PIXEL PALACE IDENTITY SYSTEM
 * Single Source of Truth for Static Branding & Links.
 * (Note: Dynamic Tournament Themes are handled by useTournament.jsx)
 */

export const BRAND = {
  name: "Pixel Palace",
  shortName: "PXP",
  domain: "pixel-palace.pages.dev",
  tagline: "The Global Standard for Competitive Esports.",
  version: "v3.0.0 (Genesis)", // Updated for the new Master System
  
  // 🔗 ASSETS (Hosted via GitHub for speed/reliability)
  logo: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png",
  favicon: "https://raw.githubusercontent.com/alphabravo2k-rgb/pixel-palace-registration/1a7d90c43796fd037316bdaf4f3b4de9a485d615/image_4379f9.png",

  // 🌐 SOCIAL & COMMUNITY LINKS
  discord: "https://discord.gg/JdXheQbvec",
  twitch: "https://www.twitch.tv/pXpLgg",
  twitter: "#",
  supportEmail: "support@pixelpalace.gg",

  // 📅 METADATA
  copyrightYear: new Date().getFullYear(),
  
  // 🎨 FALLBACK THEME
  // These are the colors used if the Database connection is slow or fails.
  // Matches the defaults in index.css
  fallbackColors: {
    primary: '#c026d3', // Fuchsia 600
    dim: '#701a75',     // Fuchsia 900
    glow: '#e879f9'     // Fuchsia 400
  }
};

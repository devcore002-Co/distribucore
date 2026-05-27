export default function Footer() {
  const fb = import.meta.env.VITE_FACEBOOK_URL
  const ig = import.meta.env.VITE_INSTAGRAM_URL
  const tt = import.meta.env.VITE_TIKTOK_URL

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start mb-3">
              <div className="w-9 h-9 rounded-lg bg-mint flex items-center justify-center font-bold text-navy text-sm">DC</div>
              <span className="font-semibold text-lg">DistribuCore</span>
            </div>
            <p className="text-white/40 text-sm">Your trusted F&B distribution partner</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-mint hover:text-navy transition-all text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.024 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.097 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-mint hover:text-navy transition-all text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a href={tt} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-mint hover:text-navy transition-all text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/30 text-xs">
          © {new Date().getFullYear()} DistribuCore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

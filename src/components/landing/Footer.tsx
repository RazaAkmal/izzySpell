import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Get Started", href: "#get-started" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "#" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Us", href: "#" },
];

const SOCIAL = [
  { letter: "F", label: "Facebook" },
  { letter: "X", label: "X (Twitter)" },
  { letter: "I", label: "Instagram" },
  { letter: "Y", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a3a6b] text-white py-12 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-white/10">
          <div className="max-w-xs">
            <div className="bg-white rounded-xl px-3 py-2 inline-block mb-4">
              <Image
                src="/images/LandingPage/logo.png"
                alt="IzzySpell"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Making spelling fun and effective for kids everywhere through voice-powered interactive learning.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/80 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/80 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm text-white/60">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-white/80 uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-4">
              {SOCIAL.map((s) => (
                <a key={s.letter} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label={s.label}>
                  <span className="text-xs font-bold">{s.letter}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-white/40 text-xs">
          <p>© {new Date().getFullYear()} IzzySpell. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const INSTAGRAM_URL = 'https://www.instagram.com/eusoukleverson';
const YOUTUBE_URL = 'https://www.youtube.com/@eusoukleverson';
const TIKTOK_URL = 'https://www.tiktok.com/@eusoukleverson';

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: INSTAGRAM_URL, label: "Instagram" },
    { icon: Youtube, href: YOUTUBE_URL, label: "YouTube" },
    { icon: TikTokIcon, href: TIKTOK_URL, label: "TikTok" },
  ];

  return (
    <footer className="border-t border-border mt-20">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link 
            to="/" 
            className="text-lg font-bold tracking-[0.15em] text-foreground"
          >
            KLEVERSON
          </Link>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-primary"
                style={{ transition: "color var(--transition-fast)" }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kleverson. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
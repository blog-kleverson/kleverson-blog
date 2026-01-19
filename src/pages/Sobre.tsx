import { Instagram, Youtube } from "lucide-react";
import Layout from "@/components/Layout";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const INSTAGRAM_URL = 'https://www.instagram.com/eusoukleverson';
const YOUTUBE_URL = 'https://www.youtube.com/@eusoukleverson';
const TIKTOK_URL = 'https://www.tiktok.com/@eusoukleverson';
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/KzQL3AVRaVUGjdHFCnRBZk';

const Sobre = () => {
  const socialLinks = [
    { icon: Instagram, href: INSTAGRAM_URL, label: "Instagram" },
    { icon: Youtube, href: YOUTUBE_URL, label: "YouTube" },
    { icon: TikTokIcon, href: TIKTOK_URL, label: "TikTok" },
  ];

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-card border-4 border-primary/20 mb-6">
              <img
                src="https://res.cloudinary.com/dxfwizcl6/image/upload/v1767541070/IMG_2382-3_ar17ol.jpg"
                alt="Kleverson"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-[0.15em]">
              KLEVERSON
            </h1>
            <p className="text-primary font-serif italic text-lg">
              Escritor e Empreendedor
            </p>
          </div>

          {/* Bio - Lora Regular */}
          <div className="about-bio text-center mb-8">
            <p className="text-muted-foreground">
              Obcecado por mente, desempenho e crescimento real.
            </p>
            <p className="text-muted-foreground">
              Testo em mim. Escrevo o que funciona.
            </p>
          </div>

          {/* WhatsApp CTA Button */}
          <div className="flex justify-center mb-8">
            <a 
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Entrar na comunidade
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                style={{ transition: "color var(--transition-fast), border-color var(--transition-fast)" }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sobre;

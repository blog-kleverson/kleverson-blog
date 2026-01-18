import { MessageCircle, Instagram, Youtube } from "lucide-react";
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
          <div className="flex flex-col items-center text-center mb-12">
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

          {/* Bio */}
          <div className="about-bio text-center mb-12">
            <p className="text-muted-foreground">
              Não sou guru da internet. Não tenho fórmulas mágicas.
            </p>
            <p className="text-muted-foreground">
              Tenho 20 anos e estou vivendo obcecado por uma pergunta:
            </p>
            <p className="text-muted-foreground">
              Por que algumas pessoas explodem o próprio potencial enquanto outras ficam presas em loops de "quase"?
            </p>
            <p className="text-muted-foreground">
              Estou mergulhando afundo nisso.
            </p>
            <p className="text-muted-foreground">
              Neurociência. Psicologia. Filosofia. Espiritualidade. Negócios etc...
            </p>
            <p className="text-muted-foreground">
              Estou testando tudo em mim primeiro. Aplicando. Errando. Ajustando. Reconstruindo quando falho.
            </p>
            <p className="text-muted-foreground">
              E tudo que faz sentido e funciona, eu escrevo em minhas cartas...
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-12">
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

          {/* WhatsApp CTA */}
          <div className="glass rounded-xl p-8 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Vamos Conversar?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Se você tem dúvidas ou apenas quer trocar uma ideia, estou disponível pelo WhatsApp.
            </p>
            <a 
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sobre;
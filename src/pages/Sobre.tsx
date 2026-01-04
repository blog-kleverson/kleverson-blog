import { MessageCircle, Instagram, Youtube } from "lucide-react";
import Layout from "@/components/Layout";

// TikTok icon component (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Sobre = () => {
  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: TikTokIcon, href: "#", label: "TikTok" },
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Sobre Mim
            </h1>
            <p className="text-primary font-serif italic">
              Escritor e Empreendedor
            </p>
          </div>

          {/* Bio */}
          <div className="prose-article text-center mb-12">
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Não sou guru da internet. Não tenho fórmulas mágicas.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Tenho 20 anos e estou vivendo obcecado por uma pergunta:
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Por que algumas pessoas explodem o próprio potencial enquanto outras ficam presas em loops de "quase"?
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Estou mergulhando afundo nisso.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Neurociência. Psicologia. Filosofia. Espiritualidade. Negócios etc...
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Estou testando tudo em mim primeiro. Aplicando. Errando. Ajustando. Reconstruindo quando falho.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              E tudo que faz sentido e funciona, eu escrevo em minhas cartas...
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-12">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
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
            <button className="btn-primary">
              Chamar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sobre;

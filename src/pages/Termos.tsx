import Layout from "@/components/Layout";

const Termos = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto prose-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Termos de Uso
          </h1>

          <div className="space-y-8 text-muted-foreground leading-relaxed font-serif">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar este site, você concorda com os presentes Termos de Uso. 
                Caso não concorde com algum dos termos aqui estabelecidos, recomendamos que não 
                utilize o site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo publicado neste site — incluindo textos, imagens, logotipos e 
                design — é de propriedade exclusiva de Kleverson e está protegido pelas leis 
                de direitos autorais. A reprodução, distribuição ou modificação do conteúdo sem 
                autorização prévia e expressa é proibida.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Uso do Conteúdo</h2>
              <p>
                O conteúdo disponibilizado neste site é de caráter informativo e educacional. 
                O autor não se responsabiliza por decisões tomadas com base nas informações 
                publicadas. O uso do conteúdo é de inteira responsabilidade do leitor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Privacidade e Dados Pessoais</h2>
              <p>
                Ao fornecer seus dados pessoais (como nome e número de WhatsApp) através dos 
                formulários do site, você consente com o armazenamento e uso dessas informações 
                para comunicação e envio de conteúdos relacionados ao blog. Seus dados não serão 
                compartilhados com terceiros sem o seu consentimento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Links Externos</h2>
              <p>
                Este site pode conter links para sites de terceiros. Não nos responsabilizamos 
                pelo conteúdo, políticas de privacidade ou práticas de sites externos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Modificações</h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento, 
                sem aviso prévio. É responsabilidade do usuário verificar periodicamente as 
                atualizações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Contato</h2>
              <p>
                Em caso de dúvidas sobre estes Termos de Uso, entre em contato através das 
                redes sociais disponíveis na página Sobre.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Termos;

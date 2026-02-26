import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import PopularPosts from "@/components/PopularPosts";
import RecentPosts from "@/components/RecentPosts";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title=""
        description="Reflexões, estratégias e insights para ajudar você a alcançar seu potencial máximo em todas as áreas da vida."
        ogTitle="KLEVERSON"
        ogDescription="Reflexões, estratégias e insights para ajudar você a alcançar seu potencial máximo em todas as áreas da vida."
        ogImage={`${window.location.origin}/images/og-default.png`}
        ogUrl={window.location.origin}
        robots="index, follow"
      />
      <HeroSection />
      <PopularPosts />
      <RecentPosts />
    </Layout>
  );
};

export default Index;

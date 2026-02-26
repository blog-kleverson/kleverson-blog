import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import PopularPosts from "@/components/PopularPosts";
import RecentPosts from "@/components/RecentPosts";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PopularPosts />
      <RecentPosts />
    </Layout>
  );
};

export default Index;

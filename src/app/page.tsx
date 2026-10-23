import { connection } from "next/server";
import { BoatReader } from "@/components/home/boat-reader";
import { Closing } from "@/components/home/closing";
import { Hero } from "@/components/home/hero";
import { LearningPath } from "@/components/home/learning-path";
import { Pillars } from "@/components/home/pillars";
import { CraftPreview, PatternPreview } from "@/components/home/previews";
import { CultureGallery } from "@/components/home/culture-gallery";
import { getHomeContent } from "@/lib/services/home";

export default async function HomePage() {
  await connection();
  const content = await getHomeContent();

  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <Hero />
      <Pillars />
      <CraftPreview process={content.process} />
      <BoatReader boats={content.readerBoats} total={content.counts.boats} />
      <PatternPreview patterns={content.patterns} />
      <LearningPath course={content.course} stepCount={content.counts.steps} />
      <CultureGallery images={content.galleryImages} />
      <Closing boatSlug={content.readerBoat?.slug ?? null} />
    </main>
  );
}


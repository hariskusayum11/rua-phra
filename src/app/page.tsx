import { connection } from "next/server";
import { BoatReader } from "@/components/home/boat-reader";
import { Closing } from "@/components/home/closing";
import { CraftProcess } from "@/components/home/craft-process";
import { FeaturedBoats } from "@/components/home/featured-boats";
import { Hero } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { LearningPath } from "@/components/home/learning-path";
import { MasterArtisan } from "@/components/home/master-artisan";
import { NextGeneration } from "@/components/home/next-generation";
import { PatternArchive } from "@/components/home/pattern-archive";
import { Procession } from "@/components/home/procession";
import { UniqueCraft } from "@/components/home/unique-craft";
import { getHomeContent } from "@/lib/services/home";

export default async function HomePage() {
  await connection();
  const content = await getHomeContent();

  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <Hero boat={content.heroBoat} />
      <Introduction />
      <BoatReader boats={content.readerBoats} />
      <FeaturedBoats boats={content.featuredBoats} />
      <UniqueCraft image={content.craftImage} step={content.craftStep} />
      <CraftProcess process={content.process} />
      <PatternArchive patterns={content.patterns} />
      <MasterArtisan master={content.master} />
      <LearningPath course={content.course} stepCount={content.counts.steps} />
      {content.works.length > 0 && <NextGeneration works={content.works} />}
      <Procession boat={content.processionBoat} />
      <Closing image={content.closingImage} boatSlug={content.readerBoat?.slug ?? content.heroBoat?.slug ?? null} />
    </main>
  );
}

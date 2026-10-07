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

/**
 * Prerendered, then refreshed in the background every five minutes, so an editor's change
 * in the CMS reaches visitors without a deploy and without making every visit hit the
 * database.
 */

/**
 * The homepage is one story told in eleven movements, and the order carries the argument:
 * object → story → craft → human → learning → continuation. Sections are not
 * interchangeable blocks; moving one breaks the sequence a first-time visitor needs.
 */
/**
 * Rendered when someone asks for it, not when the image is built.
 *
 * `connection()` stops prerendering here, which is what lets the production image be
 * built without a reachable database — a Docker build has no database, and a deploy that
 * only works when one happens to be on the same network is a deploy that fails on the
 * morning of the exhibition. The queries are small and indexed, and Postgres sits beside
 * the app, so paying for them per request is cheaper than the fragility.
 */
export default async function HomePage() {
  await connection();
  const content = await getHomeContent();

  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <Hero boat={content.heroBoat} />
      <Introduction />
      <UniqueCraft image={content.craftImage} step={content.craftStep} />
      <FeaturedBoats boats={content.featuredBoats} />
      <BoatReader boats={content.readerBoats} />
      <CraftProcess process={content.process} />
      <PatternArchive patterns={content.patterns} />
      <MasterArtisan master={content.master} />
      <LearningPath course={content.course} stepCount={content.counts.steps} />
      <NextGeneration works={content.works} />
      <Procession boat={content.processionBoat} />
      <Closing image={content.closingImage} boatSlug={content.readerBoat?.slug ?? content.heroBoat?.slug ?? null} />
    </main>
  );
}

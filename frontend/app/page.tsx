import LocationFinder from '@/components/LocationFinder';

export default function Home() {
  return (
    <main>
      <header className="flex min-h-screen items-end bg-gradient-to-b from-[#27493b] via-[#6c8a6a] to-[#e9d7ab] text-white">
        <div className="mx-auto w-full max-w-6xl px-6 pb-40">
          <h1 className="max-w-[11ch] font-display text-6xl leading-none md:text-8xl">Discover Bangladesh Beyond the Ordinary</h1>
          <p className="my-6 max-w-md text-lg">Explore extraordinary destinations, authentic cultures, unforgettable experiences and the stories behind them.</p>
          <div className="flex flex-wrap gap-3">
            <a className="bg-white px-6 py-3 text-forest" href="#explore">Explore Bangladesh</a>
            <a className="border border-white px-6 py-3" href="/journeys">Plan Your Trip</a>
            <a className="border border-white px-6 py-3" href="/market">Shop Local</a>
          </div>
        </div>
      </header>
      <section id="explore" className="px-6"><LocationFinder /></section>
    </main>
  );
}

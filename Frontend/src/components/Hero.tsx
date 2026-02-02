import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <div className="relative pt-48 pb-30 sm:pt-60 sm:pb-24">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="mx-auto font-sans text-5xl sm:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-8">
          Master the Art of{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative">Competitive Programming</span>
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-xl leading-relaxed tracking-tight text-slate-700 dark:text-zinc-400 mt-8">
          A modern platform for developers to compete, learn, and grow.{" "}
          <br className="hidden sm:inline" />
          Host contests, solve problems, and climb the global leaderboard.
        </p>

        <div className="mt-12 flex justify-center gap-4">
          <button className="group relative rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/5 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all flex items-center gap-2">
            Start Competing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button className="rounded-full px-8 py-3 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-900/10 hover:ring-slate-900/20 dark:text-white dark:ring-white/10 dark:hover:ring-white/20 dark:hover:bg-white/5 transition-all">
            Host a Contest
          </button>
        </div>

        <div className="mt-20 border-t border-slate-200 dark:border-white/10 w-full max-w-4xl mx-auto" />
      </div>
    </div>
  );
}

export default Hero;

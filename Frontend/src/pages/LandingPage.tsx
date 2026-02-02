import { Button } from "../components/ui/Button";
import {
  ArrowRight,
  Code2,
  Trophy,
  Users,
  Zap,
  Globe,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-0 -ml-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >


            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
            >
              Master the Art of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
                Competitive Programming
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 text-balance leading-relaxed"
            >
              A modern platform for developers to compete, learn, and grow. Host
              contests, solve problems, and climb the global leaderboard.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button size="lg" className="h-12 px-8 text-base">
                Start Competing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm"
              >
                Host a Contest
              </Button>
            </motion.div>


            <motion.div
              variants={fadeInUp}
              className="mt-16 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
            >
              {[
                { label: "Active Users", value: "10k+" },
                { label: "Daily Submissions", value: "50k+" },
                { label: "Contests Hosted", value: "100+" },
                { label: "Countries", value: "45+" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>


      <section className="py-24 bg-muted/30 dark:bg-transparent">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative bg-background border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-12 w-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Participants</h3>
                <ul className="space-y-3 mb-8">
                  {[
                    "Solve challenging algorithmic problems",
                    "Compete in real-time global contests",
                    "Analyze performance with detailed analytics",
                    "Earn badges and showcase your profile",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Join as Developer
                </Button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/10 to-red-500/10 rounded-3xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative bg-background border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-12 w-12 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Creators</h3>
                <ul className="space-y-3 mb-8">
                  {[
                    "Create custom contests for your organization",
                    "Access a vast library of problem sets",
                    "Automated judging and plagiarism detection",
                    "Comprehensive leaderboard management",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Start Hosting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

        <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground">
              Built for speed, reliability, and experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Execution",
                desc: "Lightning fast code execution in isolated environments.",
                icon: Zap,
              },
              {
                title: "Global Community",
                desc: "Connect with developers from around the world.",
                icon: Globe,
              },
              {
                title: "Advanced Analytics",
                desc: "Deep dive into your coding patterns and improvements.",
                icon: Cpu,
              },
              {
                title: "Team Contests",
                desc: "Participate in ICPC-style team competitions.",
                icon: Users,
              },
              {
                title: "Editor Support",
                desc: "Monaco-based editor with Vim/Emacs keybindings.",
                icon: Code2,
              },
              {
                title: "Fair Play",
                desc: "Advanced cheat detection systems ensure fair rankings.",
                icon: Trophy,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-colors"
              >
                <feature.icon className="h-8 w-8 mb-4 text-foreground/80" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                  <Code2 className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">
                  CodeArena
                </span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                The next generation competitive programming platform. Built for
                the community, by the community.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contests
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Problem Set
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Gym
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>&copy; 2026 CodeArena Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://x.com/quantapar" className="hover:text-foreground">
                Twitter
              </a>
              <a href="https://github.com/quantapar" className="hover:text-foreground">
                GitHub
              </a>
              <a href="https://discord.gg/quantapar" className="hover:text-foreground">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

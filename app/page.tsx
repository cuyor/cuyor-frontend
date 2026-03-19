"use client";

import { useRef } from "react";
import {
  EyeOpenIcon,
  CursorArrowIcon,
  RocketIcon,
  CheckIcon,
  Cross2Icon,
  Pencil1Icon,
  ReaderIcon,
  CodeIcon,
  ChevronRightIcon,
  TwitterLogoIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";

import CuyorIcon from "@/components/ui/cuyor-icon";
import { Highlighter } from "@/components/ui/highlighter";
import { WordRotate } from "@/components/ui/word-rotate";
import WindowAnimation from "@/components/ui/window-animation";
import CuyorToolbar from "@/components/ui/cuyor-toolbar";
import { Kbd } from "@/components/ui/kbd";
import { MousePointer, MousePointer2, Pointer, ScanEye } from "lucide-react";

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="w-full border-b border-[--border-secondary] px-8 sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <CuyorIcon size={20} />
            <div className="font-bold text-xl text-foreground">Cuyor</div>
          </div>
          <nav className="md:flex hidden items-center gap-10 text-sm">
            <a
              href="#features"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#how"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <a
              href="#resources"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Resources
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="hidden md:block text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Login
            </a>
            <div className="flex items-center justify-center px-5 h-9 bg-foreground text-background rounded-md cursor-pointer text-sm font-medium hover:bg-foreground/90 transition-colors">
              Try Cuyor
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className="w-full border-b border-[--border-secondary] px-8 bg-background">
        <div className="flex items-center justify-between h-10 max-w-7xl mx-auto text-xs text-foreground/60">
          <span>Product</span>
          <a
            href="#"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Explore here <ChevronRightIcon className="w-3 h-3" />
          </a>
        </div>
      </div>

      <main className="w-full">
        {/* Hero Section */}
        <section className="px-8 py-20 max-w-7xl mx-auto min-h-[75vh] flex items-center">
          <div className="flex items-center justify-between gap-16 w-full">
            <div className="flex-1 max-w-xl">
              <h1 className="text-5xl leading-tight mb-4">
                <span className="block">Meet your</span>
                <WordRotate
                  className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/50 font-bold"
                  words={["expert", "mentor", "helper", "cursor"]}
                />
              </h1>
              <p className="text-base text-foreground/70 mb-8 leading-relaxed">
                Tackle any{" "}
                <Highlighter action="highlight" color="#FFEEDD">
                  complex interface
                </Highlighter>{" "}
                with Cuyor. Stop searching for buttons.{" "}
                <Highlighter action="underline" color="#C57B57">
                  Get visual guidance
                </Highlighter>{" "}
                on exactly where to click next.
              </p>

              {/* Search Input */}
              <form className="border border-[--border-primary] rounded-3xl pl-4 pr-2 py-2 flex items-center gap-2 max-w-md mb-4 bg-white">
                <input
                  placeholder="Enter you email"
                  autoComplete="off"
                  className="outline-none border-none w-full bg-transparent resize-none overflow-hidden text-sm leading-normal"
                  style={{ maxHeight: "120px" }}
                  type="email"
                  required
                />
                <button className="bg-primary text-white px-4 h-7 rounded-full btn-shadow cursor-pointer shrink-0 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1">
                  Join Waitlist <ChevronRightIcon className="w-3 h-3" />
                </button>
              </form>

              {/* Quick Action Pills */}
              <div className="flex gap-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[--border-secondary] rounded-full text-xs text-foreground/70 hover:border-primary/50 cursor-pointer transition-colors bg-white">
                  <Pencil1Icon className="w-3 h-3" />
                  <span>Navigate</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[--border-secondary] rounded-full text-xs text-foreground/70 hover:border-primary/50 cursor-pointer transition-colors bg-white">
                  <ReaderIcon className="w-3 h-3" />
                  <span>Learn</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[--border-secondary] rounded-full text-xs text-foreground/70 hover:border-primary/50 cursor-pointer transition-colors bg-white">
                  <CodeIcon className="w-3 h-3" />
                  <span>Automate</span>
                </div>
              </div>

              <p className="pl-2 text-xs text-foreground/70">
                Works on{"  "}
                <Highlighter action="highlight" color="#FFEEDD">
                  macOS 10.14+
                </Highlighter>{" "}
                . Takes 2 minutes to install. Use <Kbd>Ctrl</Kbd> +{" "}
                <Kbd>Shift</Kbd> To Invoke Cuyor.
              </p>
            </div>

            {/* Animation */}
            <div className="flex-1 hidden lg:flex items-center justify-center">
              <WindowAnimation />
            </div>
          </div>
        </section>

        {/* Features Overview Section - Claude Style */}
        <section
          id="features"
          className="px-8 py-24 border-t border-[--border-secondary]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16">
              {/* Left side - Feature list */}
              <div className="flex-1 max-w-sm">
                <div className="space-y-8">
                  <div className="border-t border-[--border-secondary] pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <ScanEye className="w-5 h-5 text-primary mt-0.5" />
                      <h3 className="font-semibold text-foreground">
                        See your interface clearly
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed pl-8">
                      Cuyor uses advanced local vision models to understand your
                      screen exactly like you do. No cloud processing, fully
                      private.
                    </p>
                  </div>

                  <div className="border-t border-[--border-secondary] pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <MousePointer2 className="w-5 h-5 text-primary mt-0.5" />
                      <h3 className="font-semibold text-foreground">
                        Guide, don&apos;t take over
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed pl-8">
                      Cuyor shows you exactly where to click with a pulsing
                      visual indicator. You stay in full control of your
                      workflow.
                    </p>
                  </div>

                  <div className="border-t border-[--border-secondary] pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <RocketIcon className="w-5 h-5 text-primary mt-0.5" />
                      <h3 className="font-semibold text-foreground">
                        Works everywhere
                      </h3>
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed pl-8">
                      Like an expert in your pocket, collaborating with Cuyor
                      expands what you can build on your own or with teams.
                    </p>
                  </div>

                  <div className="border-t border-[--border-secondary] pt-6"></div>
                </div>
              </div>

              {/* Right side - Mind map visualization */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-full max-w-lg aspect-square">
                  {/* Center logo */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                    <CuyorIcon size={24} />
                    <span className="font-bold text-lg text-foreground">
                      Cuyor
                    </span>
                  </div>

                  {/* Category labels positioned around */}
                  <span className="absolute top-[15%] left-[20%] text-xs text-foreground/50">
                    Figma
                  </span>
                  <span className="absolute top-[10%] left-[50%] text-xs text-foreground/50">
                    VS Code
                  </span>
                  <span className="absolute top-[20%] right-[15%] text-xs text-foreground/70 font-medium">
                    AWS Console
                  </span>
                  <span className="absolute top-[35%] left-[10%] text-xs text-foreground/50">
                    Design
                  </span>
                  <span className="absolute top-[40%] right-[10%] text-xs text-foreground/70 font-medium">
                    GitHub
                  </span>
                  <span className="absolute top-[55%] left-[5%] text-xs text-foreground/50">
                    Components
                  </span>
                  <span className="absolute top-[60%] right-[5%] text-xs text-foreground/50">
                    Documentation
                  </span>
                  <span className="absolute bottom-[35%] left-[15%] text-xs text-foreground/70 font-medium">
                    Slack
                  </span>
                  <span className="absolute bottom-[30%] right-[20%] text-xs text-foreground/50">
                    Settings
                  </span>
                  <span className="absolute bottom-[15%] left-[25%] text-xs text-foreground/50">
                    Notion
                  </span>
                  <span className="absolute bottom-[10%] left-[50%] text-xs text-foreground/70 font-medium">
                    Terminal
                  </span>
                  <span className="absolute bottom-[20%] right-[15%] text-xs text-foreground/50">
                    Preferences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Switching CTA Banner */}
        <section className="px-8 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[--border-secondary] p-8 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                New to macOS productivity tools?
              </h3>
              <p className="text-sm text-foreground/60">
                Start with Cuyor and master any interface in minutes.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
              Get Started
            </button>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="px-8 py-24 border-t border-[--border-secondary]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Cuyor tiers
              </h2>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Basic Plan */}
              <div className="p-6 rounded-xl bg-white border border-[--border-secondary] hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">
                    Basic
                  </h3>
                  <p className="text-foreground/60 text-sm mb-3">
                    Free forever for personal use
                  </p>
                  <div className="flex gap-2 text-xs text-foreground/50">
                    <span>Local processing</span>
                    <span>•</span>
                    <span>Basic guidance</span>
                    <span>•</span>
                    <span>All macOS apps</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-4 py-2 border border-[--border-secondary] rounded-md text-sm text-foreground hover:border-foreground/30 transition-colors">
                  Download <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Standard Plan */}
              <div className="p-6 rounded-xl bg-white border border-[--border-secondary] hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">
                    Standard
                  </h3>
                  <p className="text-foreground/60 text-sm mb-3">
                    Powerful and versatile, designed for the work you do every
                    day
                  </p>
                  <div className="flex gap-2 text-xs text-foreground/50">
                    <span>Advanced vision</span>
                    <span>•</span>
                    <span>Priority support</span>
                    <span>•</span>
                    <span>Code assistance</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-4 py-2 border border-[--border-secondary] rounded-md text-sm text-foreground hover:border-foreground/30 transition-colors">
                  Details <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Max Plan */}
              <div className="p-6 rounded-xl bg-white border border-[--border-secondary] hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">
                    Max
                  </h3>
                  <p className="text-foreground/60 text-sm mb-3">
                    Enterprise model for teams and professionals
                  </p>
                  <div className="flex gap-2 text-xs text-foreground/50">
                    <span>Team features</span>
                    <span>•</span>
                    <span>Enterprise support</span>
                    <span>•</span>
                    <span>Custom training</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-4 py-2 border border-[--border-secondary] rounded-md text-sm text-foreground hover:border-foreground/30 transition-colors">
                  Details <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Updates Section */}
        <section
          id="resources"
          className="px-8 py-24 border-t border-[--border-secondary]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-16">
              <div className="w-64">
                <div className="flex items-start gap-3 mb-2">
                  <ReaderIcon className="w-5 h-5 text-foreground/40 mt-0.5" />
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Explore the
                    </h2>
                    <h2 className="font-semibold text-foreground">
                      latest releases
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="py-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    Cuyor v2.0 Released
                  </h3>
                  <p className="text-xs text-foreground/50 flex items-center gap-1">
                    <RocketIcon className="w-3 h-3" /> Announcement
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    macOS Sequoia Support
                  </h3>
                  <p className="text-xs text-foreground/50 flex items-center gap-1">
                    <RocketIcon className="w-3 h-3" /> Announcement
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    Cuyor can now connect to your apps
                  </h3>
                  <p className="text-xs text-foreground/50 flex items-center gap-1">
                    <CodeIcon className="w-3 h-3" /> Product
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    Code assistance module
                  </h3>
                  <p className="text-xs text-foreground/50 flex items-center gap-1">
                    <CodeIcon className="w-3 h-3" /> Product
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    Cuyor takes navigation to new places
                  </h3>
                  <p className="text-xs text-foreground/50 flex items-center gap-1">
                    <ReaderIcon className="w-3 h-3" /> Research
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-16 bg-foreground text-white/80 border-t border-foreground/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8 mb-12">
            {/* Logo and Search */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <CuyorIcon size={20} />
                <span className="font-bold text-white">Cuyor</span>
              </div>
              <div className="border border-white/20 rounded-3xl pl-4 pr-2 py-2 flex items-center gap-2 max-w-xs mb-4">
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Enter your email"
                  className="outline-none border-none w-full bg-transparent text-sm text-white placeholder:text-white/40"
                />
                <button className="bg-primary text-white px-3 h-6 rounded-full text-xs shrink-0">
                  <ChevronRightIcon className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/20 rounded-full text-xs text-white/60">
                  <Pencil1Icon className="w-3 h-3" /> Navigate
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/20 rounded-full text-xs text-white/60">
                  <ReaderIcon className="w-3 h-3" /> Learn
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/20 rounded-full text-xs text-white/60">
                  <CodeIcon className="w-3 h-3" /> Code
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white text-xs mb-4">
                Products
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cuyor
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Basic plan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Standard plan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Max plan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Download app
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-xs mb-4">
                Features
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Vision models
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    App integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Code assistance
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Team features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-xs mb-4">
                Resources
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Use cases
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-xs mb-4">Company</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex items-center justify-between">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Cuyor. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <TwitterLogoIcon className="w-4 h-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
              <GitHubLogoIcon className="w-4 h-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
              <LinkedInLogoIcon className="w-4 h-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      <CuyorToolbar />
    </div>
  );
}

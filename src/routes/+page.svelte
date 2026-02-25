<svelte:head>
    <title>Akash Pramod Kumar — Software Engineer</title>
    <meta property="og:title" content="Akash Pramod Kumar — Software Engineer" />
    <meta property="og:description" content="Software Engineer at Microsoft (Azure SLB). UTK CS alum. Building network infrastructure, embedded systems, and accessible technology." />
    <meta property="og:type" content="website" />
</svelte:head>

<script lang="ts">
    import { base } from '$app/paths';

    const skills = ['C++', 'C', 'Rust', 'Python', 'JavaScript', 'C#', 'Kotlin', 'React', 'Docker', 'SQL', 'Azure', 'Git', 'Figma', 'AI/ML', 'Embedded Systems', 'SvelteKit'];
    const rainbow = ['#61BB46', '#FDB827', '#F5821F', '#E03A3E', '#963D97', '#009DDC'];
</script>

<div class="max-w-3xl mx-auto px-6 py-16 md:py-24">
    <!-- Hero -->
    <section class="mb-16">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
            Akash Pramod Kumar
        </h1>
        <p class="mt-3 text-lg font-mono text-primary">Software Engineer @ Microsoft</p>
        <p class="mt-6 text-base-content/80 leading-relaxed max-w-xl">
            Software engineer on Azure's networking team, building cloud
            infrastructure and programmable switches. Previously a
            researcher in neuromorphic computing and robotics at UTK.
            Currently exploring agentic AI tooling on the side. I gravitate
            toward systems programming, embedded hardware, and accessible design.
        </p>

        <!-- Social buttons -->
        <div class="flex gap-3 mt-6">
            <a
                href="https://github.com/apramodk"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-base-200 border border-base-300 text-sm font-medium
                       shadow-btn-retro hover:shadow-none hover:translate-y-px
                       transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
            </a>
            <a
                href="https://linkedin.com/in/apramodk"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-base-200 border border-base-300 text-sm font-medium
                       shadow-btn-retro hover:shadow-none hover:translate-y-px
                       transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
            </a>
        </div>
    </section>

    <!-- Education -->
    <section class="mb-16">
        <h2 class="text-xl font-semibold mb-6"><span class="rainbow-underline">Education</span></h2>
        <div class="flex gap-4">
            <div class="w-1 rounded-full bg-apple-blue shrink-0"></div>
            <div>
                <p class="font-semibold">Bachelor of Science in Computer Science</p>
                <p class="text-sm text-primary font-mono">University of Tennessee at Knoxville</p>
                <p class="text-xs text-base-content/50 mt-0.5">May 2024 &middot; Knoxville, TN</p>
            </div>
        </div>
    </section>

    <!-- Experience -->
    <section class="mb-16">
        <h2 class="text-xl font-semibold mb-6"><span class="rainbow-underline">Experience</span></h2>
        <div class="space-y-6">
            <div class="flex gap-4">
                <div class="w-1 rounded-full bg-apple-green shrink-0"></div>
                <div>
                    <p class="font-semibold">Software Engineer</p>
                    <p class="text-sm text-primary font-mono">Microsoft &middot; SLB, SDN/ANS</p>
                    <p class="text-xs text-base-content/50 mt-0.5">Jul 2024 &ndash; Present &middot; Redmond, WA</p>
                    <p class="text-sm text-base-content/70 mt-2">
                        Container networking and programmable switch integration for Azure.
                        SoC agent development, sandbox environments, and on-call reliability.
                    </p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-1 rounded-full bg-apple-yellow shrink-0"></div>
                <div>
                    <p class="font-semibold">Undergraduate Research Assistant</p>
                    <p class="text-sm text-primary font-mono">Dr. Zhao Robotics Lab, UTK</p>
                    <p class="text-xs text-base-content/50 mt-0.5">Nov 2023 &ndash; Jun 2024 &middot; Knoxville, TN</p>
                    <p class="text-sm text-base-content/70 mt-2">
                        Pepper Robot development for customer service. Built Python libraries for OpenAI integration.
                    </p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-1 rounded-full bg-apple-orange shrink-0"></div>
                <div>
                    <p class="font-semibold">Undergraduate Research Assistant</p>
                    <p class="text-sm text-primary font-mono">TennLab, UTK</p>
                    <p class="text-xs text-base-content/50 mt-0.5">May 2023 &ndash; Nov 2023 &middot; Knoxville, TN</p>
                    <p class="text-sm text-base-content/70 mt-2">
                        Neuromorphic computing research. Spiking neural network simulation on Raspberry Pi and PiCAN hardware.
                    </p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-1 rounded-full bg-apple-red shrink-0"></div>
                <div>
                    <p class="font-semibold">Digital Applications Intern, Developer I</p>
                    <p class="text-sm text-primary font-mono">Pilot Company</p>
                    <p class="text-xs text-base-content/50 mt-0.5">May 2022 &ndash; Nov 2023 &middot; Knoxville, TN</p>
                    <p class="text-sm text-base-content/70 mt-2">
                        Full-stack web and Android development. React, .NET, and Kotlin during a tech stack migration.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills -->
    <section class="mb-16">
        <h2 class="text-xl font-semibold mb-4"><span class="rainbow-underline">Technologies</span></h2>
        <div class="flex flex-wrap gap-2">
            {#each skills as skill, i}
                <span
                    class="px-3 py-1 rounded-full bg-base-200 border border-base-300 text-xs font-mono"
                    style="border-left: 3px solid {rainbow[i % 6]}"
                >{skill}</span>
            {/each}
        </div>
    </section>

    <!-- Finder Window -->
    <section>
        <div class="rounded-window bg-base-100 border border-base-300 shadow-window overflow-hidden">
            <!-- Title bar -->
            <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
                <div class="flex gap-1.5" aria-hidden="true">
                    <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                    <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                    <span class="w-3 h-3 rounded-full bg-mac-green"></span>
                </div>
                <span class="flex-1 text-center text-xs font-mono opacity-50">~/Projects</span>
                <div class="w-[54px]"></div>
            </div>
            <!-- Finder rows -->
            <nav class="divide-y divide-base-300">
                <a
                    href="{base}/HCI"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors group"
                >
                    <span class="text-lg" aria-hidden="true">&#128193;</span>
                    <div class="flex-1">
                        <p class="font-medium text-sm group-hover:text-primary transition-colors">HCI &amp; Embedded Systems</p>
                        <p class="text-xs opacity-50">Capacitive touch games, IoT plant monitor, IMU glove drone controller</p>
                    </div>
                    <span class="text-xs opacity-30 font-mono">4 items</span>
                </a>
                <a
                    href="{base}/software"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors group"
                >
                    <span class="text-lg" aria-hidden="true">&#128193;</span>
                    <div class="flex-1">
                        <p class="font-medium text-sm group-hover:text-primary transition-colors">Software Projects</p>
                        <p class="text-xs opacity-50">AI coding assistant, macOS backup tool, political transparency extension</p>
                    </div>
                    <span class="text-xs opacity-30 font-mono">5 items</span>
                </a>
                <a
                    href="{base}/research"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors group"
                >
                    <span class="text-lg" aria-hidden="true">&#128193;</span>
                    <div class="flex-1">
                        <p class="font-medium text-sm group-hover:text-primary transition-colors">Research</p>
                        <p class="text-xs opacity-50">Neuromorphic computing, spiking neural networks, robotics</p>
                    </div>
                    <span class="text-xs opacity-30 font-mono">2 items</span>
                </a>
            </nav>
        </div>
    </section>
</div>

<svelte:head>
    <title>Research — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    const research = [
        {
            title: 'Dr. Zhao Robotics Lab',
            institution: 'University of Tennessee at Knoxville',
            role: 'Undergraduate Research Assistant',
            period: 'Nov 2023 – Jun 2024',
            location: 'Knoxville, TN',
            description: 'Worked on deploying the Pepper Robot for customer service applications, exploring how humanoid robots can assist in real-world interactions. Built a Python library for making API calls to OpenAI due to outdated infrastructure in the lab. Authored environment setup documentation to streamline onboarding for new research assistants.',
            topics: ['Robotics', 'Human-Robot Interaction', 'OpenAI', 'Python'],
            active: false
        },
        {
            title: 'TennLab',
            institution: 'University of Tennessee at Knoxville',
            role: 'Undergraduate Research Assistant',
            period: 'May 2023 – Nov 2023',
            location: 'Knoxville, TN',
            description: 'Conducted research on neuromorphic computing applied to engine control systems, using spiking neural networks to reduce misfires. Resolved a communication error between the CAN bus interface and the training model. Built a hardware simulation using Raspberry Pi and PiCAN boards for training and testing spiking neural networks.',
            topics: ['Neuromorphic Computing', 'Spiking Neural Networks', 'CAN Bus', 'Raspberry Pi', 'Embedded Systems'],
            active: false
        }
    ];
</script>

<div class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">Research</h1>
        <p class="mt-2 text-base-content/60 font-mono text-sm">Neuromorphic computing, robotics, and human-computer interaction</p>
    </header>

    <div class="space-y-8">
        {#each research as r}
            <div class="rounded-window bg-base-100 border border-base-300 shadow-window overflow-hidden">
                <!-- Title bar -->
                <div class="flex items-center gap-2 px-4 py-2.5 bg-base-200 border-b border-base-300">
                    <div class="flex gap-1.5" aria-hidden="true">
                        <span class="w-3 h-3 rounded-full bg-mac-red"></span>
                        <span class="w-3 h-3 rounded-full bg-mac-yellow"></span>
                        <span class="w-3 h-3 rounded-full bg-mac-green"></span>
                    </div>
                    <span class="flex-1 text-center text-xs font-mono opacity-50 truncate">{r.title}</span>
                    <div class="w-[54px]"></div>
                </div>
                <!-- Body -->
                <div class="p-6">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-4">
                        <div>
                            <h2 class="text-lg font-semibold">{r.title}</h2>
                            <p class="text-sm text-primary font-mono">{r.institution}</p>
                            <p class="text-xs text-base-content/50 mt-0.5">{r.role}</p>
                        </div>
                        <p class="text-xs text-base-content/50 font-mono shrink-0">{r.period} &middot; {r.location}</p>
                    </div>

                    <p class="text-sm text-base-content/70 leading-relaxed">{r.description}</p>

                    <div class="flex flex-wrap gap-1.5 mt-4">
                        {#each r.topics as topic}
                            <span class="px-2 py-0.5 rounded-full bg-base-200 border border-base-300 text-xs font-mono">{topic}</span>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

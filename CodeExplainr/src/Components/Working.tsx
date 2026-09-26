import { ArrowRight, CheckCircle2, Code2, ExternalLink, KeyRound, MessageCircle, Mic, Play, Sparkles, Volume2 } from "lucide-react";

interface WorkingProps {
    onGetStarted: () => void;
}

const steps = [
    {
        icon: <KeyRound size={18} />,
        title: "Create a Gemini API key",
        description: (
            <>
                Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-lime-300 underline decoration-lime-300/40 underline-offset-4 hover:text-white">Google AI Studio <ExternalLink size={13} /></a>, create a key, and keep it private.
            </>
        ),
    },
    {
        icon: <CheckCircle2 size={18} />,
        title: "Paste it in and test it",
        description: <>Enter your key in the workspace and select <strong className="text-white">Test API key</strong>. A valid status unlocks the AI-powered actions.</>,
    },
    {
        icon: <Code2 size={18} />,
        title: "Add the code you want to understand",
        description: <>Paste a snippet or upload a supported source file, then choose its programming language.</>,
    },
    {
        icon: <Sparkles size={18} />,
        title: "Format for a clearer walkthrough",
        description: <>Use <strong className="text-white">Format Code</strong> to tidy the snippet before generating its explanation. This step is optional.</>,
    },
    {
        icon: <Mic size={18} />,
        title: "Start the voice explanation",
        description: <>Select <strong className="text-white">Start Voice Explanation</strong> to follow the code's flow as it is narrated, with the active line highlighted.</>,
    },
    {
        icon: <Volume2 size={18} />,
        title: "Control playback and ask questions",
        description: <>Play or pause, move to the previous or next line, stop, and adjust the speed from 0.5x to 2x. While narration is running, ask about the active line; type your question or use voice input.</>,
    },
];

function Working({ onGetStarted }: WorkingProps) {
    return (
        <section aria-labelledby="working-heading" className="bg-[#10251b] py-14 text-white sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:gap-16">
                    <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-lime-300">A clear path from code to clarity</p>
                        <h2 id="working-heading" className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                            How CodeExplainer works
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-100/75 sm:text-base">
                            Bring a Gemini key and a piece of code. Then listen, follow along, and dig into the lines that matter to you.
                        </p>

                        <ol className="mt-9 border-l border-emerald-700/70">
                            {steps.map((step, index) => (
                                <li key={step.title} className="relative pb-7 pl-8 last:pb-0">
                                    <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-600 bg-[#10251b] text-lime-300">
                                        {step.icon}
                                    </span>
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-lime-300">Step {index + 1}</p>
                                    <h3 className="text-base font-bold text-white sm:text-lg">{step.title}</h3>
                                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-emerald-100/75">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <aside className="self-start border-l-2 border-lime-400 pl-6 lg:sticky lg:top-28">
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-lime-300">
                            <MessageCircle size={17} /> Make the explanation yours
                        </p>
                        <h3 className="text-2xl font-bold leading-snug text-white">Listen at your pace. Ask when you get curious.</h3>
                        <p className="mt-3 text-sm leading-relaxed text-emerald-100/75">
                            Replay a line, slow the narration down, or ask a question about the code in front of you. The walkthrough stays interactive from start to finish.
                        </p>
                        <button
                            type="button"
                            onClick={onGetStarted}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime-400 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
                        >
                            Open the code workspace <ArrowRight size={17} />
                        </button>
                        <p className="mt-4 flex items-center gap-2 text-xs text-emerald-100/60">
                            <Play size={13} /> Your key stays in this browser session.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
}

export default Working;

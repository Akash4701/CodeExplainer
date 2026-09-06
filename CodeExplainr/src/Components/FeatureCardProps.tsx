import React, { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  emoji?: string;
  accent?: string;
}

const FeatureCard = ({ icon, title, description, gradient, emoji, accent = "border-stone-200" }: FeatureCardProps) => (
  <div className="group rounded-xl border border-emerald-900/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 sm:p-6">
    <div className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg border ${gradient} ${accent} transition-transform duration-300 group-hover:scale-110`}>
      {icon}
      {emoji && (
        <span className="absolute -top-2 -right-2 text-base leading-none select-none">
          {emoji}
        </span>
      )}
    </div>
    <h3 className="mb-2 text-base font-bold text-emerald-950 sm:text-lg">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{description}</p>
  </div>
);

export default FeatureCard;
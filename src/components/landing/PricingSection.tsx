import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    color: "bg-white",
    border: "border-blueStroke/30",
    buttonClass: "bg-blue text-white hover:bg-darkBlue",
    features: [
      "1 child profile",
      "Up to 3 word lists",
      "Basic spelling practice",
      "Voice pronunciation guide",
      "Progress dashboard",
    ],
    highlight: false,
  },
  {
    name: "Family",
    price: "$4.99",
    period: "per month",
    description: "Best for growing families",
    color: "bg-blue",
    border: "border-blue",
    buttonClass: "bg-white text-blue hover:bg-lightBlue",
    features: [
      "Up to 5 child profiles",
      "Unlimited word lists",
      "All practice modes",
      "Weekly progress reports",
      "Badges & rewards",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "School",
    price: "$9.99",
    period: "per month",
    description: "Designed for classrooms",
    color: "bg-white",
    border: "border-blueStroke/30",
    buttonClass: "bg-blue text-white hover:bg-darkBlue",
    features: [
      "Unlimited student profiles",
      "Teacher dashboard",
      "Bulk word list import",
      "Class-wide analytics",
      "Curriculum-aligned content",
      "Dedicated support",
    ],
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] text-center mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-darkGray text-center text-base mb-14 max-w-xl mx-auto">
          Start free, upgrade whenever you&apos;re ready. No hidden fees, cancel anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 ${plan.border} ${plan.color} p-8 flex flex-col shadow-lg ${plan.highlight ? "scale-105 shadow-2xl" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FFC820] text-[#1a3a6b] text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-[#1a3a6b]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-white/70" : "text-darkGray"}`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-[#1a3a6b]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-white/70" : "text-darkGray"}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? "bg-white/20" : "bg-green"}`}>
                      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                        <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-white/90" : "text-darkGray"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-in"
                className={`block text-center py-3 px-6 rounded-full font-bold text-sm transition-all shadow hover-scale ${plan.buttonClass}`}
              >
                {plan.name === "Free" ? "Get Started Free" : `Start ${plan.name} Plan`}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-darkGray text-sm mt-10">
          All paid plans include a <span className="font-semibold text-[#1a3a6b]">14-day free trial</span>. No credit card required to start.
        </p>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";

const bullets = [
  "Kids who use IzzySpell improve their test scores within the first week",
  "Weekly reports with usage & badges to track your child's progress",
  "Track learning milestones and weekly achievements easily",
  "Identify challenging words and focus on areas that need improvement",
];

export default function ResultsSection() {
  return (
    <section id="results" className="bg-white py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mb-6">
            See Real Results in Just Weeks!
          </h2>
          <ul className="space-y-4 mb-8">
            {bullets.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-darkGray text-sm">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green flex items-center justify-center">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                    <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/sign-in" className="inline-block bg-blue text-white px-7 py-3 rounded-full font-semibold text-sm shadow-md hover:bg-darkBlue hover-scale transition-all">
            See More
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/images/LandingPage/results-dashboard.png"
            alt="Real Results"
            width={500}
            height={400}
            className="w-full max-w-md h-auto rounded-2xl shadow-xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}

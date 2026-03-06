const testimonials = [
  {
    initials: "SM",
    avatarBg: "bg-[#4793FE]",
    name: "Sarah M.",
    role: "Parent",
    rating: 5,
    text: "This app makes my daughter fall in love with learning spelling! She asks to practice every single day now.",
  },
  {
    initials: "JT",
    avatarBg: "bg-[#57AE0C]",
    name: "James T.",
    role: "Teacher",
    rating: 5,
    text: "This app makes my daughter fall in love with spelling! The progress tracking gives me real insight into each student's strengths.",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-lightBlue py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] text-center mb-14">
          Loved by Parents &amp; Teachers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-8 shadow-lg border border-blueStroke/20 hover-scale">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="#FFC820" className="w-5 h-5">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-darkGray text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`${t.avatarBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-[#1a3a6b] text-sm">{t.name}</p>
                  <p className="text-textColor text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-navy-brand mb-4">
          About <span className="text-teal-brand">GOJO</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Ethiopia&apos;s trusted real estate platform. GOJO connects buyers, sellers, and renters with verified properties across Addis Ababa and beyond.
        </p>
      </div>

      {/* Mission */}
      <section className="bg-navy-brand rounded-2xl p-8 text-white mb-10">
        <h2 className="text-teal-brand font-semibold text-sm uppercase tracking-wider mb-3">Our Mission</h2>
        <p className="text-gray-200 text-lg leading-relaxed">
          To make real estate in Ethiopia transparent, accessible, and stress-free — for everyone. We combine modern technology with local expertise to guide you through every step of your property journey, from Addis Ababa to Dire Dawa.
        </p>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { icon: '🤝', title: 'Trust', body: 'Every listing is verified and every property owner is vetted so you can search with confidence.' },
          { icon: '🔍', title: 'Transparency', body: 'No hidden fees, no surprises. We show you everything you need to make an informed decision.' },
          { icon: '⚡', title: 'Speed', body: 'Real-time updates mean you never miss a new listing or a price change.' },
        ].map(({ icon, title, body }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="text-navy-brand font-bold mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Ethiopia focus */}
      <section className="text-center">
        <h2 className="text-navy-brand font-bold text-xl mb-3">Built for Ethiopia</h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Our team of engineers and real estate professionals are dedicated to building the best property platform in Ethiopia. We are headquartered in Addis Ababa and serve clients across the country.
        </p>
      </section>
    </div>
  );
}

import Link from 'next/link';

const services = [
  {
    icon: '🏡',
    title: 'Buy',
    description:
      'Find your dream home from thousands of verified listings. Our agents guide you from search to closing, making the buying process smooth and transparent.',
    cta: 'Browse Listings',
    href: '/listings',
  },
  {
    icon: '💰',
    title: 'Sell',
    description:
      'List your property with GOJO and reach a wide audience of qualified buyers. We handle marketing, showings, and negotiations on your behalf.',
    cta: 'List Your Property',
    href: '/agent/listings/new',
  },
  {
    icon: '🔑',
    title: 'Rent',
    description:
      'Discover rental properties that fit your lifestyle and budget. From city apartments to suburban homes, we have options for every renter.',
    cta: 'Find Rentals',
    href: '/listings?propertyType=Apartment',
  },
  {
    icon: '📋',
    title: 'Manage',
    description:
      'Let GOJO handle the day-to-day management of your investment properties — tenant screening, maintenance coordination, and rent collection.',
    cta: 'Learn More',
    href: '/about',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-navy-brand mb-4">
          Our <span className="text-teal-brand">Services</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Whether you&apos;re buying, selling, renting, or managing — GOJO has you covered at every stage of your real estate journey in Ethiopia.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {services.map(({ icon, title, description, cta, href }) => (
          <div
            key={title}
            className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="text-4xl mb-4">{icon}</div>
            <h2 className="text-navy-brand font-bold text-xl mb-3">{title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed flex-1">{description}</p>
            <div className="mt-6">
              <Link
                href={href}
                className="inline-block bg-teal-brand hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <div className="mt-14 bg-navy-brand rounded-2xl p-10 text-center">
        <h2 className="text-white text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-gray-300 mb-6 max-w-md mx-auto text-sm">
          Create a free account and find your perfect property in Ethiopia today.
        </p>
        <Link
          href="/register"
          className="inline-block bg-teal-brand hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

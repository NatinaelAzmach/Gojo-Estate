import PostPropertyForm from '@/components/PostPropertyForm';

export default function PostPropertyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a Property</h1>
        <p className="text-gray-500 text-sm mb-8">Your listing will be reviewed by an admin before going live.</p>
        <PostPropertyForm />
      </div>
    </main>
  );
}

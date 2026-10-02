'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface College {
  id: string;
  name: string;
  domain: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/proxy/colleges')
      .then((r) => r.json())
      .then(setColleges)
      .catch(() => setError('Failed to load colleges'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? 'Signup failed');
      }

      const devOtp = typeof data?.devOtp === 'string' ? `&otp=${encodeURIComponent(data.devOtp)}` : '';
      router.push(`/verify?email=${encodeURIComponent(form.email)}${devOtp}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">College</label>
          <select
            value={form.collegeId}
            onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          >
            <option value="">Select your college</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">College email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@college.edu"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-400 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
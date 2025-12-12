import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* --- NAVBAR --- */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 tracking-tighter">
          MySaaS<span className="text-gray-900">Kit</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Bangun SaaS Impian Anda <br />
          <span className="text-blue-600">Dalam Waktu Singkat.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Boilerplate lengkap dengan React, Node.js, Prisma, dan Stripe. 
          Hemat waktu 200+ jam pengembangan dan fokus pada jualan.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Mulai Sekarang 🚀
          </Link>
          <a
            href="#pricing"
            className="bg-gray-100 text-gray-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition"
          >
            Lihat Harga
          </a>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Authentication", desc: "Login & Register aman dengan JWT dan Hash Password." },
              { title: "Stripe Payment", desc: "Integrasi langganan bulanan/tahunan siap pakai." },
              { title: "Database Ready", desc: "Menggunakan Prisma ORM & PostgreSQL yang scalable." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Harga Sederhana</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 border border-gray-200 rounded-3xl">
              <h3 className="text-xl font-bold text-gray-500">Starter</h3>
              <div className="text-4xl font-extrabold my-4">$0</div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li>✅ Akses Dashboard</li>
                <li>✅ Fitur Dasar</li>
              </ul>
              <Link to="/register" className="block w-full py-3 text-center border border-gray-300 rounded-xl font-bold hover:bg-gray-50">
                Daftar Gratis
              </Link>
            </div>
            {/* Pro */}
            <div className="p-8 bg-gray-900 text-white rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-xl font-bold text-gray-300">Pro</h3>
              <div className="text-4xl font-extrabold my-4">$10 <span className="text-lg text-gray-500 font-normal">/bulan</span></div>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li>✅ Semua Fitur Starter</li>
                <li>✅ Prioritas Support</li>
                <li>✅ Akses API Unlimited</li>
              </ul>
              <Link to="/register" className="block w-full py-3 text-center bg-blue-600 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-900/50">
                Beli Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-500">
        <p>© 2025 MySaaS Kit. Built by You.</p>
      </footer>
    </div>
  );
}
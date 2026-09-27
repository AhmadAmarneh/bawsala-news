export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">CMS</h2>
        <nav>
          <ul className="space-y-4">
            <li><a href="/dashboard" className="hover:text-blue-400">Overview</a></li>
            <li><a href="/dashboard/sources" className="hover:text-blue-400">Sources</a></li>
            <li><a href="/dashboard/editor" className="hover:text-blue-400">Write Article</a></li>
            <li><a href="/" className="hover:text-blue-400 mt-8 block">← Back to Site</a></li>
            <li>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-red-400 hover:text-red-300 w-full text-left">Logout</button>
              </form>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Welcome to the CMS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-blue-600">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-green-600">142</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Exclusive Pieces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-purple-600">12</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <a href="/dashboard/editor" className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">Write New Article</a>
          <a href="/api/cron/fetch-news" target="_blank" className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Run Aggregator (Test)</a>
        </div>
      </div>
    </div>
  );
}

export default function MCPDocsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <header>
        <h1 className="text-3xl font-display font-bold">MCP Integration</h1>
        <p className="text-ink-500 mt-2 text-sm">
          Tài liệu hướng dẫn website doanh nghiệp đấu nối vào Socialplan Platform thông qua endpoint MCP-compatible.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-2">Endpoint</h2>
        <pre className="bg-ink-50 p-3 rounded-card text-sm overflow-x-auto"><code>POST https://happycandlevn-2257.vercel.app/api/mcp</code></pre>
        <p className="text-sm text-ink-600 mt-3">
          Header bắt buộc: <code className="bg-ink-100 px-1.5 py-0.5 rounded text-xs">X-Socialplan-Token: &lt;MCP_INTEGRATION_TOKEN&gt;</code>
        </p>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-2">Hỗ trợ JSON-RPC 2.0</h2>
        <p className="text-sm text-ink-600 mb-3">3 methods: <code>initialize</code>, <code>tools/list</code>, <code>tools/call</code>.</p>
        <pre className="bg-ink-900 text-ink-50 p-4 rounded-card text-xs overflow-x-auto"><code>{`curl -X POST https://happycandlevn-2257.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "X-Socialplan-Token: $TOKEN" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_today_schedule",
      "arguments": {}
    }
  }'`}</code></pre>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-3">Tools available</h2>
        <div className="space-y-2 text-sm">
          {[
            { name: "list_projects", desc: "Liệt kê các brand đang quản lý" },
            { name: "list_content", desc: "Tất cả nội dung trong thư viện" },
            { name: "list_today_schedule", desc: "Bài sẽ đăng hôm nay" },
            { name: "list_campaigns", desc: "Tất cả chiến dịch" },
            { name: "get_campaign", desc: "Chi tiết chiến dịch theo slug" },
            { name: "get_analytics_summary", desc: "Tóm tắt metrics chiến dịch" },
            { name: "schedule_post", desc: "Lên lịch post (stub)" },
          ].map((t) => (
            <div key={t.name} className="flex gap-3 p-3 rounded-card bg-ink-50/60">
              <code className="text-brand-700 font-semibold whitespace-nowrap">{t.name}</code>
              <span className="text-ink-600">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-lg mb-3">Tích hợp vào website (Aniki.com)</h2>
        <ol className="text-sm text-ink-700 space-y-2 list-decimal list-inside leading-relaxed">
          <li>Thêm route <code>/api/socialplan/proxy</code> trên website, server-side forward request tới endpoint MCP ở trên (kèm token).</li>
          <li>Trên UI website (/marketing dashboard), gọi <code>tools/call</code> với name <code>list_today_schedule</code> để hiển thị nội dung hôm nay.</li>
          <li>Khi đăng bài mới từ website, gọi <code>schedule_post</code> – platform sẽ enqueue và tự đăng theo lịch.</li>
        </ol>
      </section>
    </div>
  );
}

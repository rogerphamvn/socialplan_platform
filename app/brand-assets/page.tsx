import Image from "next/image";
import { Plus, Folder, Image as ImageIcon, FileText, Video, Palette } from "lucide-react";

const folders = [
  { name: "Logo & Identity", count: 24, icon: Palette, color: "bg-amber-50 text-amber-600" },
  { name: "Sản phẩm", count: 156, icon: ImageIcon, color: "bg-rose-50 text-rose-600" },
  { name: "Video & Reels", count: 87, icon: Video, color: "bg-violet-50 text-violet-600" },
  { name: "Templates", count: 42, icon: FileText, color: "bg-sky-50 text-sky-600" },
];

const recent = [
  "photo-1617196034796-73dfa7b1fd56",
  "photo-1554995207-c18c203602cb",
  "photo-1576866206061-fee32bf06e84",
  "photo-1611143669185-af224c5e3252",
  "photo-1565299624946-b28f40a0ae38",
  "photo-1579871494447-9811cf80d66c",
  "photo-1535473895227-bdecb20fb157",
  "photo-1464349095431-e9a21285b5f3",
];

export default function BrandAssetsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Brand Assets</h1>
          <p className="text-ink-500 text-sm mt-1">Tài nguyên hình ảnh, video, template của thương hiệu</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Upload tài sản</button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {folders.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name} className="card p-5 hover:shadow-soft transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-lg ${f.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <Folder className="w-5 h-5 text-ink-300 ml-auto" />
              </div>
              <div className="font-semibold">{f.name}</div>
              <div className="text-xs text-ink-500 mt-0.5">{f.count} tệp</div>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4">Truy cập gần đây</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {recent.map((p, i) => (
            <div key={i} className="card-soft overflow-hidden">
              <div className="relative aspect-square">
                <Image src={`https://images.unsplash.com/${p}?auto=format&fit=crop&w=300&q=70`} alt="" fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

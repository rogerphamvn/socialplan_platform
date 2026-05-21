# Setup Supabase backend

> Supabase đóng vai trò **Postgres + auth + storage**. App vẫn host trên Vercel.
> Knowledge Graph + agent generation logs hiện đang lưu JSON file ở `/tmp` (Vercel ephemeral — mất khi cold start). Sau khi setup Supabase, mọi thứ persistent.

## 1. Tạo project Supabase

1. Vào https://supabase.com/dashboard/new
2. Tạo project (region khuyến nghị: **Singapore** — gần Vercel sin1)
3. Đặt mật khẩu Postgres (lưu lại)
4. Đợi ~2 phút project khởi tạo xong

## 2. Apply migration

1. Dashboard → **SQL Editor** → **New query**
2. Copy toàn bộ `supabase/migrations/001_init.sql` paste vào → bấm **Run**
3. Tab **Table Editor** xác nhận có 7 tables: `projects`, `agents`, `skills`, `generations`, `kg_edges`, `content_items`, `campaigns`

## 3. Lấy credentials

Dashboard → **Project Settings** → **API**:

| Key | Lấy từ đâu |
|---|---|
| `SUPABASE_URL` | "Project URL" (vd `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | "anon public" key (dùng cho client-side, optional) |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key (⚠️ **KHÔNG bao giờ commit hoặc paste ra public**) |

## 4. Thêm vào Vercel

1. Vercel → project `socialplan-platform` → **Settings** → **Environment Variables**
2. Thêm 3 biến trên (Environment = Production + Preview)
3. **Redeploy** (tab Deployments → ... → Redeploy)

## 5. Verify

Sau khi deploy:

```bash
curl https://socialplan-platform.vercel.app/api/kg
# response.graph.stats sẽ là từ Supabase chứ không phải JSON seed
```

Hoặc vào `/content-creator` chạy 1 generation → quay lại Supabase Table Editor → table `generations` → thấy row mới.

## Schema overview

```
projects ──< campaigns
       ─< content_items
                │
                └── generation_id ──> generations
                                    │
agents ◄─── generations ───► kg_edges
skills ◄── agents (HAS_SKILL)
```

## Migrate mock data

Hiện tại `data/mock.ts` còn hardcode. Để migrate lên Supabase:
1. Tạo file `scripts/seed-supabase.ts` chạy `INSERT` từ mock.ts
2. Update các page (Home, Campaigns, etc.) đọc từ `supabase.from("content_items").select()` thay vì import mock

Tôi sẽ làm step này khi user yêu cầu cụ thể, không tự động làm để tránh break UI hiện tại.

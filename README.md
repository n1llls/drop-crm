# Dropshipping CRM — GitHub Pages + Supabase

**Хостинг:** фронтенд на **GitHub Pages**, бэкенд (БД + авторизация) — **Supabase** (free tier).  
Красивый интерфейс (Tailwind + Framer Motion) и графики (Recharts).

## Что умеет
1. **Товары**: название, поставщик, себестоимость, цена. **Варианты** с собственными ценами/SKU.
2. **Заказы**: ФИО, телефон, адрес, город/область, перевозчик, **TTN**, статус. Позиции заказа с количеством и снимком цен.
3. **Реклама**: затраты + лиды.
4. **Статистика**: Profit, ROI, ROS, CPL по каждому товару.
5. **Логин/пароль** через Supabase Auth.

---

## Как развернуть
### 1) Создай проект в Supabase
- https://supabase.com → New project → Project URL + anon key пригодятся.
- Открой вкладку **SQL** и вставь миграцию ниже (таблицы + политики RLS). Выполни скрипт.

### 2) Настрой переменные окружения
- Скопируй `.env.example` → `.env`
- Вставь `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` из проекта.

### 3) Локально
```bash
npm install
npm run dev
```
Открой: `http://localhost:5173`  
Зарегистрируй пользователя на экране логина.

### 4) GitHub Pages деплой
- Создай репозиторий на GitHub, **положи весь код**.
- Отредактируй `vite.config.ts`: `base: '/<ИМЯ_РЕПОЗИТОРИЯ>/'`
- Добавь секреты репо: `PAGES_BRANCH=gh-pages` не нужен; используется GitHub Pages action.
- Включи **Pages**: Settings → Pages → "Deploy from a branch" / или "GitHub Actions".
- В этом проекте уже есть workflow `.github/workflows/deploy.yml`. Он соберёт сайт и выложит в Pages.

---

## SQL (Supabase): схемы + RLS
```sql
-- enable uuid extension if needed
-- create extension if not exists "uuid-ossp";

-- Tables
create table if not exists products (
  id bigint primary key generated always as identity,
  created_by uuid references auth.users(id) default auth.uid(),
  name text not null,
  supplier_name text not null,
  default_cost numeric not null default 0,
  default_price numeric not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists variants (
  id bigint primary key generated always as identity,
  created_by uuid references auth.users(id) default auth.uid(),
  product_id bigint references products(id) on delete cascade not null,
  name text not null,
  sku text,
  purchase_cost numeric not null default 0,
  sale_price numeric not null default 0,
  created_at timestamp with time zone default now()
);

create type order_status as enum ('NEW','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELED','RETURNED');

create table if not exists orders (
  id bigint primary key generated always as identity,
  created_by uuid references auth.users(id) default auth.uid(),
  customer_name text not null,
  phone text,
  address text not null,
  city text,
  region text,
  carrier text,
  ttn text,
  status order_status not null default 'NEW',
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id bigint primary key generated always as identity,
  created_by uuid references auth.users(id) default auth.uid(),
  order_id bigint references orders(id) on delete cascade not null,
  product_id bigint references products(id) not null,
  variant_id bigint references variants(id),
  quantity int not null default 1,
  purchase_cost numeric not null default 0,
  sale_price numeric not null default 0
);

create table if not exists ad_spend (
  id bigint primary key generated always as identity,
  created_by uuid references auth.users(id) default auth.uid(),
  product_id bigint references products(id) not null,
  platform text not null,
  date date not null default now(),
  amount numeric not null default 0,
  leads int not null default 0,
  notes text
);

-- RLS
alter table products enable row level security;
alter table variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ad_spend enable row level security;

create policy "own rows - select" on products
for select using (created_by = auth.uid());
create policy "own rows - insert" on products
for insert with check (created_by = auth.uid());
create policy "own rows - update" on products
for update using (created_by = auth.uid());

create policy "own rows - select" on variants
for select using (created_by = auth.uid());
create policy "own rows - insert" on variants
for insert with check (created_by = auth.uid());
create policy "own rows - update" on variants
for update using (created_by = auth.uid());

create policy "own rows - select" on orders
for select using (created_by = auth.uid());
create policy "own rows - insert" on orders
for insert with check (created_by = auth.uid());
create policy "own rows - update" on orders
for update using (created_by = auth.uid());

create policy "own rows - select" on order_items
for select using (created_by = auth.uid());
create policy "own rows - insert" on order_items
for insert with check (created_by = auth.uid());
create policy "own rows - update" on order_items
for update using (created_by = auth.uid());

create policy "own rows - select" on ad_spend
for select using (created_by = auth.uid());
create policy "own rows - insert" on ad_spend
for insert with check (created_by = auth.uid());
create policy "own rows - update" on ad_spend
for update using (created_by = auth.uid());
```

### Представления/Joins (опционально)
В UI уже делаются join'ы через `select('order_items(*, products(*), variants(*))')`.

---

## Настройка GitHub Actions
Workflow уже добавлен: `.github/workflows/deploy.yml`. Он билдит и публикует в GitHub Pages.
Если у тебя repo `n1llls/dropshipping-crm`, то:
- В `vite.config.ts` поставь `base: '/dropshipping-crm/'`
- Закомить и запушь — через пару минут сайт будет доступен на GitHub Pages.

---

## TODO идеи
- Импорт/экспорт CSV
- Канбан по статусам заказов
- Фильтры и поиск
- Роли пользователей
- PWA (иконка, офлайн-режим)

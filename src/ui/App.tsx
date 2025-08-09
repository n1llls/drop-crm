import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Products from './Products'
import Orders from './Orders'
import Stats from './Stats'
import AdSpend from './AdSpend'
import Login from './Login'

type Page = 'dashboard'|'products'|'orders'|'stats'|'adspend'

export default function App(){
  const [user, setUser] = useState<any>(null)
  const [page, setPage] = useState<Page>('dashboard')

  useEffect(()=>{
    supabase.auth.getUser().then(({ data })=> setUser(data.user))
    const sub = supabase.auth.onAuthStateChange((_e, s)=> setUser(s?.user ?? null))
    return ()=> sub.data.subscription.unsubscribe()
  },[])

  if(!user) return <Login />

  return (
    <div className="mx-auto max-w-6xl p-4">
      <header className="flex items-center justify-between py-4">
        <div className="text-xl font-bold">Dropshipping CRM</div>
        <nav className="space-x-3 text-sm">
          <button onClick={()=>setPage('dashboard')} className={btn(page==='dashboard')}>Dashboard</button>
          <button onClick={()=>setPage('products')} className={btn(page==='products')}>Products</button>
          <button onClick={()=>setPage('orders')} className={btn(page==='orders')}>Orders</button>
          <button onClick={()=>setPage('stats')} className={btn(page==='stats')}>Stats</button>
          <button onClick={()=>setPage('adspend')} className={btn(page==='adspend')}>Ad Spend</button>
          <button onClick={()=>supabase.auth.signOut()} className="underline">Logout</button>
        </nav>
      </header>

      <motion.main
        key={page}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {page==='dashboard' && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="Добро пожаловать"><div>Вы авторизованы как {user.email}</div></Card>
            <Card title="Быстрый старт"><div>Добавьте товар и создайте первый заказ</div></Card>
            <Card title="Реклама"><div>Учитывайте расходы и лиды, чтобы видеть ROI/ROS/CPL</div></Card>
          </div>
        )}
        {page==='products' && <Products />}
        {page==='orders' && <Orders />}
        {page==='stats' && <Stats />}
        {page==='adspend' && <AdSpend />}
      </motion.main>
      <footer className="text-xs text-white/60 py-8">© {new Date().getFullYear()} Dropshipping CRM</footer>
    </div>
  )
}

function Card({ title, children }:{ title: string, children: React.ReactNode }){
  return (
    <div className="rounded-2xl p-5 bg-white/5 border border-white/10">{/* subtle glass */}
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="text-white/90">{children}</div>
    </div>
  )
}

function btn(active:boolean){
  return "px-3 py-1 rounded-xl " + (active ? "bg-brand-500" : "bg-white/10 hover:bg-white/20")
}

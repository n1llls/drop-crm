import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdSpend(){
  const [rows,setRows]=useState<any[]>([])
  const [products,setProducts]=useState<any[]>([])
  const [form,setForm]=useState({ product_id:'', platform:'Google', date:'', amount:'', leads:'' })

  const load = async () => {
    const { data: r } = await supabase.from('ad_spend').select('*').order('date', { ascending:false })
    const { data: p } = await supabase.from('products').select('id,name').order('id')
    setRows(r||[]); setProducts(p||[])
  }
  useEffect(()=>{ load() }, [])

  const add = async () => {
    await supabase.from('ad_spend').insert([{
      product_id: Number(form.product_id||0),
      platform: form.platform,
      date: form.date || new Date().toISOString(),
      amount: Number(form.amount||0),
      leads: Number(form.leads||0)
    }])
    setForm({ product_id:'', platform:'Google', date:'', amount:'', leads:'' })
    load()
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Добавить расход на рекламу</h3>
        <div className="grid md:grid-cols-5 gap-2">
          <select value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2">
            <option value="">Товар</option>
            {products.map((p:any)=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Платформа" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
          <input type="date" value={form.date?.slice(0,10)||''} onChange={e=>setForm({...form,date:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
          <input placeholder="Сумма" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
          <input placeholder="Лиды" value={form.leads} onChange={e=>setForm({...form,leads:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
        </div>
        <button onClick={add} className="mt-3 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Сохранить</button>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">История расходов</h3>
        <div className="space-y-2">
          {rows.map((r:any)=>(
            <div key={r.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex justify-between text-sm">
              <div>#{r.id} · product:{r.product_id} · {new Date(r.date).toLocaleDateString()}</div>
              <div>{r.platform} · {r.amount} · leads:{r.leads}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

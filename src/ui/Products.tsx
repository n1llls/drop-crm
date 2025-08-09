import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = { id:number; name:string; supplier_name:string; default_cost:number; default_price:number }
type Variant = { id:number; product_id:number; name:string; sku?:string|null; purchase_cost:number; sale_price:number }

export default function Products(){
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [pForm, setPForm] = useState({ name:'', supplier_name:'', default_cost:'', default_price:'' })
  const [vForm, setVForm] = useState({ product_id:'', name:'', sku:'', purchase_cost:'', sale_price:'' })

  const load = async () => {
    const { data: p } = await supabase.from('products').select('*').order('id')
    const { data: v } = await supabase.from('variants').select('*').order('id')
    setProducts(p||[]); setVariants(v||[])
  }
  useEffect(()=>{ load() }, [])

  const addProduct = async () => {
    await supabase.from('products').insert([{
      name: pForm.name,
      supplier_name: pForm.supplier_name,
      default_cost: Number(pForm.default_cost||0),
      default_price: Number(pForm.default_price||0),
    }])
    setPForm({ name:'', supplier_name:'', default_cost:'', default_price:'' })
    load()
  }

  const addVariant = async () => {
    await supabase.from('variants').insert([{
      product_id: Number(vForm.product_id||0),
      name: vForm.name,
      sku: vForm.sku || null,
      purchase_cost: Number(vForm.purchase_cost||0),
      sale_price: Number(vForm.sale_price||0),
    }])
    setVForm({ product_id:'', name:'', sku:'', purchase_cost:'', sale_price:'' })
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Добавить товар</h3>
        <div className="grid grid-cols-2 gap-2">
          {['name','supplier_name','default_cost','default_price'].map(k => (
            <input key={k} placeholder={k} value={(pForm as any)[k]}
              onChange={e=>setPForm({...pForm,[k]:e.target.value})}
              className="rounded-lg bg-white/10 px-3 py-2 outline-none" />
          ))}
        </div>
        <button onClick={addProduct} className="mt-3 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Сохранить</button>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Добавить вариант</h3>
        <div className="grid grid-cols-2 gap-2">
          <select value={vForm.product_id} onChange={e=>setVForm({...vForm,product_id:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2">
            <option value="">Товар</option>
            {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {['name','sku','purchase_cost','sale_price'].map(k => (
            <input key={k} placeholder={k} value={(vForm as any)[k]}
              onChange={e=>setVForm({...vForm,[k]:e.target.value})}
              className="rounded-lg bg-white/10 px-3 py-2 outline-none" />
          ))}
        </div>
        <button onClick={addVariant} className="mt-3 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Сохранить</button>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10 md:col-span-2">
        <h3 className="font-semibold mb-3">Список товаров</h3>
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-white/70">Поставщик: {p.supplier_name} · Себестоимость: {p.default_cost} · Цена: {p.default_price}</div>
              <ul className="list-disc ml-6 mt-2 text-sm">
                {variants.filter(v=>v.product_id===p.id).map(v=> (
                  <li key={v.id}>{v.name} ({v.sku||'no sku'}): {v.purchase_cost} → {v.sale_price}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

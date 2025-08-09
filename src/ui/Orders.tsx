import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = { id:number; name:string }
type Variant = { id:number; product_id:number; name:string }
type OrderItem = { product_id:number; variant_id:number|null; quantity:number; purchase_cost:number; sale_price:number }
type Order = {
  id?:number; customer_name:string; phone?:string|null; address:string; city?:string|null; region?:string|null;
  carrier?:string|null; ttn?:string|null; status:'NEW'|'CONFIRMED'|'PACKED'|'SHIPPED'|'DELIVERED'|'CANCELED'|'RETURNED';
}

export default function Orders(){
  const [products,setProducts]=useState<Product[]>([])
  const [variants,setVariants]=useState<Variant[]>([])
  const [orders,setOrders]=useState<any[]>([])
  const [order,setOrder]=useState<Order>({ customer_name:'', phone:'', address:'', city:'', region:'', carrier:'Nova Poshta', ttn:'', status:'NEW' })
  const [row,setRow]=useState<any>({ product_id:'', variant_id:'', quantity:'1', purchase_cost:'', sale_price:'' })
  const [items,setItems]=useState<OrderItem[]>([])

  const load = async () => {
    const { data: p } = await supabase.from('products').select('id,name').order('id')
    const { data: v } = await supabase.from('variants').select('id,product_id,name').order('id')
    const { data: o } = await supabase.from('orders').select('*, order_items(*, products(name), variants(name))').order('id', { ascending:false })
    setProducts(p||[]); setVariants(v||[]); setOrders(o||[])
  }
  useEffect(()=>{ load() }, [])

  const addRow = () => {
    if(!row.product_id) return
    setItems([...items, {
      product_id: Number(row.product_id),
      variant_id: row.variant_id ? Number(row.variant_id) : null,
      quantity: Number(row.quantity||1),
      purchase_cost: Number(row.purchase_cost||0),
      sale_price: Number(row.sale_price||0),
    }])
    setRow({ product_id:'', variant_id:'', quantity:'1', purchase_cost:'', sale_price:'' })
  }

  const total = useMemo(()=> items.reduce((s,i)=> s + i.sale_price * i.quantity, 0), [items])

  const submit = async () => {
    const { data: created, error } = await supabase.from('orders').insert([order]).select('id').single()
    if(error || !created) { alert(error?.message||'Ошибка'); return }
    const rows = items.map(i=> ({ ...i, order_id: created.id }))
    const { error: e2 } = await supabase.from('order_items').insert(rows)
    if(e2){ alert(e2.message); return }
    setOrder({ customer_name:'', phone:'', address:'', city:'', region:'', carrier:'Nova Poshta', ttn:'', status:'NEW' })
    setItems([])
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Создать заказ</h3>
        <div className="grid grid-cols-2 gap-2">
          {['customer_name','phone','address','city','region','carrier','ttn'].map(k => (
            <input key={k} placeholder={k} value={(order as any)[k]||''}
              onChange={e=>setOrder({...order,[k]:e.target.value})}
              className="rounded-lg bg-white/10 px-3 py-2 outline-none" />
          ))}
          <select value={order.status} onChange={e=>setOrder({...order,status:e.target.value as any})} className="rounded-lg bg-white/10 px-3 py-2">
            {['NEW','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELED','RETURNED'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="mt-4 rounded-xl bg-white/5 p-3">
          <div className="font-medium mb-2">Товарные позиции</div>
          <div className="grid grid-cols-6 gap-2">
            <select className="col-span-2 rounded-lg bg-white/10 px-3 py-2" value={row.product_id}
              onChange={e=>setRow({...row, product_id: e.target.value, variant_id:''})}>
              <option value="">Товар</option>
              {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="rounded-lg bg-white/10 px-3 py-2" value={row.variant_id} onChange={e=>setRow({...row, variant_id:e.target.value})}>
              <option value="">Вариант (опц.)</option>
              {variants.filter(v=> String(v.product_id)===String(row.product_id)).map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input placeholder="Кол-во" value={row.quantity} onChange={e=>setRow({...row, quantity:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
            <input placeholder="Себестоимость" value={row.purchase_cost} onChange={e=>setRow({...row, purchase_cost:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
            <input placeholder="Цена продажи" value={row.sale_price} onChange={e=>setRow({...row, sale_price:e.target.value})} className="rounded-lg bg-white/10 px-3 py-2"/>
          </div>
          <button onClick={addRow} className="mt-3 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Добавить позицию</button>

          {items.length>0 && (
            <div className="mt-3 text-sm space-y-2">
              {items.map((i, idx)=>(
                <div key={idx} className="flex justify-between rounded-lg bg-white/10 px-3 py-2">
                  <div>#{idx+1} · product:{i.product_id} variant:{i.variant_id || '-'} × {i.quantity}</div>
                  <div>{i.purchase_cost} → {i.sale_price}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 text-sm">Итог: <b>{total}</b></div>
        <button onClick={submit} className="mt-3 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Сохранить заказ</button>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Список заказов</h3>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex justify-between">
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-xs px-2 py-1 rounded bg-white/10">{o.status}</div>
              </div>
              <div className="text-sm text-white/70">TTN: {o.ttn || '-'}</div>
              <ul className="text-sm mt-2 list-disc ml-6">
                {o.order_items.map((i:any)=>(
                  <li key={i.id}>{i.products?.name} {i.variants ? `(${i.variants.name})` : ''} × {i.quantity} — {i.sale_price}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

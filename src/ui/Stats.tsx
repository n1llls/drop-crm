import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts'

export default function Stats(){
  const [orders,setOrders]=useState<any[]>([])
  const [spend,setSpend]=useState<any[]>([])

  const load = async () => {
    const { data: o } = await supabase.from('orders').select('id, order_items(product_id, quantity, purchase_cost, sale_price, products(name))')
    const { data: s } = await supabase.from('ad_spend').select('*')
    setOrders(o||[]); setSpend(s||[])
  }
  useEffect(()=>{ load() }, [])

  const metrics = useMemo(()=>{
    const by:any = {}
    for(const o of orders){
      for(const it of o.order_items){
        const pid = it.product_id
        if(!by[pid]) by[pid] = { name: it.products?.name || '#'+pid, units:0, revenue:0, cost:0, ad:0, leads:0 }
        by[pid].units += it.quantity
        by[pid].revenue += it.sale_price * it.quantity
        by[pid].cost += it.purchase_cost * it.quantity
      }
    }
    for(const s of spend){
      const pid = s.product_id
      if(!by[pid]) by[pid] = { name: '#'+pid, units:0, revenue:0, cost:0, ad:0, leads:0 }
      by[pid].ad += s.amount
      by[pid].leads += s.leads || 0
    }
    return Object.values(by).map((r:any)=>{
      const profit = r.revenue - r.cost - r.ad
      const roi = r.ad > 0 ? profit / r.ad : null
      const ros = r.ad > 0 ? r.revenue / r.ad : null
      const cpl = r.leads > 0 ? r.ad / r.leads : null
      return { ...r, profit, roi, ros, cpl }
    })
  }, [orders, spend])

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">Прибыль по товарам</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics as any[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10">
        <h3 className="font-semibold mb-3">ROS / ROI</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics as any[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ros" />
              <Line type="monotone" dataKey="roi" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white/5 border border-white/10 md:col-span-2">
        <h3 className="font-semibold mb-3">Стоимость лида (CPL)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics as any[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cpl" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

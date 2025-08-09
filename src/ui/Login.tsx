import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const signIn = async (e:React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if(error) setError(error.message)
  }

  const signUp = async () => {
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if(error) setError(error.message)
    else alert('Проверь email для подтверждения (если включено в проекте)')
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="w-full max-w-md rounded-2xl p-6 bg-white/5 border border-white/10">
        <h1 className="text-2xl font-semibold mb-4">Вход</h1>
        <form onSubmit={signIn} className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Пароль</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg bg-white/10 px-3 py-2 outline-none" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2">Войти</button>
        </form>
        <button onClick={signUp} className="mt-3 w-full text-sm underline">Создать аккаунт</button>
      </motion.div>
    </div>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuthStore } from '../store/auth'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const { data: tokenData } = await api.post('/auth/login', data)
      const { data: userData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      setAuth(tokenData.access_token, userData)
      navigate('/')
    } catch {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-mint flex items-center justify-center font-bold text-navy text-2xl mb-4">DC</div>
          <h1 className="text-white text-2xl font-bold">DistribuCore</h1>
          <p className="text-white/50 text-sm mt-1">Distribution Management System</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-navy font-semibold text-xl mb-6">Sign in</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy text-white py-2.5 rounded-lg font-medium text-sm hover:bg-navy-600 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

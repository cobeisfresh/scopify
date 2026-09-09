import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function useStaffLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apiFetch('/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'staff'] })
      navigate('/staff')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  })

  return { form, onSubmit }
}

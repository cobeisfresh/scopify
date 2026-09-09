import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import loginIllustrationLight from '@/assets/login-illustration-light.svg'
import loginIllustrationDark from '@/assets/login-illustration-dark.svg'
import { useStaffLogin } from './StaffLogin.logic'

export function StaffLogin() {
  const { form, onSubmit } = useStaffLogin()

  return (
    <div className="grid lg:grid-cols-2">
      <div className="hidden min-h-svh items-center justify-center bg-secondary p-12 lg:flex">
        <img
          src={loginIllustrationLight}
          alt=""
          className="w-full max-w-lg animate-in duration-700 zoom-in-95 fade-in dark:hidden"
        />
        <img
          src={loginIllustrationDark}
          alt=""
          className="hidden w-full max-w-lg animate-in duration-700 zoom-in-95 fade-in dark:block"
        />
      </div>

      <div className="flex min-h-svh flex-col justify-center p-8 sm:p-16">
        <div className="mx-auto flex w-full max-w-sm animate-in flex-col gap-6 duration-500 fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Staff login
            </h1>
            <ThemeToggle />
          </div>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  {...form.register('email')}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register('password')}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

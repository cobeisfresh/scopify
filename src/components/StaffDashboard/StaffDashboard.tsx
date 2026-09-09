import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import { useStaffDashboard } from './StaffDashboard.logic'

export function StaffDashboard() {
  const { projects, isLoading, form, onSubmit } = useStaffDashboard()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Create a project, then pick which question sections apply.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-lg border p-4">
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="name">Project name</FieldLabel>
            <Input id="name" {...form.register('name')} />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="clientName">Client name</FieldLabel>
            <Input id="clientName" {...form.register('clientName')} />
            <FieldError errors={[form.formState.errors.clientName]} />
          </Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating…' : 'Create project'}
          </Button>
        </FieldGroup>
      </form>

      <div className="flex flex-col gap-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/staff/projects/${project.id}`}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="text-sm text-muted-foreground">
                {project.clientName}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {project.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

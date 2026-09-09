import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useProjectDetail } from './ProjectDetail.logic'

export function ProjectDetail() {
  const {
    project,
    enabledSectionIds,
    invites,
    sections,
    isLoading,
    toggleSection,
    generateInvite,
    copyInviteLink,
  } = useProjectDetail()

  if (isLoading || !project)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {project.clientName} · {project.status}
          </p>
        </div>
        <Link
          to={`/staff/projects/${project.id}/review`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Review answers
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">
          Question sections for this project
        </h2>
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <Checkbox
                checked={enabledSectionIds.has(section.id)}
                onCheckedChange={(checked) =>
                  toggleSection(section.id, checked === true)
                }
              />
              <span className="text-sm">
                {section.nameEn}
                <span className="ml-2 text-muted-foreground">
                  {section.questions.length} questions
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Client invite</h2>
        <Button type="button" onClick={generateInvite} className="w-fit">
          Generate invite link
        </Button>
        <div className="flex flex-col gap-2">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="truncate text-sm text-muted-foreground">
                /invite/{invite.token}
              </span>
              <div className="flex items-center gap-2">
                {invite.usedAt && (
                  <span className="text-sm text-muted-foreground">Used</span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invite.token)}
                >
                  Copy link
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

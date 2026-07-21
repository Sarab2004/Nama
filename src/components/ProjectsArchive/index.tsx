import { cn } from '@/utilities/ui'
import React from 'react'

import { ProjectCard, type ProjectCardData } from '@/components/ProjectCard'

export type Props = {
  emptyMessage: string
  projects: ProjectCardData[]
  viewLabel: string
}

export const ProjectsArchive: React.FC<Props> = ({ emptyMessage, projects, viewLabel }) => {
  if (!projects?.length) {
    return (
      <div className="container">
        <p className="text-muted-foreground text-center py-12" role="status">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('container')}>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
        {projects.map((project) => {
          if (typeof project !== 'object' || project === null) return null

          return (
            <li key={project.slug}>
              <ProjectCard doc={project} viewLabel={viewLabel} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

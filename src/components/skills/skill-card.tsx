'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Sparkles, Trash2 } from 'lucide-react'
import { hostDaUrl } from '@/lib/skill-metadata'
import { Skill } from '@/types'

interface SkillCardProps {
  skill: Skill
  onExcluir: (id: string) => void
}

export function SkillCard({ skill, onExcluir }: SkillCardProps) {
  return (
    <Card className="min-w-0 max-w-full overflow-hidden transition-colors hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <Link href={`/skills/${skill.id}`} className="min-w-0 max-w-full flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="line-clamp-2 break-words text-base font-semibold text-foreground">
                {skill.titulo || hostDaUrl(skill.url)}
              </h3>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {hostDaUrl(skill.url)}
            </p>
            <p className="mt-2 line-clamp-3 min-w-0 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
              {skill.descricao || 'Sem descrição.'}
            </p>
          </Link>
          <div className="flex shrink-0 items-center">
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${skill.titulo || skill.url}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              aria-label="Excluir skill"
              onClick={() => onExcluir(skill.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

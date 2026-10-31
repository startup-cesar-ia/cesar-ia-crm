'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { listarSkillsPaginado, excluirSkill } from '@/lib/firebase-services'
import { Skill } from '@/types'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SkillCard } from '@/components/skills/skill-card'
import { Plus, Sparkles } from 'lucide-react'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { usePaginado } from '@/lib/use-paginado'
import { QueryDocumentSnapshot } from 'firebase/firestore'

export default function SkillsPage() {
  const { query } = useSearch()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const {
    itens: skills,
    carregando,
    temMais,
    carregarPrimeira,
    carregarMais,
  } = usePaginado<Skill, QueryDocumentSnapshot>((qtd, cursor) => {
    const user = auth.currentUser
    if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
    return listarSkillsPaginado(user.uid, qtd, cursor)
  })

  useEffect(() => {
    carregarPrimeira()
  }, [carregarPrimeira])

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirSkill(excluindoId)
    setExcluindoId(null)
    carregarPrimeira()
  }

  const filtradas = skills.filter(
    (s) =>
      combinaTexto(s.titulo, query) &&
      combinaTexto(s.descricao || '', query) &&
      combinaTexto(s.url, query)
  )

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/skills/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Skill
          </Button>
        </Link>
      </div>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query
              ? 'Nenhuma skill encontrada.'
              : 'Nenhuma skill ainda. Salve o primeiro link!'}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onExcluir={setExcluindoId}
            />
          ))}
        </div>
      )}

      {temMais && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={carregarMais} disabled={carregando}>
            Carregar mais
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!excluindoId}
        title="Excluir skill"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}

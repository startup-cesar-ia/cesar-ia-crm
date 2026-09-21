'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react'

interface NotaEditorProps {
  conteudo: string
  onChange: (html: string) => void
}

interface BtnToolbar {
  ativo: boolean
  onClick: () => void
  icone: React.ReactNode
  label: string
}

function Botao({ ativo, onClick, icone, label }: BtnToolbar) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        ativo && 'bg-accent text-foreground'
      )}
    >
      {icone}
    </button>
  )
}

export function NotaEditor({ conteudo, onChange }: NotaEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: conteudo,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Carregando editor...
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        <Botao
          ativo={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icone={<Bold className="h-4 w-4" />}
          label="Negrito"
        />
        <Botao
          ativo={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icone={<Italic className="h-4 w-4" />}
          label="Itálico"
        />
        <Botao
          ativo={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icone={<Strikethrough className="h-4 w-4" />}
          label="Tachado"
        />
        <Botao
          ativo={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icone={<Heading1 className="h-4 w-4" />}
          label="Título 1"
        />
        <Botao
          ativo={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icone={<Heading2 className="h-4 w-4" />}
          label="Título 2"
        />
        <Botao
          ativo={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icone={<Heading3 className="h-4 w-4" />}
          label="Título 3"
        />
        <Botao
          ativo={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icone={<List className="h-4 w-4" />}
          label="Lista"
        />
        <Botao
          ativo={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icone={<ListOrdered className="h-4 w-4" />}
          label="Lista numerada"
        />
        <Botao
          ativo={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icone={<Quote className="h-4 w-4" />}
          label="Citação"
        />
        <Botao
          ativo={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icone={<Code className="h-4 w-4" />}
          label="Bloco de código"
        />
        <div className="mx-1 h-5 w-px bg-border" />
        <Botao
          ativo={false}
          onClick={() => editor.chain().focus().undo().run()}
          icone={<Undo className="h-4 w-4" />}
          label="Desfazer"
        />
        <Botao
          ativo={false}
          onClick={() => editor.chain().focus().redo().run()}
          icone={<Redo className="h-4 w-4" />}
          label="Refazer"
        />
      </div>
      <EditorContent editor={editor} className="nota-conteudo" />
    </div>
  )
}

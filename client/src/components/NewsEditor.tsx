/**
 * NewsEditor.tsx
 * Editor WYSIWYG moderno basado en Tiptap v2.
 * Reemplaza el deprecated contentEditable + execCommand.
 *
 * Extensiones incluidas:
 *   - StarterKit (bold, italic, strike, headings, lists, blockquote, codeblock, hr, undo/redo)
 *   - Image (insertar imágenes por URL)
 *   - Youtube (embeds de YouTube)
 *   - Link (hipervínculos)
 *   - Placeholder (texto de ayuda cuando está vacío)
 *   - CharacterCount (contador de caracteres opcional)
 *
 * Output: HTML string — misma interfaz que antes (onChange(html))
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Image as ImageIcon,
  Youtube as YoutubeIcon, Link as LinkIcon, Undo2, Redo2,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function NewsEditor({
  value,
  onChange,
  placeholder = "Escribe el contenido de la noticia...",
  maxLength,
}: NewsEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-lg bg-muted p-4 font-mono text-sm" } },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-2",
        },
      }),
      Youtube.configure({
        controls: true,
        HTMLAttributes: {
          class: "w-full rounded-xl my-2 aspect-video",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] p-4 text-sm focus:outline-none prose prose-sm dark:prose-invert max-w-none " +
          "prose-headings:font-bold prose-h2:text-lg prose-h3:text-base " +
          "prose-a:text-primary prose-code:bg-muted prose-code:rounded prose-code:px-1",
      },
    },
  });

  if (!editor) return null;

  // ── Helpers ────────────────────────────────────────────────────────────
  const insertImage = () => {
    const url = window.prompt("URL de la imagen:");
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt("URL de YouTube:");
    if (url?.trim()) editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace:", previous ?? "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
  };

  // ── Toolbar buttons config ─────────────────────────────────────────────
  type ToolbarBtn =
    | { type: "btn"; icon: React.ElementType; title: string; action: () => void; active?: boolean }
    | { type: "sep" };

  const tools: ToolbarBtn[] = [
    { type: "btn", icon: Bold,        title: "Negrita (Ctrl+B)",   action: () => editor.chain().focus().toggleBold().run(),        active: editor.isActive("bold") },
    { type: "btn", icon: Italic,      title: "Cursiva (Ctrl+I)",   action: () => editor.chain().focus().toggleItalic().run(),      active: editor.isActive("italic") },
    { type: "btn", icon: Strikethrough, title: "Tachado",          action: () => editor.chain().focus().toggleStrike().run(),      active: editor.isActive("strike") },
    { type: "btn", icon: Code2,       title: "Código inline",      action: () => editor.chain().focus().toggleCode().run(),        active: editor.isActive("code") },
    { type: "sep" },
    { type: "btn", icon: Heading2,    title: "Título H2",          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { type: "btn", icon: Heading3,    title: "Título H3",          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { type: "sep" },
    { type: "btn", icon: List,        title: "Lista",              action: () => editor.chain().focus().toggleBulletList().run(),  active: editor.isActive("bulletList") },
    { type: "btn", icon: ListOrdered, title: "Lista numerada",     action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { type: "btn", icon: Quote,       title: "Cita",               action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { type: "btn", icon: Minus,       title: "Separador",          action: () => editor.chain().focus().setHorizontalRule().run() },
    { type: "sep" },
    { type: "btn", icon: LinkIcon,    title: "Insertar enlace",    action: setLink,    active: editor.isActive("link") },
    { type: "btn", icon: ImageIcon,   title: "Insertar imagen",   action: insertImage },
    { type: "btn", icon: YoutubeIcon, title: "Embed YouTube",     action: insertYoutube },
    { type: "sep" },
    { type: "btn", icon: Undo2,       title: "Deshacer (Ctrl+Z)", action: () => editor.chain().focus().undo().run() },
    { type: "btn", icon: Redo2,       title: "Rehacer (Ctrl+Y)",  action: () => editor.chain().focus().redo().run() },
  ];

  const chars = editor.storage.characterCount?.characters?.() ?? null;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-secondary/30 flex-wrap">
        {tools.map((t, i) =>
          t.type === "sep" ? (
            <div key={i} className="w-px h-4 bg-border mx-1 shrink-0" />
          ) : (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "w-7 h-7 rounded transition-colors",
                t.active && "bg-primary/15 text-primary"
              )}
              title={t.title}
              onMouseDown={(e) => {
                e.preventDefault();
                t.action();
              }}
            >
              <t.icon className="w-3.5 h-3.5" />
            </Button>
          )
        )}
      </div>

      {/* Tiptap editable area */}
      <EditorContent editor={editor} className="flex-1" />

      {/* Footer: character count (solo si maxLength está definido) */}
      {maxLength && chars !== null && (
        <div className="px-4 py-1.5 border-t border-border bg-secondary/20 text-xs text-muted-foreground text-right">
          {chars} / {maxLength} caracteres
        </div>
      )}
    </div>
  );
}

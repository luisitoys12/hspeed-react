/**
 * NewsEditor.tsx
 * Editor WYSIWYG liviano para noticias.
 * Usa contentEditable con execCommand para negrita, cursiva, títulos, listas,
 * separador e insertar imágenes por URL — sin dependencias externas.
 */
import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Minus, Image as ImageIcon
} from "lucide-react";

interface NewsEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function NewsEditor({ value, onChange, placeholder = "Escribe el contenido de la noticia..." }: NewsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
      isInternalUpdate.current = false;
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
      isInternalUpdate.current = false;
    }
  };

  const insertImage = () => {
    const url = window.prompt("URL de la imagen:");
    if (url && url.trim()) {
      exec("insertHTML", `<img src="${url.trim()}" style="max-width:100%;border-radius:8px;margin:8px 0;" alt="imagen" />`);
    }
  };

  const tools = [
    { icon: Bold,         title: "Negrita",       action: () => exec("bold") },
    { icon: Italic,       title: "Cursiva",       action: () => exec("italic") },
    { icon: Heading2,     title: "Título H2",     action: () => exec("formatBlock", "<h2>") },
    { icon: Heading3,     title: "Título H3",     action: () => exec("formatBlock", "<h3>") },
    { icon: List,         title: "Lista",         action: () => exec("insertUnorderedList") },
    { icon: ListOrdered,  title: "Lista núm.",    action: () => exec("insertOrderedList") },
    { icon: Minus,        title: "Separador",     action: () => exec("insertHTML", "<hr style='border-color:rgba(255,255,255,0.1);margin:12px 0;' />") },
    { icon: ImageIcon,    title: "Insertar imagen", action: insertImage },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-secondary/30 flex-wrap">
        {tools.map((t, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded"
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); t.action(); }}
          >
            <t.icon className="w-3.5 h-3.5" />
          </Button>
        ))}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[200px] p-4 text-sm text-foreground/90 focus:outline-none
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-1
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
          [&_li]:mb-0.5 [&_img]:rounded-xl [&_img]:max-w-full [&_hr]:border-border
          empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
      />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { Image as ImageIcon } from 'lucide-react';
import { ARTICLE_BODY_CLASSES } from './JournalArticlePage';

interface RichTextEditorProps {
  /** Article HTML (old plain text / Markdown is also accepted). */
  value: string;
  /** Called with the article HTML on every change ('' when empty). */
  onChange: (html: string) => void;
  /**
   * Optional. Upload an image file and return its public URL.
   * If given, the image icon opens a file picker (and pasted/dropped images upload too).
   * If not given, the image icon asks for an image URL.
   */
  onUploadImage?: (file: File) => Promise<string>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onUploadImage }) => {
  const editorRef = useRef<Editor | null>(null);
  const uploadRef = useRef(onUploadImage);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  uploadRef.current = onUploadImage;

  const insertUploadedImage = async (file: File) => {
    if (!uploadRef.current) return;
    try {
      const src = await uploadRef.current(file);
      editorRef.current?.chain().focus().setImage({ src, alt: '' }).run();
    } catch (err) {
      console.error('Image upload failed', err);
      window.alert('Image upload failed. Please try again.');
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Image,
      // plain-text paste with Markdown (## Heading, - bullets) also becomes real formatting
      Markdown.configure({ html: true, breaks: true, transformPastedText: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
    editorProps: {
      attributes: { class: `${ARTICLE_BODY_CLASSES} min-h-[420px] px-6 py-5 focus:outline-none` },
      // screenshot / image-file paste (never hijacks copied text from Word or Docs)
      handlePaste: (_view, event) => {
        const data = event.clipboardData;
        if (!uploadRef.current || !data) return false;
        if (data.types.includes('text/html') || data.types.includes('text/plain')) return false;
        const files = Array.from(data.files).filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(insertUploadedImage);
        return true;
      },
      handleDrop: (_view, event) => {
        if (!uploadRef.current) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach(insertUploadedImage);
        return true;
      },
    },
  });

  editorRef.current = editor;

  // keep the editor in sync when an existing article loads from outside
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if ((value || '') !== current) editor.commands.setContent(value || '', false);
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    if (onUploadImage) {
      fileInputRef.current?.click();
      return;
    }
    const src = window.prompt('Image URL');
    if (src && src.trim()) editor.chain().focus().setImage({ src: src.trim(), alt: '' }).run();
  };

  return (
    <div className="rounded-2xl border border-[var(--text-primary)]/15 bg-[var(--bg-main)] overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center border-b border-[var(--text-primary)]/10 bg-[var(--bg-main)] px-2 py-1.5">
        <button
          type="button"
          title="Insert image at cursor"
          aria-label="Insert image at cursor"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addImage}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) insertUploadedImage(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default RichTextEditor;

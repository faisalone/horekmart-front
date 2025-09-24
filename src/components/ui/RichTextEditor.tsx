'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import '@/styles/tiptap.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  className,
  disabled = false 
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable StarterKit's built-in Link extension to avoid duplicates
        link: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none bg-gray-700 text-white p-4 rounded-b-lg min-h-[200px] border-t border-gray-600',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn('border border-gray-600 rounded-lg bg-gray-700', className)}>
        <div className="h-12 bg-gray-800 border-b border-gray-600 rounded-t-lg animate-pulse"></div>
        <div className="p-4 min-h-[200px] bg-gray-700 rounded-b-lg animate-pulse"></div>
      </div>
    );
  }

  const buttonClasses = 'px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap hover:bg-gray-700 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const iconButtonClasses = 'px-2 py-1 rounded-md transition-colors whitespace-nowrap hover:bg-gray-700 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={cn('border border-gray-600 rounded-lg bg-gray-700', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap bg-gray-800 border-b border-gray-600 rounded-t-lg px-2 py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(iconButtonClasses, editor.isActive('bold') && 'bg-blue-600 text-white')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(iconButtonClasses, editor.isActive('italic') && 'bg-blue-600 text-white')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={cn(iconButtonClasses, editor.isActive('underline') && 'bg-blue-600 text-white')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(buttonClasses, editor.isActive('heading', { level: 2 }) && 'bg-blue-600 text-white')}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(buttonClasses, editor.isActive('heading', { level: 3 }) && 'bg-blue-600 text-white')}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(iconButtonClasses, editor.isActive('bulletList') && 'bg-blue-600 text-white')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(iconButtonClasses, editor.isActive('orderedList') && 'bg-blue-600 text-white')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(iconButtonClasses, editor.isActive('blockquote') && 'bg-blue-600 text-white')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-gray-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(iconButtonClasses, editor.isActive({ textAlign: 'left' }) && 'bg-blue-600 text-white')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(iconButtonClasses, editor.isActive({ textAlign: 'center' }) && 'bg-blue-600 text-white')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(iconButtonClasses, editor.isActive({ textAlign: 'right' }) && 'bg-blue-600 text-white')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-gray-700">
          <button
            type="button"
            onClick={addLink}
            className={cn(iconButtonClasses, editor.isActive('link') && 'bg-blue-600 text-white')}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={addImage}
            className={iconButtonClasses}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className={iconButtonClasses}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className={iconButtonClasses}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[200px]"
        style={{
          '--tw-prose-body': '#ffffff',
          '--tw-prose-headings': '#ffffff',
          '--tw-prose-lead': '#d1d5db',
          '--tw-prose-links': '#3b82f6',
          '--tw-prose-bold': '#ffffff',
          '--tw-prose-counters': '#d1d5db',
          '--tw-prose-bullets': '#d1d5db',
          '--tw-prose-hr': '#374151',
          '--tw-prose-quotes': '#d1d5db',
          '--tw-prose-quote-borders': '#374151',
          '--tw-prose-captions': '#d1d5db',
          '--tw-prose-code': '#ffffff',
          '--tw-prose-pre-code': '#ffffff',
          '--tw-prose-pre-bg': '#1f2937',
          '--tw-prose-th-borders': '#374151',
          '--tw-prose-td-borders': '#374151',
        } as React.CSSProperties}
      />
    </div>
  );
};

export default RichTextEditor;

'use client'

import {
  MDXEditor as Editor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertCodeBlock,
  diffSourcePlugin,
  imagePlugin,
  linkPlugin,
  tablePlugin,
  frontmatterPlugin,
  jsxPlugin,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  CodeMirrorEditor,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useEffect, useState } from 'react'

interface MDXEditorProps {
  markdown: string
  onChange: (markdown: string) => void
}

export default function MDXEditor({ markdown, onChange }: MDXEditorProps) {
  // 클라이언트 사이드 렌더링을 위한 상태
  const [mounted, setMounted] = useState(false)
  // 기본적으로 소스 모드로 시작
  const [editorMode, setEditorMode] = useState<'rich-text' | 'source'>('source')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="mdx-editor-container">
      <Editor
        markdown={markdown}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              jsx: 'JSX',
              ts: 'TypeScript',
              tsx: 'TSX',
              python: 'Python',
              html: 'HTML',
              css: 'CSS',
            },
          }),
          diffSourcePlugin({
            viewMode: editorMode,
            diffMarkdown: markdown,
          }),
          imagePlugin(),
          linkPlugin(),
          tablePlugin(),
          frontmatterPlugin(),
          jsxPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <ConditionalContents
                  options={[
                    {
                      when: (editor) => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      when: (editor) => editor?.editorType === 'source',
                      contents: () => (
                        <button
                          onClick={() => setEditorMode('rich-text')}
                          className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                        >
                          Rich Text
                        </button>
                      ),
                    },
                    {
                      fallback: () => (
                        <>
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                          <BlockTypeSelect />
                          <CreateLink />
                          <InsertCodeBlock />
                          <button
                            onClick={() => setEditorMode('source')}
                            className="rounded bg-gray-200 px-2 py-1 text-xs"
                          >
                            Markdown
                          </button>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          }),
        ]}
      />
    </div>
  )
}

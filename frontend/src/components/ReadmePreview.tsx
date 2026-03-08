"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ReadmeProps {
    content: string
}

export default function ReadmePreview({ content }: ReadmeProps) {
    if (!content) {
        return null
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 mt-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
                    Auto-Generated README
                </h3>
                <button
                    onClick={() => navigator.clipboard.writeText(content)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Copy Markdown
                </button>
            </div>

            <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    )
}

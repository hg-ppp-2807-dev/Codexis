"use client"

import { Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'

interface Suggestion {
    pattern: string
    rationale: string
    suggestions: string[]
}

interface ArchProps {
    data: Suggestion | { error: string }
}

export default function ArchSuggestions({ data }: ArchProps) {
    if (!data || 'error' in data || !('pattern' in data)) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Architecture</h3>
                <p className="text-gray-400">Could not analyze architecture.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-pink-500 rounded-full inline-block"></span>
                System Architecture
            </h3>

            <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-400 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="font-semibold text-gray-200">Detected Pattern</h4>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
                            {data.pattern}
                        </p>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{data.rationale}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-400" />
                    AI Recommendations
                </h4>
                <ul className="space-y-3">
                    {data.suggestions?.map((sug, i) => (
                        <li key={i} className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-white/5">
                            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300 leading-relaxed">{sug}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

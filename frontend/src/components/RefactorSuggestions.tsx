"use client"

import { motion } from "framer-motion"
import { Lightbulb, ArrowRight, Clock, Zap } from "lucide-react"

interface Suggestion {
    title: string
    impact: string
    reason: string
    before: string
    after: string
    effort: string
    benefit: string
}

interface RefactorProps {
    data: {
        suggestions?: Suggestion[]
    }
}

export default function RefactorSuggestions({ data }: RefactorProps) {
    if (!data?.suggestions || data.suggestions.length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
                    Refactoring Suggestions
                </h3>
                <p className="text-gray-400">No refactoring suggestions available.</p>
            </div>
        )
    }

    const getImpactColor = (impact: string) => {
        switch (impact?.toLowerCase()) {
            case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50'
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
                Refactoring Suggestions
            </h3>

            <div className="space-y-6">
                {data.suggestions.map((suggestion, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Lightbulb size={16} className="text-yellow-400" />
                                <h4 className="font-semibold text-white">{suggestion.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(suggestion.impact)}`}>
                                    {suggestion.impact} impact
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} />
                                    {suggestion.effort}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-3">{suggestion.reason}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                <span className="text-xs text-red-400 font-medium block mb-1">Before</span>
                                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                                    {suggestion.before}
                                </pre>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                <span className="text-xs text-green-400 font-medium block mb-1">After</span>
                                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
                                    {suggestion.after}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                            <Zap size={12} className="text-purple-400" />
                            Benefit: {suggestion.benefit}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
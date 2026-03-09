"use client"

import { motion } from "framer-motion"
import { AlertTriangle, AlertCircle, ThumbsUp, CheckCircle, XCircle, MessageSquare } from "lucide-react"

interface PRReviewProps {
    data: {
        approve?: boolean
        score?: number
        critical?: Array<{ issue: string; line: string; fix: string }>
        warnings?: Array<{ issue: string; line: string; fix: string }>
        suggestions?: Array<{ issue: string; fix: string }>
        good?: string[]
        summary?: string
    }
}

export default function PRReviewCard({ data }: PRReviewProps) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-cyan-500 rounded-full inline-block"></span>
                    PR Review
                </h3>
                <p className="text-gray-400">No PR review data available.</p>
            </div>
        )
    }

    const { approve, score, critical = [], warnings = [], suggestions = [], good = [], summary } = data

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            {/* Header with approve status and score */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-cyan-500 rounded-full inline-block"></span>
                    PR Review
                </h3>
                <div className="flex items-center gap-3">
                    {score !== undefined && (
                        <div className="text-2xl font-bold text-white">
                            {score}<span className="text-sm text-gray-500">/100</span>
                        </div>
                    )}
                    {approve !== undefined && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                            approve 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                        }`}>
                            {approve ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span className="font-medium">{approve ? 'Approved' : 'Changes Requested'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Critical Issues */}
            {critical.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        Critical Issues ({critical.length})
                    </h4>
                    <div className="space-y-2">
                        {critical.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-red-500/10 rounded-lg p-3 border border-red-500/20"
                            >
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-white font-medium">{item.issue}</p>
                                        <pre className="text-xs text-gray-400 mt-1 font-mono bg-gray-800 p-2 rounded">{item.line}</pre>
                                        <p className="text-xs text-green-400 mt-1">Fix: {item.fix}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Warnings ({warnings.length})
                    </h4>
                    <div className="space-y-2">
                        {warnings.map((item, i) => (
                            <div key={i} className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                                <p className="text-sm text-white font-medium">{item.issue}</p>
                                <pre className="text-xs text-gray-400 mt-1 font-mono bg-gray-800 p-2 rounded">{item.line}</pre>
                                <p className="text-xs text-blue-400 mt-1">Fix: {item.fix}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                        <MessageSquare size={14} />
                        Suggestions ({suggestions.length})
                    </h4>
                    <div className="space-y-2">
                        {suggestions.map((item, i) => (
                            <div key={i} className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                                <p className="text-sm text-white font-medium">{item.issue}</p>
                                <p className="text-xs text-gray-400 mt-1">{item.fix}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Good things */}
            {good.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <ThumbsUp size={14} />
                        Good Practices ({good.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {good.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-green-500/10 text-green-300 text-xs rounded-full border border-green-500/30">
                                ✓ {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            {summary && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-300">{summary}</p>
                </div>
            )}
        </div>
    )
}
"use client"

import { motion } from "framer-motion"
import { Activity, Shield, FileText, TestTube, Wrench, Layers } from "lucide-react"

interface HealthScoreProps {
    data: {
        code_quality?: number
        architecture?: number
        maintainability?: number
        security?: number
        documentation?: number
        test_coverage?: number
        overall?: number
        grade?: string
        strengths?: string[]
        weaknesses?: string[]
        summary?: string
    }
}

const categories = [
    { key: 'code_quality', label: 'Code Quality', icon: Wrench, color: 'bg-blue-500' },
    { key: 'architecture', label: 'Architecture', icon: Layers, color: 'bg-purple-500' },
    { key: 'maintainability', label: 'Maintainability', icon: Activity, color: 'bg-green-500' },
    { key: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' },
    { key: 'documentation', label: 'Documentation', icon: FileText, color: 'bg-yellow-500' },
    { key: 'test_coverage', label: 'Test Coverage', icon: TestTube, color: 'bg-cyan-500' },
]

export default function HealthScoreCard({ data }: HealthScoreProps) {
    const overall = data?.overall || 0
    const grade = data?.grade || 'N/A'

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-green-400 bg-green-500/20 border-green-500/50'
            case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
            case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/50'
            case 'F': return 'text-red-400 bg-red-500/20 border-red-500/50'
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
        }
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Health Score</h3>
                <p className="text-gray-400">No health data available.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
                    Repository Health Score
                </h3>
                <div className={`px-4 py-2 rounded-full text-2xl font-bold border ${getGradeColor(grade)}`}>
                    {grade}
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-8">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-gray-400 text-sm">Overall Score</span>
                    <span className="text-3xl font-bold text-white">{overall.toFixed(1)}<span className="text-lg text-gray-500">/10</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(overall / 10) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {categories.map((cat, i) => {
                    const value = data[cat.key as keyof typeof data] as number || 0
                    const Icon = cat.icon
                    return (
                        <motion.div
                            key={cat.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className={cat.color.replace('bg-', 'text-')} />
                                <span className="text-xs text-gray-400">{cat.label}</span>
                            </div>
                            <div className="text-xl font-bold text-white">{value.toFixed(1)}</div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.strengths && data.strengths.length > 0 && (
                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                        <h4 className="text-sm font-semibold text-green-400 mb-2">✓ Strengths</h4>
                        <ul className="space-y-1">
                            {data.strengths.slice(0, 3).map((s, i) => (
                                <li key={i} className="text-xs text-gray-300">• {s}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {data.weaknesses && data.weaknesses.length > 0 && (
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                        <h4 className="text-sm font-semibold text-red-400 mb-2">✗ Weaknesses</h4>
                        <ul className="space-y-1">
                            {data.weaknesses.slice(0, 3).map((w, i) => (
                                <li key={i} className="text-xs text-gray-300">• {w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {data.summary && (
                <p className="mt-4 text-sm text-gray-400 italic border-t border-gray-800 pt-4">
                    {data.summary}
                </p>
            )}
        </div>
    )
}
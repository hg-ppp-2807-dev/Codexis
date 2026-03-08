"use client"

import { motion } from "framer-motion"

interface Tech {
    name: string
    confidence: number
}

interface TechCategory {
    category: string
    technologies: Tech[]
}

interface TechStackProps {
    data: {
        categories?: TechCategory[]
    }
}

export default function TechStackCard({ data }: TechStackProps) {
    if (!data?.categories || !Array.isArray(data.categories)) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Tech Stack</h3>
                <p className="text-gray-400">Could not parse tech stack accurately.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                Detected Stack
            </h3>

            <div className="space-y-6">
                {data.categories.map((cat, i) => (
                    <div key={i} className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{cat.category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {cat.technologies.map((tech, j) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (i * 0.1) + (j * 0.05) }}
                                    key={j}
                                    className="px-3 py-1.5 bg-gray-800 text-gray-200 rounded-full text-sm border border-gray-700 flex items-center gap-2"
                                >
                                    <span className="font-medium">{tech.name}</span>
                                    <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                                        {Math.round(tech.confidence * 100)}%
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

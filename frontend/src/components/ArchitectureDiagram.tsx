"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Network, Code, Layers } from "lucide-react"

interface ArchitectureDiagramProps {
    data: {
        ascii_diagram?: string
        mermaid_code?: string
        pattern?: string
        layers?: string[]
        diagram_summary?: string
    }
}

export default function ArchitectureDiagram({ data }: ArchitectureDiagramProps) {
    const [activeTab, setActiveTab] = useState<'ascii' | 'mermaid'>('ascii')

    if (!data || (!data.ascii_diagram && !data.mermaid_code)) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                    Architecture Diagram
                </h3>
                <p className="text-gray-400">No architecture diagram available.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                    Architecture Diagram
                </h3>
                {data.pattern && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/50">
                        {data.pattern}
                    </span>
                )}
            </div>

            {/* Layers */}
            {data.layers && data.layers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {data.layers.map((layer, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700">
                            {layer}
                        </span>
                    ))}
                </div>
            )}

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('ascii')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'ascii' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                >
                    <Code size={14} />
                    ASCII
                </button>
                <button
                    onClick={() => setActiveTab('mermaid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'mermaid' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                >
                    <Network size={14} />
                    Mermaid
                </button>
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-950 rounded-xl p-4 border border-gray-800"
            >
                {activeTab === 'ascii' ? (
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre">
                        {data.ascii_diagram || 'No ASCII diagram available'}
                    </pre>
                ) : (
                    <pre className="text-xs text-purple-400 font-mono overflow-x-auto whitespace-pre">
                        {data.mermaid_code || 'No Mermaid code available'}
                    </pre>
                )}
            </motion.div>

            {data.diagram_summary && (
                <p className="mt-4 text-sm text-gray-400 italic">
                    {data.diagram_summary}
                </p>
            )}
        </div>
    )
}
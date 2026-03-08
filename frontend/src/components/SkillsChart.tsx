"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from "framer-motion"

interface Skill {
    name: string
    confidence: number
    category: string
}

interface SkillsProps {
    data: {
        skills?: Skill[]
    }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']

export default function SkillsChart({ data }: SkillsProps) {
    if (!data?.skills || !Array.isArray(data.skills)) {
        return (
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Developer Skills</h3>
                <p className="text-gray-400">Could not parse skills accurately.</p>
            </div>
        )
    }

    // Format data for chart
    const chartData = data.skills
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8)
        .map(s => ({
            name: s.name,
            value: Math.round(s.confidence * 100),
            category: s.category
        }))

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
                Extracted Skills Matrix
            </h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: '#374151', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`${value}% Confidence`, 'Score']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

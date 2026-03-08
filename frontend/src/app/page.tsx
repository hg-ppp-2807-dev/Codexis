"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Github, Bot, Sparkles } from 'lucide-react'
import RepoInput from '@/components/RepoInput'
import TechStackCard from '@/components/TechStackCard'
import SkillsChart from '@/components/SkillsChart'
import ArchSuggestions from '@/components/ArchSuggestions'
import ReadmePreview from '@/components/ReadmePreview'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (url: string) => {
    setIsLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const res = await fetch('http://localhost:8080/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url })
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to analyze repository')
      }

      const data = await res.json()
      setAnalysis(data)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* Header / Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            <Sparkles className="text-yellow-400" size={16} />
            <span className="text-sm font-medium tracking-wide">Codexis AI engine v1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Analyze any <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">GitHub</span> Repo
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed">
            Instantly extract the tech stack, evaluate code quality, review architecture, and uncover the developer skills needed for the project.
          </p>

          <RepoInput onSubmit={handleAnalyze} isLoading={isLoading} />

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg mt-4 border border-red-400/20">
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Results Dashboard */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-20 space-y-12"
            >
              {/* Summary Section */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Bot size={120} />
                </div>
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                  <Terminal className="text-blue-400" /> Executive Summary
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-4xl relative z-10">
                  {analysis.summary}
                </p>
              </div>

              {/* Grid Layout for Analytical Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <TechStackCard data={analysis.tech_stack} />
                  <ArchSuggestions data={analysis.architecture} />
                </div>
                <div className="space-y-6">
                  <SkillsChart data={analysis.skills} />

                  {/* Code Quality Snippet */}
                  <div className="bg-gray-900 rounded-2xl p-6 border border-white/5 h-auto">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-6 bg-yellow-500 rounded-full inline-block"></span>
                      Code Quality Scan
                    </h3>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="shrink-0 w-24 h-24 rounded-full border-8 border-gray-800 flex items-center justify-center relative">
                        {/* Circular Progress logic placeholder */}
                        <div className="absolute inset-0 rounded-full border-8 border-yellow-400" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${(analysis.code_quality?.overall_score || 0)}%, 0 ${(analysis.code_quality?.overall_score || 0)}%)` }}></div>
                        <span className="text-2xl font-bold z-10 relative">{analysis.code_quality?.overall_score || '?'}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-200">Overall Score</h4>
                        <p className="text-sm text-gray-400 mt-1">Based on file structure, dependencies, and testing patterns.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated README Full Width */}
              <ReadmePreview content={analysis.generated_readme} />

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}

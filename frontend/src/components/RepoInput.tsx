"use client"

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'

interface RepoInputProps {
    onSubmit: (url: string) => void
    isLoading: boolean
}

export default function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
    const [url, setUrl] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url.trim()) {
            onSubmit(url.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-8 relative">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
                    <div className="pl-4 text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://github.com/owner/repository"
                        required
                        disabled={isLoading}
                        className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder:text-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-500/30"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <span>Analyze</span>
                        )}
                    </button>
                </div>
            </div>
            <p className="text-gray-500 text-sm text-center mt-4 font-medium flex items-center justify-center space-x-2">
                <span>Powered by LangGraph & Google Gemini</span>
            </p>
        </form>
    )
}

-- Create Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    languages JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Analysis Reports Table
CREATE TABLE IF NOT EXISTS analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_id UUID REFERENCES repositories(id),
    summary TEXT,
    tech_stack JSONB,
    code_quality JSONB,
    architecture JSONB,
    skills JSONB,
    generated_readme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_repo ON analysis_reports(repo_id);

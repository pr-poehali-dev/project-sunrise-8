
CREATE TABLE IF NOT EXISTS video_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    topic TEXT,
    script TEXT,
    avatar_id VARCHAR(50),
    avatar_name VARCHAR(100),
    platform VARCHAR(50) DEFAULT 'reels',
    duration_sec INTEGER DEFAULT 60,
    style VARCHAR(50) DEFAULT 'professional',
    branding JSONB DEFAULT '{}',
    result_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_session ON video_projects(session_id);
CREATE INDEX idx_projects_status ON video_projects(status);
CREATE INDEX idx_projects_created ON video_projects(created_at DESC);

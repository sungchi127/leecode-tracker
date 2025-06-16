-- LeetCode Tracker Database Setup
-- 在 Supabase SQL Editor 中執行此腳本

-- 創建主要表格
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    "lcId" INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    url TEXT,
    description TEXT,
    starred BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE solutions (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    complexity TEXT,
    runtime INTEGER,
    memory DOUBLE PRECISION,
    note TEXT,
    "attemptNo" INTEGER NOT NULL,
    status TEXT DEFAULT 'Accepted',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "problemId" INTEGER NOT NULL,
    FOREIGN KEY ("problemId") REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT NOW(),
    "problemId" INTEGER NOT NULL,
    solved BOOLEAN DEFAULT false,
    "timeSpent" INTEGER,
    notes TEXT,
    FOREIGN KEY ("problemId") REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(date, "problemId")
);

-- 創建關聯表
CREATE TABLE "_ProblemTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE("A", "B")
);

CREATE TABLE "_ProblemCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE("A", "B")
);

-- 創建索引以提升性能
CREATE INDEX idx_problems_lcid ON problems("lcId");
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_solutions_problemid ON solutions("problemId");
CREATE INDEX idx_solutions_language ON solutions(language);
CREATE INDEX idx_progress_problemid ON progress("problemId");
CREATE INDEX idx_progress_date ON progress(date);

-- 插入初始測試資料
INSERT INTO categories (name, description) VALUES 
('Top 150', 'LeetCode Top 150 Interview Questions'),
('Hot 100', 'LeetCode Hot 100 Most Liked Questions'),
('劍指 Offer', '劍指 Offer 系列題目'),
('Dynamic Programming', '動態規劃相關題目'),
('Array', '陣列相關題目');

INSERT INTO tags (name, color) VALUES 
('Array', '#3B82F6'),
('String', '#10B981'),
('Dynamic Programming', '#8B5CF6'),
('Tree', '#F59E0B'),
('Graph', '#EF4444'),
('Binary Search', '#6366F1'),
('Two Pointers', '#EC4899'),
('Sliding Window', '#84CC16'),
('Backtracking', '#F97316'),
('Math', '#6B7280');

-- 確認表格創建成功
SELECT 'Tables created successfully!' as status; 
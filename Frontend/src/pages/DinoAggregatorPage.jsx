import { useState, useEffect } from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/Footer';
import API_URL from '../api/config';
import { toast } from 'react-toastify';
import { 
  FaTerminal, FaDatabase, FaExternalLinkAlt, FaCopy, 
  FaCheck, FaSearch, FaRocket, FaBuilding, FaGraduationCap, 
  FaGlobeAmericas, FaFlag, FaBolt, FaSyncAlt 
} from 'react-icons/fa';

const CLUSTERS = {
  startups: {
    id: 'startups',
    label: 'High-Growth Startups',
    icon: FaRocket,
    color: 'border-violet-500 bg-violet-50 text-violet-700',
    sources: ['greenhouse', 'lever', 'ashby', 'wellfound'],
    description: 'Direct ATS feeds from top startups & unicorns'
  },
  faang: {
    id: 'faang',
    label: 'Big Tech & AI Labs',
    icon: FaBuilding,
    color: 'border-blue-500 bg-blue-50 text-blue-700',
    sources: ['google', 'amazon', 'microsoft', 'apple', 'meta', 'openai', 'anthropic', 'nvidia'],
    description: 'Official direct career APIs from frontier tech leaders'
  },
  internships: {
    id: 'internships',
    label: 'SDE Internships',
    icon: FaGraduationCap,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    sources: ['internshala', 'greenhouse', 'ashby', 'linkedin', 'google', 'microsoft'],
    description: 'Verified student & early career engineering positions'
  },
  remote: {
    id: 'remote',
    label: 'Remote-First Hubs',
    icon: FaGlobeAmericas,
    color: 'border-cyan-500 bg-cyan-50 text-cyan-700',
    sources: ['weworkremotely', 'remotive', 'remoteok', 'himalayas', 'hackernews'],
    description: 'Curated 100% remote software developer roles'
  },
  india: {
    id: 'india',
    label: 'Indian Tech Market',
    icon: FaFlag,
    color: 'border-amber-500 bg-amber-50 text-amber-700',
    sources: ['naukri', 'internshala', 'linkedin', 'indeed'],
    description: 'Deepest coverage for India engineering & internships'
  }
};

export default function DinoAggregatorPage() {
  const [selectedCluster, setSelectedCluster] = useState('startups');
  const [keyword, setKeyword] = useState('Software Engineer');
  const [location, setLocation] = useState('Remote');
  const [limit, setLimit] = useState(25);
  const [saveToDb, setSaveToDb] = useState(false);
  const [sources, setSources] = useState(CLUSTERS.startups.sources);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync sources whenever cluster changes
  const handleClusterSelect = (clusterKey) => {
    setSelectedCluster(clusterKey);
    setSources(CLUSTERS[clusterKey].sources);
  };

  const handleToggleSource = (sourceName) => {
    if (sources.includes(sourceName)) {
      if (sources.length > 1) {
        setSources(sources.filter((s) => s !== sourceName));
      } else {
        toast.info("At least one source must remain selected.");
      }
    } else {
      setSources([...sources, sourceName]);
    }
  };

  const executeScrape = async () => {
    setLoading(true);
    setResults(null);

    const payload = {
      keyword: keyword.trim() || 'Software Engineer',
      location: location.trim() || 'Remote',
      sources: sources,
      limit: Number(limit) || 25,
      dryRun: !saveToDb,
      triggerSource: 'admin'
    };

    try {
      const res = await fetch(`${API_URL}/api/aggregator/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResults(data);

      if (data.success) {
        if (saveToDb && data.dbStats) {
          toast.success(`Success! Saved ${data.dbStats.insertedCount} jobs into PostgreSQL.`);
        } else {
          toast.success(`Retrieved ${data.normalizedCount || data.jobs?.length || 0} jobs successfully!`);
        }
      } else {
        toast.warning(data.message || 'Scrape service notice received.');
      }
    } catch (err) {
      toast.error('Failed to contact Dino_Mate aggregator backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatedCurlCommand = `curl -X POST "http://localhost:8080/api/aggregator/scrape" \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyword": "${keyword}",
    "location": "${location}",
    "sources": ${JSON.stringify(sources)},
    "limit": ${limit},
    "dryRun": ${!saveToDb},
    "triggerSource": "admin"
  }'`;

  const copyCommand = () => {
    navigator.clipboard.writeText(generatedCurlCommand);
    setCopied(true);
    toast.info("CLI cURL command copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white py-12 px-6 shadow-md border-b border-emerald-800/40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
                <img src="/dinomate.png" alt="" className="w-4 h-4 object-contain inline-block" /> Dino_Mate Live Engine &bull; 150+ Platforms
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Real-Time Job Aggregator
              </h1>
              <p className="mt-2 text-slate-300 max-w-2xl text-sm md:text-base">
                Scrape verified job listings from top ATS systems (Greenhouse, Lever, Ashby) and global boards, with instant 1-click persistence to your PostgreSQL database.
              </p>
            </div>

            {/* Quick Status Stats Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-sm flex flex-col gap-2 min-w-[260px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Sources:</span>
                <span className="font-bold text-emerald-400">172 Platforms</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Deduplication:</span>
                <span className="font-bold text-emerald-400">SHA-256 Enabled</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>DB Storage:</span>
                <span className={`font-bold ${saveToDb ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {saveToDb ? 'Direct PostgreSQL' : 'Dry Run (Memory)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          {/* 1. Recommended Platform Clusters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
              <FaBolt className="text-amber-500" /> Step 1: Select High-Performance Source Cluster
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(CLUSTERS).map(([key, cluster]) => {
                const IconComponent = cluster.icon;
                const isSelected = selectedCluster === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleClusterSelect(key)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className={`text-xl ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{cluster.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cluster.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Parameters & Controls Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
              <FaSearch className="text-emerald-600" /> Step 2: Configure Ingestion Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Job Keyword / Role Title</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. SDE Intern, Software Engineer, AI Engineer"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, India, San Francisco"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Result Limit ({limit} jobs)</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full accent-emerald-600 cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>10 (Fastest)</span>
                  <span>30 (Balanced)</span>
                  <span>50 (High Volume)</span>
                </div>
              </div>
            </div>

            {/* Active Sources Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Active Sources in Current Cluster ({sources.length} selected):
              </label>
              <div className="flex flex-wrap gap-2">
                {sources.map((src) => (
                  <span
                    key={src}
                    onClick={() => handleToggleSource(src)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer hover:bg-emerald-200 transition"
                    title="Click to toggle"
                  >
                    <span>&bull;</span> {src}
                  </span>
                ))}
              </div>
            </div>

            {/* Persistence Switch & Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToDb}
                  onChange={(e) => setSaveToDb(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FaDatabase className={saveToDb ? "text-emerald-600" : "text-slate-400"} />
                    Save Directly to Database (PostgreSQL)
                  </div>
                  <div className="text-xs text-slate-500">
                    {saveToDb 
                      ? 'Jobs will be stored in PostgreSQL and displayed in the main Job Catalog.'
                      : 'Dry run preview only. Nothing written to database.'}
                  </div>
                </div>
              </label>

              <button
                onClick={executeScrape}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSyncAlt className="animate-spin text-sm" />
                    <span>Scraping 150+ Platforms...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Run Aggregator & Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Terminal / CLI Command Box */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-emerald-400">
                <FaTerminal /> Run From Terminal (CMD / PowerShell / Bash)
              </div>
              <button
                onClick={copyCommand}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                <span>{copied ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl text-xs text-emerald-300 font-mono overflow-x-auto border border-slate-800/80 leading-relaxed">
              {generatedCurlCommand}
            </pre>
            <p className="text-[11px] text-slate-400">
              Tip: You can also run <code className="text-slate-200 font-mono">.\dino-job-sync.ps1 -Keyword "{keyword}" -Location "{location}" -SaveToDb</code> directly from PowerShell in your project folder!
            </p>
          </div>

          {/* 4. Results Section */}
          {results && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className={`p-5 rounded-2xl border ${
                results.success ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <span>{results.success ? '✅' : '⚠️'}</span>
                      <span>{results.message || 'Aggregator Execution Completed'}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Execution Time: <span className="font-semibold">{results.executionTimeMs || 0}ms</span> &bull; 
                      Normalized Jobs: <span className="font-semibold">{results.normalizedCount || results.jobs?.length || 0}</span> &bull;
                      Sources: <span className="font-semibold">{results.sourcesRun ? results.sourcesRun.join(', ') : sources.join(', ')}</span>
                    </div>
                  </div>

                  {results.dbStats && (
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-emerald-300 text-xs shadow-sm">
                      <div>
                        <span className="text-slate-500">Inserted:</span>{' '}
                        <strong className="text-emerald-600">{results.dbStats.insertedCount}</strong>
                      </div>
                      <div className="border-l pl-3">
                        <span className="text-slate-500">Skipped (Dupl):</span>{' '}
                        <strong className="text-amber-600">{results.dbStats.skippedCount}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Cards Grid */}
              {results.jobs && results.jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.jobs.map((job, idx) => (
                    <div
                      key={job.fingerprint || idx}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                              {job.company || 'Tech Company'}
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mt-0.5 leading-snug">
                              {job.title}
                            </h3>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                            {job.source || 'Aggregator'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            📍 {job.location || 'Remote'}
                          </span>
                          {job.workMode && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                              {job.workMode}
                            </span>
                          )}
                          {job.experienceLevel && (
                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                              {job.experienceLevel}
                            </span>
                          )}
                          {job.savedToDb && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              ✓ Saved in PostgreSQL
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.skills.slice(0, 5).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="text-[11px] px-1.5 py-0.5 text-slate-400">
                                +{job.skills.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        {job.salaryMin || job.salaryMax ? (
                          <div className="font-semibold text-slate-700">
                            💰 {job.currency || '$'}{job.salaryMin} - {job.salaryMax}
                          </div>
                        ) : (
                          <div className="text-slate-400">Competitive Compensation</div>
                        )}

                        <a
                          href={job.url || job.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg transition"
                        >
                          <span>Apply Official</span>
                          <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                results.success && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                    No jobs matched your criteria. Try adjusting keywords or selecting a different source cluster.
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { useState } from 'react';
import { MILESTONE_1_FILES } from '../data/kotlinCodebase';
import { CodeFile } from '../types/securedroid';
import { FileCode, Copy, Check, Download, Folder, ChevronRight, FileText, Search, PackageCheck } from 'lucide-react';
import JSZip from 'jszip';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(
    MILESTONE_1_FILES.find((f) => f.path === 'app/src/main/java/org/securedroid/vm/core/capability/DeviceCapabilityManager.kt') ||
      MILESTONE_1_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredFiles = MILESTONE_1_FILES.filter((f) =>
    (f.path || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Populate all Milestone 1 files
      MILESTONE_1_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add a gradle wrapper properties and root README
      zip.file(
        'README.md',
        `# SecureDroid VM — Milestone 1

## Security-Oriented Android Virtualization Architecture
Designed for Snapdragon 778G (POCO X5 Pro 5G) & Reference ARM64 Targets.

### Build & Run
1. Open this folder in Android Studio Jellyfish / Koala (2024.1+).
2. Sync Gradle with JDK 17.
3. Run \`./gradlew assembleDebug\` or run directly on POCO X5 Pro 5G with USB Debugging enabled.
4. Execute tests with \`./gradlew testDebugUnitTest\`.
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SecureDroidVM-Milestone1-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryColor = (category: CodeFile['category']) => {
    switch (category) {
      case 'core':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'ui':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'gradle':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'test':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'manifest':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Zip Exporter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 mb-1">MILESTONE 1 KOTLIN & GRADLE CODEBASE</div>
          <h2 className="text-xl font-bold text-slate-100">Clean Architecture Source Tree</h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            {MILESTONE_1_FILES.length} production files generated strictly conforming to Milestone 1 specifications.
          </p>
        </div>

        <button
          onClick={handleExportZip}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Packaging Project...' : 'Export Complete Android Studio Project (.zip)'}
        </button>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
        {/* Left File Tree Column */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search files or classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[520px]">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-slate-800 border border-cyan-500/40 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2 overflow-hidden">
                    <FileCode className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{file.path.split('/').pop()}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase shrink-0 ${getCategoryColor(file.category)}`}>
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer Column */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* File Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{selectedFile.path}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getCategoryColor(selectedFile.category)}`}>
                  {selectedFile.language.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Code Body with Line Numbers */}
          <div className="flex-1 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[520px] leading-relaxed">
            <pre className="whitespace-pre">
              {selectedFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell pr-4 text-slate-600 select-none text-right w-8 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell text-slate-300">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

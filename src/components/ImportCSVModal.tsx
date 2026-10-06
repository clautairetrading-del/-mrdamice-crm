'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { importLeadsFromCSV, CSVImportResult } from '@/lib/csvService';
import { FileSpreadsheet, UploadCloud, X, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agentId: string;
}

export function ImportCSVModal({ isOpen, onClose, onSuccess, agentId }: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleProcessCSV = () => {
    if (!file) {
      setErrorMsg('Tanpri chwazi yon dosye CSV anvan.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await importLeadsFromCSV(results.data as any[], agentId);
          setResult(res);
          onSuccess();
        } catch (err: any) {
          setErrorMsg(err.message || 'Erè nan trete dosye CSV a.');
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setErrorMsg('Erè nan lekti fichye CSV a: ' + err.message);
        setLoading(false);
      },
    });
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,full_name,phone,email\nJean Baptiste,+50937000001,jean@example.com\nMarie Joseph,+50937000002,marie@example.com";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modele_leads_mrdamice.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-900 dark:text-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            Enpòte Leads an Mas (Import CSV)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Download Sample CSV */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-amber-800 dark:text-amber-400">Modèl Fichye CSV Standard</p>
              <p className="text-gray-600 dark:text-gray-400">Fichye a dwe gen kolon: full_name, phone, email</p>
            </div>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors text-xs shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Telechaje Modèl
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-6 text-center transition-colors bg-gray-50/50 dark:bg-gray-900/50">
            <input
              type="file"
              accept=".csv"
              id="csv-file-input"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {file ? file.name : 'Klike pou w chwazi fichye CSV ou an'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Se sèlman dosye ki fini ak .csv ki aksepte
              </p>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Banner */}
          {result && (
            <div className="p-4 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Enpòtasyon an fini avèk siksè!
              </div>
              <p>• Nouvo Leads Ajoute: <strong>{result.addedCount}</strong></p>
              <p>• Doublon Detekte (sovgarde nan log): <strong>{result.duplicateCount}</strong></p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
            >
              Fèmen
            </button>
            <button
              type="button"
              disabled={!file || loading}
              onClick={handleProcessCSV}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                'Ap enpòte leads yo...'
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Lanse Enpòtasyon an
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

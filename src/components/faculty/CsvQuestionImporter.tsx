import React, { useState } from 'react';
import { CustomQuizQuestion, QuestionType } from '../../types';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface CsvQuestionImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: CustomQuizQuestion[]) => void;
}

interface RowError {
  row: number;
  message: string;
}

const SAMPLE_CSV = `type,question,options,correct,explanation,marks,numeric_answer,tolerance
single_mcq,"What is the worst-case lookup time in an AVL tree?","O(1)|O(log N)|O(N)|O(N log N)",1,"Strict balance factor maintains O(log N) height",2,,
multi_mcq,"Which of the following are properties of BFS?","Shortest paths|FIFO queue|O(1) space|Bipartite 2-coloring","0|1|3","BFS traverses level by level via FIFO queue",3,,
true_false,"Separate chaining hash table degrades to O(N) in worst case","True|False",0,"Linear scan occurs when all keys hash to same bucket",1,,
short_numeric,"A connected tree has 16 vertices. How many edges does it have?",,,Any tree with V vertices has V-1 edges,2,15,0`;

export const CsvQuestionImporter: React.FC<CsvQuestionImporterProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [copiedSample, setCopiedSample] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<CustomQuizQuestion[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  if (!isOpen) return null;

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_CSV);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        validateAndParse(content);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const validateAndParse = (rawText: string) => {
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: CustomQuizQuestion[] = [];
    const errorList: RowError[] = [];

    if (lines.length <= 1) {
      setErrors([{ row: 1, message: 'CSV file is empty or only contains header row.' }]);
      setParsedQuestions([]);
      setHasParsed(true);
      return;
    }

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1;
      const cols = parseCSVLine(lines[i]);

      if (cols.length < 2) {
        errorList.push({ row: rowNum, message: 'Insufficient columns in row.' });
        continue;
      }

      const typeRaw = cols[0]?.toLowerCase() as QuestionType;
      const questionText = cols[1];
      const optionsRaw = cols[2] || '';
      const correctRaw = cols[3] || '';
      const explanation = cols[4] || '';
      const marksRaw = cols[5];
      const numAnsRaw = cols[6];
      const toleranceRaw = cols[7];

      if (!['single_mcq', 'multi_mcq', 'true_false', 'short_numeric'].includes(typeRaw)) {
        errorList.push({ row: rowNum, message: `Invalid question type "${cols[0]}". Must be single_mcq, multi_mcq, true_false, or short_numeric.` });
        continue;
      }

      if (!questionText || questionText.trim().length === 0) {
        errorList.push({ row: rowNum, message: 'Question prompt cannot be empty.' });
        continue;
      }

      const marks = Math.max(1, parseInt(marksRaw) || 1);

      if (typeRaw === 'short_numeric') {
        const numVal = parseFloat(numAnsRaw);
        if (isNaN(numVal)) {
          errorList.push({ row: rowNum, message: 'Short numeric question requires a valid numeric_answer.' });
          continue;
        }
        const tolerance = Math.max(0, parseFloat(toleranceRaw) || 0);

        parsed.push({
          id: `csv-q-${Date.now()}-${i}`,
          questionType: 'short_numeric',
          questionText,
          options: [],
          correctAnswers: [],
          numericAnswer: numVal,
          tolerance,
          explanation,
          marks,
          orderIndex: parsed.length,
        });
      } else if (typeRaw === 'true_false') {
        const correctIndex = parseInt(correctRaw);
        if (isNaN(correctIndex) || (correctIndex !== 0 && correctIndex !== 1)) {
          errorList.push({ row: rowNum, message: 'True/False requires correct answer 0 (True) or 1 (False).' });
          continue;
        }

        parsed.push({
          id: `csv-q-${Date.now()}-${i}`,
          questionType: 'true_false',
          questionText,
          options: ['True', 'False'],
          correctAnswers: [correctIndex],
          explanation,
          marks,
          orderIndex: parsed.length,
        });
      } else {
        // MCQs
        const options = optionsRaw.split('|').map((o) => o.trim()).filter((o) => o.length > 0);
        if (options.length < 2) {
          errorList.push({ row: rowNum, message: 'MCQ question must provide at least 2 pipe-separated options (e.g. Option A|Option B).' });
          continue;
        }

        const correctIndices = correctRaw
          .split('|')
          .map((c) => parseInt(c.trim()))
          .filter((n) => !isNaN(n));

        if (correctIndices.length === 0) {
          errorList.push({ row: rowNum, message: 'At least one correct answer index is required (e.g. 0 or 0|2).' });
          continue;
        }

        const invalidIndex = correctIndices.find((idx) => idx < 0 || idx >= options.length);
        if (invalidIndex !== undefined) {
          errorList.push({ row: rowNum, message: `Correct answer index ${invalidIndex} is out of bounds for ${options.length} options.` });
          continue;
        }

        parsed.push({
          id: `csv-q-${Date.now()}-${i}`,
          questionType: typeRaw,
          questionText,
          options,
          correctAnswers: correctIndices,
          explanation,
          marks,
          orderIndex: parsed.length,
        });
      }
    }

    setParsedQuestions(parsed);
    setErrors(errorList);
    setHasParsed(true);
  };

  const handleApplyImport = () => {
    if (parsedQuestions.length > 0) {
      onImport(parsedQuestions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#F1E5E9] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F1E5E9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#24324B]">CSV Bulk Question Importer</h3>
              <p className="text-[11px] text-[#64748B]">
                Import large question banks with auto-validation and error diagnostics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sample Template Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[11px] font-extrabold text-[#24324B] block">Standard CSV Schema</span>
            <code className="text-[10px] text-[#64748B] font-mono block mt-0.5">
              type,question,options,correct,explanation,marks,numeric_answer,tolerance
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopySample}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#24324B] hover:border-[#2563EB] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            {copiedSample ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Template</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Sample CSV</span>
              </>
            )}
          </button>
        </div>

        {/* Upload or Paste */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#24324B]">
              Paste CSV Content or Upload .csv
            </label>
            <label className="cursor-pointer text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              validateAndParse(e.target.value);
            }}
            placeholder="Paste your CSV rows here (including header)..."
            className="w-full p-3.5 rounded-2xl border border-[#F1E5E9] bg-[#FFF9F5] text-[11px] font-mono text-[#24324B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors resize-y"
          />
        </div>

        {/* Validation Results */}
        {hasParsed && (
          <div className="space-y-3 mb-5 animate-in fade-in">
            {parsedQuestions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Successfully parsed {parsedQuestions.length} questions ready to import.</span>
              </div>
            )}

            {errors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Found {errors.length} formatting issues:</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] pl-5 list-disc">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-rose-700">
                      <strong>Row {err.row}:</strong> {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1E5E9]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-[#F1E5E9] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedQuestions.length === 0}
            onClick={handleApplyImport}
            className="px-5 py-2.5 rounded-2xl bg-gradient-sunset text-white text-xs font-black shadow-sunset hover:opacity-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Import {parsedQuestions.length > 0 ? `${parsedQuestions.length} Questions` : 'Questions'}
          </button>
        </div>
      </div>
    </div>
  );
};

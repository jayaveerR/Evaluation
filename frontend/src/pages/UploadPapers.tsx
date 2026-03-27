import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { API_BASE_URL } from '@/lib/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload as UploadIcon, FileUp, X, Loader2, CheckCircle2, ChevronRight, ScanSearch, Cpu, Scale, PenTool, Printer, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPapers() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Idle, 1: Uploading, 2: OCR, 3: Evaluating
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [extractedData, setExtractedData] = useState<any[] | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/exams`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setExams(data);
        } else {
          console.error('API Error:', data);
          setExams([]);
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
        setExams([]);
      }
    }
    fetchData();
  }, []);

  const handleLookupStudent = async () => {
    if (!rollNumber) {
      toast.error('Please enter a UUID / Roll Number first');
      return;
    }
    setSearchingStudent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${rollNumber}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Student not found');
      setStudentDetails(data);
      toast.success(`Student found: ${data.fullName}`);
    } catch (err: any) {
      setStudentDetails(null);
      toast.error(err.message || 'Lookup failed');
    } finally {
      setSearchingStudent(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleExtract = async () => {
    if (!selectedExam || files.length === 0) {
      toast.error('Please select an Exam and upload files.');
      return;
    }

    setLoading(true);
    setLoadingStep(1); // Uploading
    setTimeout(() => setLoadingStep(2), 2000); // OCR

    try {
      const formData = new FormData();
      formData.append('exam_id', selectedExam);
      files.forEach((file) => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Extraction failed');
      
      setExtractedData(data.extracted_data);
      toast.success('Document text extracted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Extraction failed.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleConfirmEvaluation = async () => {
    if (!extractedData) return;
    setEvaluating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: selectedExam,
          roll_number: rollNumber || 'RESERVED_UNASSIGNED',
          extracted_data: extractedData
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Evaluation failed');
      
      setResult(data);
      toast.success('AI Semantic Evaluation Complete!');
    } catch (err: any) {
      toast.error(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRecordToLedger = async () => {
    if (!studentDetails || !result) return;
    setRecording(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/record-ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: studentDetails.id || rollNumber,
          evaluation_result: result
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record results');

      toast.success('Marks recorded successfully for ' + studentDetails.fullName);
    } catch (err: any) {
      toast.error(err.message || 'Saving failed');
    } finally {
      setRecording(false);
    }
  };

  if (result) {
    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
            <div className="bg-primary p-8 text-center text-primary-foreground">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">AI Evaluation Complete</h1>
              <p className="mt-2 opacity-80">Student: <span className="font-bold underline">{result.roll_number}</span> • Match: {result.percentage}</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <Scale className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">MARKS DECLARED</h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">Total Score: <span className="text-primary font-black">{result.score}/{result.total}</span></p>
                  </div>
                </div>

                {!studentDetails ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Input 
                      placeholder="Enter Student UUID to Import Marks..." 
                      className="w-full md:w-[280px] font-mono text-xs h-11 bg-white border-primary/40 focus:ring-primary shadow-sm"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                    />
                    <Button onClick={handleLookupStudent} disabled={searchingStudent} className="w-full sm:w-auto h-11 px-6 font-bold shadow-md">
                      {searchingStudent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                      Verify & Import
                    </Button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-4 bg-white p-3 pr-2 rounded-xl border border-primary/30 shadow-sm w-full md:w-auto">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
                      {studentDetails.fullName?.charAt(0)}
                    </div>
                    <div className="mr-6">
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Assignment Target</p>
                      <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{studentDetails.fullName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="bg-success hover:bg-success/90 text-white font-black px-6 h-11 shadow-lg shadow-success/20" 
                        onClick={handleRecordToLedger}
                        disabled={recording}
                      >
                        {recording ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        SAVE TO LEDGER
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive h-11 w-11 rounded-lg hover:bg-destructive/10" onClick={() => { setStudentDetails(null); setRollNumber(''); }}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary/50 p-6 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Final Marks</p>
                  <p className="text-3xl font-black text-primary">{result.score}/{result.total}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/50 p-6 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Semantic Accuracy</p>
                  <p className="text-3xl font-black text-primary">{result.percentage}</p>
                </div>
                <div className="rounded-xl border border-border bg-success/5 p-6 text-center border-success/20">
                  <p className="text-[10px] font-bold text-success uppercase mb-2">Performance Grade</p>
                  <p className="text-3xl font-black text-success">{result.grade}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
                    <PenTool className="h-5 w-5 text-primary" />
                    Evaluation Breakdown
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {result.details && result.details.map((d: any, i: number) => (
                    <div key={i} className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                      <div className="bg-secondary/30 px-6 py-3 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-md">
                            {d.question_num}
                          </span>
                          <span className="font-bold text-sm uppercase tracking-tight">Semantic Logic Comparison</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Logic Match</p>
                            <p className="text-xs font-black text-primary">{d.semantic_match_percentage}%</p>
                          </div>
                          <span className="h-10 w-[1px] bg-border mx-2" />
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Marks</p>
                            <p className="text-lg font-black text-primary">{d.score}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 grid gap-6 md:grid-cols-2 bg-gradient-to-br from-background to-secondary/10">
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Student Extracted Question
                            </span>
                            <p className="p-4 rounded-xl bg-background border border-border text-sm italic text-muted-foreground">
                              {d.student_question}
                            </p>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                              Student Extracted Answer
                            </span>
                            <p className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-foreground font-medium">
                              {d.student_answer}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                              Instructor Model Answer Key
                            </span>
                            <p className="p-4 rounded-xl bg-background border border-border text-sm text-foreground font-mono">
                              {d.instructor_answer}
                            </p>
                          </div>
                          <div className="px-5 py-4 bg-primary/5 rounded-xl border border-primary/20">
                            <p className="text-[10px] font-bold text-primary uppercase mb-1">AI Feedback</p>
                            <p className="text-xs font-medium text-foreground italic">"{d.evaluation_feedback}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => {
                  setResult(null);
                  setExtractedData(null);
                  setShowJson(false);
                }} className="flex-1" variant="outline">
                  New OCR Pipeline
                </Button>
                <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Confirm
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Extraction Workflow</h1>
            <p className="text-sm text-muted-foreground uppercase font-black tracking-tight text-primary/60">Upload → Extract → Marks → UUID Assign</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-lg shadow-black/5">
          {studentDetails && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                  {studentDetails.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Verified Student</p>
                  <p className="text-sm font-bold text-foreground">{studentDetails.fullName}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-destructive" onClick={() => setStudentDetails(null)}>
                Change Student
              </Button>
            </motion.div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Exam</Label>
              <Select onValueChange={setSelectedExam} value={selectedExam} disabled={!!extractedData}>
                <SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Target Quiz/Exam" /></SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roll Number</Label>
              <Input 
                placeholder="e.g. STU-990" 
                className="h-11 shadow-sm" 
                value={rollNumber} 
                onChange={(e) => setRollNumber(e.target.value)} 
                disabled={!!extractedData}
              />
            </div>
          </div>

          <AnimatePresence>
            {!loading && !extractedData && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const newFiles = Array.from(e.dataTransfer.files);
                  setFiles(prev => [...prev, ...newFiles]);
                }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all bg-secondary/5 ${
                  dragOver ? 'border-primary bg-primary/5 scale-102 shadow-lg' : 'border-border hover:border-primary/40'
                }`}
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={onFileChange}
                  accept=".json,application/json"
                />
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <FileUp className="h-7 w-7 text-primary" />
                </div>
                <p className="mb-1 text-sm font-bold">Upload Student JSON</p>
                <p className="mb-5 text-[10px] text-muted-foreground font-mono">JSON FORMAT ONLY</p>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 bg-secondary/10 rounded-2xl border border-secondary shadow-inner">
              <div className="relative">
                <Loader2 className="h-14 w-14 animate-spin text-primary opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {loadingStep === 1 ? <FileUp className="h-7 w-7 text-primary animate-bounce" /> : <ScanSearch className="h-7 w-7 text-primary animate-pulse" />}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                  {loadingStep === 1 ? 'Uploading Bytes...' : 'Parsing Document Text...'}
                </p>
              </div>
            </div>
          )}

          {files.length > 0 && !loading && !extractedData && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3 border border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground truncate">{f.name}</span>
                    </div>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded-full hover:bg-destructive/10">
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <Button className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20" onClick={handleExtract} disabled={loading}>
                Process Document & Extract Content
              </Button>
            </div>
          )}

          {extractedData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="p-4 rounded-xl bg-success/5 border-2 border-success/20 flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-success/20">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-black text-success uppercase text-sm">Extraction Successful</h3>
                </div>
                
                <div className="flex w-full gap-3">
                  <Button 
                    className="flex-1 h-12 font-black uppercase tracking-tight text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                    onClick={() => setShowJson(!showJson)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showJson ? "Hide JSON Reveal" : "Reveal Document JSON"}
                  </Button>
                  
                  <Button 
                    className="flex-1 h-12 font-black uppercase tracking-tight text-xs bg-primary shadow-xl shadow-primary/20"
                    onClick={handleConfirmEvaluation}
                    disabled={evaluating}
                  >
                    {evaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-2 h-4 w-4" />}
                    Confirm Evaluation
                  </Button>
                </div>
              </div>

              {showJson && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
                  <div className="rounded-xl border-2 border-dashed border-border p-5 bg-card space-y-4">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Extracted Document JSON Output</p>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {extractedData.map((item, idx) => (
                        <div key={idx} className="space-y-2 p-3 rounded-lg bg-secondary/20 border border-border">
                          <p className="text-[10px] font-bold text-primary">QUESTION ID: {item.question_num}</p>
                          <div className="grid gap-3">
                            <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Extracted Question:</p>
                              <p className="text-xs font-medium text-foreground">{item.student_question}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Extracted Answer:</p>
                              <p className="text-xs font-mono text-foreground bg-white/50 p-2 rounded">{item.student_answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground text-[10px] uppercase font-bold"
                onClick={() => {
                  setExtractedData(null);
                  setFiles([]);
                  setShowJson(false);
                }}
              >
                Reset & Upload Different File
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

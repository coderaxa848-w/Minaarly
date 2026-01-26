import { useState, useCallback } from 'react';
import { Upload, FileText, Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParsedMosque {
  name: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  madhab: string | null;
  facilities: string[];
  lineNumber: number;
}

interface ParseError {
  lineNumber: number;
  rawLine: string;
  error: string;
}

interface DryRunResult {
  success: boolean;
  dryRun: boolean;
  totalLines: number;
  parsedCount: number;
  errorCount: number;
  preview: ParsedMosque[];
  errors: ParseError[];
}

interface ImportResult {
  success: boolean;
  dryRun: boolean;
  totalLines: number;
  parsedCount: number;
  parseErrors: number;
  insertedCount: number;
  insertErrorCount: number;
  insertErrors: { name: string; error: string }[];
  parseErrorSamples: ParseError[];
}

export default function ImportMosques() {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDryRunResult(null);
      setImportResult(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleDryRun = async () => {
    if (!csvText) {
      toast({ title: 'No file selected', description: 'Please upload a CSV file first', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setProgress(25);

    try {
      const { data, error } = await supabase.functions.invoke('import-mosques', {
        body: { csvText, dryRun: true },
      });

      setProgress(100);

      if (error) {
        toast({ title: 'Dry run failed', description: error.message, variant: 'destructive' });
        return;
      }

      setDryRunResult(data as DryRunResult);
      toast({ 
        title: 'Dry run complete', 
        description: `Parsed ${data.parsedCount} mosques with ${data.errorCount} errors` 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleImport = async () => {
    if (!csvText) {
      toast({ title: 'No file selected', description: 'Please upload a CSV file first', variant: 'destructive' });
      return;
    }

    if (!dryRunResult) {
      toast({ title: 'Run dry run first', description: 'Please run a dry run to preview the data before importing', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Simulate progress during import
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const { data, error } = await supabase.functions.invoke('import-mosques', {
        body: { csvText, dryRun: false },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
        return;
      }

      setImportResult(data as ImportResult);
      toast({ 
        title: 'Import complete!', 
        description: `Successfully imported ${data.insertedCount} mosques` 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Import Mosques</h1>
        <p className="text-muted-foreground">Bulk import mosques from CSV file</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Upload the MosquesJan26Extended.csv file to import mosque data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to select CSV file</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {file && (
            <div className="flex gap-3 mt-4">
              <Button onClick={handleDryRun} disabled={loading} variant="outline">
                {loading && !importResult ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Dry Run (Preview)
              </Button>
              <Button onClick={handleImport} disabled={loading || !dryRunResult}>
                {loading && dryRunResult ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import to Database
              </Button>
            </div>
          )}

          {loading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">Processing... {progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dry Run Results */}
      {dryRunResult && !importResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Parsing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{dryRunResult.totalLines}</p>
                  <p className="text-sm text-muted-foreground">Total Lines</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dryRunResult.parsedCount}</p>
                  <p className="text-sm text-muted-foreground">Successfully Parsed</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg col-span-2">
                  <p className="text-2xl font-bold text-red-600">{dryRunResult.errorCount}</p>
                  <p className="text-sm text-muted-foreground">Parse Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview (First 10 Records)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {dryRunResult.preview.map((mosque, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium">{mosque.name}</p>
                      <p className="text-muted-foreground">{mosque.address}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{mosque.city}</Badge>
                        <Badge variant="outline">{mosque.postcode}</Badge>
                        {mosque.madhab && <Badge>{mosque.madhab}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {dryRunResult.errors.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Parse Errors (First 20)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {dryRunResult.errors.map((error, idx) => (
                      <div key={idx} className="p-3 bg-red-500/10 rounded-lg text-sm">
                        <p className="font-medium text-red-600">Line {error.lineNumber}: {error.error}</p>
                        <p className="text-muted-foreground text-xs truncate">{error.rawLine}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.insertedCount > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResult.totalLines}</p>
                <p className="text-sm text-muted-foreground">Total Lines</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{importResult.parsedCount}</p>
                <p className="text-sm text-muted-foreground">Parsed</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importResult.insertedCount}</p>
                <p className="text-sm text-muted-foreground">Inserted</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{importResult.insertErrorCount}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            {importResult.insertErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Insert Errors (First 50)</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {importResult.insertErrors.map((error, idx) => (
                      <div key={idx} className="p-3 bg-red-500/10 rounded-lg text-sm">
                        <p className="font-medium">{error.name}</p>
                        <p className="text-red-600">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

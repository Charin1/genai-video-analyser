import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Upload, FileVideo, X, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";

type ProcessingStep = "idle" | "uploading" | "synthesizing" | "transcribing" | "enriching" | "complete";

const processingSteps = [
  { id: "synthesizing", label: "Synthesizing Audio", duration: 2000 },
  { id: "transcribing", label: "Transcribing", duration: 3000 },
  { id: "enriching", label: "Enriching Entities", duration: 2000 },
  { id: "complete", label: "Generating Strategy", duration: 1500 },
];

export default function NeuralCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      simulateProcessing();
    }
  }, []);

  const simulateProcessing = () => {
    setProcessingStep("uploading");
    setCurrentStepIndex(0);

    let stepIndex = 0;
    const runStep = () => {
      if (stepIndex < processingSteps.length) {
        setCurrentStepIndex(stepIndex);
        setProcessingStep(processingSteps[stepIndex].id as ProcessingStep);
        setTimeout(() => {
          stepIndex++;
          runStep();
        }, processingSteps[stepIndex].duration);
      }
    };

    setTimeout(runStep, 1000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      simulateProcessing();
    }
  }, []);

  const clearFile = () => {
    setUploadedFile(null);
    setProcessingStep("idle");
    setCurrentStepIndex(-1);
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] p-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-space font-bold text-foreground mb-2">
            Neural Capture
          </h1>
          <p className="text-muted-foreground">
            Record or upload your conversations for AI-powered analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Recording Section */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[320px]">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-destructive animate-pulse-glow"
                    : "bg-gradient-to-br from-primary to-secondary hover:scale-105"
                }`}
              >
                <Mic className="h-12 w-12 text-primary-foreground" />
                
                {/* Audio wave animation */}
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-end gap-1 h-8">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary-foreground/70 rounded-full animate-wave"
                          style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </button>
              
              <p className="mt-6 text-sm text-muted-foreground">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
              
              {isRecording && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-sm font-medium">00:00:32</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-8 min-h-[320px]">
              {!uploadedFile ? (
                <label
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <input
                    type="file"
                    accept="video/mp4,video/mov,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop your file here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP4, MOV, or audio files
                  </p>
                </label>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* File Info */}
                  <div className="flex items-center gap-3 mb-8 p-3 rounded-lg bg-muted/50 w-full">
                    <FileVideo className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {processingStep === "complete" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <button onClick={clearFile} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Processing Steps */}
                  <div className="w-full space-y-3">
                    {processingSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                          index <= currentStepIndex
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      >
                        {index < currentStepIndex ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : index === currentStepIndex ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span
                          className={`text-sm ${
                            index <= currentStepIndex
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {processingStep === "complete" && (
                    <Button variant="default" className="mt-6 w-full">
                      View Analysis
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

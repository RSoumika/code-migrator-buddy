import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Loader2,
  Code2,
  Zap,
  ArrowRight,
  PanelLeftClose,
  PanelLeft,
  GitCompare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CodeEditor from "@/components/CodeEditor";
import DiffViewer from "@/components/DiffViewer";
import TargetSelector from "@/components/TargetSelector";
import MigrationHistory, { MigrationSession } from "@/components/MigrationHistory";

const SAMPLE_LEGACY_CODE = `// Legacy JavaScript code
var UserManager = function() {
  this.users = [];
};

UserManager.prototype.addUser = function(name, email) {
  var self = this;
  var user = {
    id: Date.now(),
    name: name,
    email: email,
    createdAt: new Date()
  };
  self.users.push(user);
  return user;
};

UserManager.prototype.findUser = function(id) {
  for (var i = 0; i < this.users.length; i++) {
    if (this.users[i].id === id) {
      return this.users[i];
    }
  }
  return null;
};

UserManager.prototype.removeUser = function(id) {
  var self = this;
  this.users = this.users.filter(function(user) {
    return user.id !== id;
  });
};

// Usage
var manager = new UserManager();
manager.addUser('John', 'john@example.com');
console.log(manager.findUser(1));`;

const MigrationWorkspace = () => {
  const [sourceCode, setSourceCode] = useState(SAMPLE_LEGACY_CODE);
  const [migratedCode, setMigratedCode] = useState("");
  const [targetFormat, setTargetFormat] = useState<"es6" | "typescript">("es6");
  const [isLoading, setIsLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessions, setSessions] = useState<MigrationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  const handleMigrate = async () => {
    if (!sourceCode.trim()) {
      toast({
        title: "No code to migrate",
        description: "Please paste some legacy JavaScript code first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('migrate-code', {
        body: { code: sourceCode, targetFormat }
      });

      if (error) {
        console.error('Migration error:', error);
        toast({
          title: "Migration failed",
          description: error.message || "Failed to migrate code. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data?.migratedCode) {
        toast({
          title: "Migration failed",
          description: "No migrated code returned. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setMigratedCode(data.migratedCode);
      setShowDiff(true);
      
      // Save session
      const newSession: MigrationSession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        originalCode: sourceCode,
        migratedCode: data.migratedCode,
        targetFormat,
      };
      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession.id);
      
      toast({
        title: "Migration complete!",
        description: `Your code has been converted to ${targetFormat === "typescript" ? "TypeScript" : "ES6+"}.`,
      });
    } catch (err) {
      console.error('Migration error:', err);
      toast({
        title: "Migration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(migratedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "The migrated code has been copied.",
    });
  };

  const handleExport = () => {
    const blob = new Blob([migratedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `migrated.${targetFormat === "typescript" ? "ts" : "js"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File exported",
      description: `Saved as migrated.${targetFormat === "typescript" ? "ts" : "js"}`,
    });
  };

  const handleReset = () => {
    setSourceCode("");
    setMigratedCode("");
    setShowDiff(false);
    setSelectedSession(undefined);
  };

  const handleSelectSession = (session: MigrationSession) => {
    setSourceCode(session.originalCode);
    setMigratedCode(session.migratedCode);
    setTargetFormat(session.targetFormat);
    setShowDiff(true);
    setSelectedSession(session.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (selectedSession === id) {
      setSelectedSession(undefined);
    }
    toast({
      title: "Session deleted",
      description: "The migration session has been removed.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-border bg-card overflow-hidden"
          >
            <MigrationHistory
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              selectedId={selectedSession}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">CodeMigrate AI</h1>
                <p className="text-xs text-muted-foreground">Legacy to Modern JavaScript</p>
              </div>
            </div>
          </div>

          <TargetSelector value={targetFormat} onChange={setTargetFormat} />

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button 
              variant="glow" 
              size="sm" 
              onClick={handleMigrate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Migrate Code
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Editor Area */}
        <main className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {showDiff ? (
              <motion.div
                key="diff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col p-4"
              >
                {/* Diff Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Migration Diff</h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {sourceCode.split('\n').length} → {migratedCode.split('\n').length} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDiff(false)}>
                      Back to Editor
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button variant="success" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {/* Diff Viewer */}
                <div className="flex-1 overflow-auto rounded-lg">
                  <DiffViewer oldCode={sourceCode} newCode={migratedCode} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex p-4 gap-4"
              >
                {/* Source Editor */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Legacy Code
                    </h2>
                  </div>
                  <div className="flex-1">
                    <CodeEditor
                      value={sourceCode}
                      onChange={(val) => setSourceCode(val || "")}
                      language="javascript"
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center w-12">
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center"
                  >
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>

                {/* Preview/Output */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {targetFormat === "typescript" ? "TypeScript" : "ES6+"} Output
                    </h2>
                    {!migratedCode && (
                      <span className="text-xs text-muted-foreground/60 ml-2">
                        (click "Migrate Code" to transform)
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    {migratedCode ? (
                      <CodeEditor
                        value={migratedCode}
                        onChange={(val) => setMigratedCode(val || "")}
                        language={targetFormat === "typescript" ? "typescript" : "javascript"}
                      />
                    ) : (
                      <div className="h-full rounded-lg border border-dashed border-border bg-card/50 flex flex-col items-center justify-center">
                        <Zap className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Migrated code will appear here
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Powered by AI
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Status Bar */}
        <footer className="px-6 py-2 border-t border-border bg-card/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Lines: {sourceCode.split('\n').length}</span>
            <span>Target: {targetFormat === "typescript" ? "TypeScript" : "ES6+ Modules"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MigrationWorkspace;

import { motion } from "framer-motion";
import { History, Clock, FileCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MigrationSession {
  id: string;
  timestamp: Date;
  originalCode: string;
  migratedCode: string;
  targetFormat: "es6" | "typescript";
  fileName?: string;
}

interface MigrationHistoryProps {
  sessions: MigrationSession[];
  onSelectSession: (session: MigrationSession) => void;
  onDeleteSession: (id: string) => void;
  selectedId?: string;
}

const MigrationHistory = ({ 
  sessions, 
  onSelectSession, 
  onDeleteSession,
  selectedId 
}: MigrationHistoryProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) return "Today";
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No migrations yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Your migration history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">History</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {sessions.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              group relative p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200
              ${selectedId === session.id 
                ? "bg-primary/10 border border-primary/30" 
                : "hover:bg-secondary border border-transparent"
              }
            `}
            onClick={() => onSelectSession(session)}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-md flex items-center justify-center shrink-0
                ${session.targetFormat === "typescript" 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "bg-yellow-500/20 text-yellow-400"
                }
              `}>
                <FileCode className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {session.targetFormat === "typescript" ? "TS" : "ES6"}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="text-xs text-muted-foreground">
                    {session.originalCode.split('\n').length} lines
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate font-mono">
                  {session.originalCode.slice(0, 50)}...
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              <span>{formatDate(session.timestamp)}</span>
              <span>at</span>
              <span>{formatTime(session.timestamp)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MigrationHistory;

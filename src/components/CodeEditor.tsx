import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  placeholder?: string;
}

const CodeEditor = ({ 
  value, 
  onChange, 
  language = "javascript",
  readOnly = false,
  placeholder = "// Paste your legacy code here..."
}: CodeEditorProps) => {
  return (
    <motion.div 
      className="h-full w-full rounded-lg overflow-hidden border border-border bg-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Editor
        height="100%"
        language={language}
        value={value || placeholder}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          readOnly,
          wordWrap: "on",
          automaticLayout: true,
          renderLineHighlight: "gutter",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          tabSize: 2,
        }}
      />
    </motion.div>
  );
};

export default CodeEditor;

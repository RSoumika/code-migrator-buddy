import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { motion } from "framer-motion";

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  oldTitle?: string;
  newTitle?: string;
}

const customStyles = {
  variables: {
    dark: {
      diffViewerBackground: "hsl(222 47% 8%)",
      diffViewerColor: "hsl(210 40% 96%)",
      addedBackground: "hsla(142, 71%, 45%, 0.15)",
      addedColor: "hsl(142 71% 65%)",
      removedBackground: "hsla(0, 72%, 51%, 0.15)",
      removedColor: "hsl(0 72% 65%)",
      wordAddedBackground: "hsla(142, 71%, 45%, 0.3)",
      wordRemovedBackground: "hsla(0, 72%, 51%, 0.3)",
      addedGutterBackground: "hsla(142, 71%, 45%, 0.1)",
      removedGutterBackground: "hsla(0, 72%, 51%, 0.1)",
      gutterBackground: "hsl(222 47% 10%)",
      gutterBackgroundDark: "hsl(222 47% 8%)",
      highlightBackground: "hsla(199, 89%, 48%, 0.1)",
      highlightGutterBackground: "hsla(199, 89%, 48%, 0.15)",
      codeFoldGutterBackground: "hsl(222 47% 12%)",
      codeFoldBackground: "hsl(222 47% 14%)",
      emptyLineBackground: "hsl(222 47% 10%)",
      gutterColor: "hsl(215 20% 55%)",
      addedGutterColor: "hsl(142 71% 65%)",
      removedGutterColor: "hsl(0 72% 65%)",
      codeFoldContentColor: "hsl(215 20% 55%)",
      diffViewerTitleBackground: "hsl(222 47% 10%)",
      diffViewerTitleColor: "hsl(210 40% 96%)",
      diffViewerTitleBorderColor: "hsl(222 47% 16%)",
    },
  },
  line: {
    padding: "4px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    lineHeight: "20px",
  },
  gutter: {
    padding: "0 12px",
    minWidth: "40px",
  },
  content: {
    width: "100%",
  },
  titleBlock: {
    padding: "12px 16px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "600",
    fontSize: "13px",
    letterSpacing: "0.02em",
    textTransform: "uppercase" as const,
  },
  codeFold: {
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
  },
};

const DiffViewer = ({ 
  oldCode, 
  newCode, 
  oldTitle = "Original Code",
  newTitle = "Migrated Code"
}: DiffViewerProps) => {
  return (
    <motion.div 
      className="h-full w-full rounded-lg overflow-hidden border border-border"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={true}
        useDarkTheme={true}
        leftTitle={oldTitle}
        rightTitle={newTitle}
        styles={customStyles}
        compareMethod={DiffMethod.WORDS}
        showDiffOnly={false}
        hideLineNumbers={false}
      />
    </motion.div>
  );
};

export default DiffViewer;

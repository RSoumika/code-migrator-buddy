import { motion } from "framer-motion";
import { ArrowRightLeft, Code2, FileCode, Sparkles } from "lucide-react";

interface TargetSelectorProps {
  value: "es6" | "typescript";
  onChange: (value: "es6" | "typescript") => void;
}

const TargetSelector = ({ value, onChange }: TargetSelectorProps) => {
  const options = [
    {
      id: "es6" as const,
      label: "ES6+ Modules",
      description: "Modern JavaScript",
      icon: Code2,
    },
    {
      id: "typescript" as const,
      label: "TypeScript",
      description: "With Type Definitions",
      icon: FileCode,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ArrowRightLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Convert to:</span>
      </div>
      <div className="flex gap-2">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
              ${value === option.id 
                ? "border-primary bg-primary/10 text-foreground" 
                : "border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {value === option.id && (
              <motion.div
                layoutId="selector-glow"
                className="absolute inset-0 rounded-lg bg-primary/5 border border-primary/30"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <option.icon className={`h-4 w-4 ${value === option.id ? "text-primary" : ""}`} />
            <div className="text-left relative z-10">
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
            {value === option.id && (
              <Sparkles className="h-3 w-3 text-primary ml-1" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TargetSelector;

import { Helmet } from "react-helmet-async";
import MigrationWorkspace from "@/components/MigrationWorkspace";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>CodeMigrate AI - Transform Legacy JavaScript to Modern ES6+ & TypeScript</title>
        <meta 
          name="description" 
          content="AI-powered code migration tool that converts legacy JavaScript to modern ES6+ modules or TypeScript with proper type definitions. View diffs, export files, and track migration history." 
        />
        <meta name="keywords" content="code migration, JavaScript, ES6, TypeScript, AI, legacy code, modernization" />
      </Helmet>
      <MigrationWorkspace />
    </>
  );
};

export default Index;

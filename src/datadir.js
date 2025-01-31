import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module (ESM syntax)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the project root (where package.json is located)
const projectRoot = path.resolve(__dirname, '../');  // Adjust if needed

// Define the data directory at the same level as package.json
export const dataDir = path.join(projectRoot, 'data');

console.log('Data directory:', dataDir);

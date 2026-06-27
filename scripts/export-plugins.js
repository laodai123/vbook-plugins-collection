/**
 * export-plugins.js
 * 
 * Scans all directories for plugin.json files and exports a clean JSON list
 * with plugin metadata for external apps to consume.
 * 
 * Usage: node scripts/export-plugins.js
 * Output: plugins-list.json at repo root
 */

const fs = require('fs');
const path = require('path');

// Repository configuration
const REPO_ROOT = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(REPO_ROOT, 'plugins-list.json');
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Laodai123/vbook-plugins-collection/main';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

/**
 * Recursively find all plugin.json files in subdirectories
 */
function findPluginJsons(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip hidden files/directories and node_modules
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    
    if (entry.isDirectory()) {
      // Check if this directory has a plugin.json file
      const pluginJsonPath = path.join(fullPath, 'plugin.json');
      if (fs.existsSync(pluginJsonPath)) {
        results.push(pluginJsonPath);
      } else {
        // Recurse into subdirectory
        findPluginJsons(fullPath, results);
      }
    }
  }
  
  return results;
}

/**
 * Read and parse a plugin.json file
 */
function readPluginJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Support both flat structure and { metadata: {...}, script: {...} } structure
    const metadata = data.metadata || data;
    
    return {
      name: metadata.name || 'Unknown',
      author: metadata.author || 'Unknown',
      version: metadata.version || 1,
      source: metadata.source || '',
      description: metadata.description || '',
      type: metadata.type || 'novel',
      locale: metadata.locale || 'unknown',
      path: null // Will be constructed below
    };
  } catch (err) {
    console.warn(`  ${colors.yellow}⚠${colors.reset} Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Construct GitHub raw URL for a plugin.json file
 */
function constructGitHubUrl(pluginJsonPath) {
  // Get relative path from repo root
  const relativePath = path.relative(REPO_ROOT, pluginJsonPath);
  // Replace Windows backslashes with forward slashes
  const normalizedPath = relativePath.replace(/\\/g, '/');
  // URL encode special characters
  const encodedPath = normalizedPath.split('/').map(p => encodeURIComponent(p)).join('/');
  return `${GITHUB_RAW_BASE}/${encodedPath}`;
}

/**
 * Main export function
 */
function exportPlugins() {
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}📦 VBook Plugins Exporter${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  console.log(`${colors.dim}Scanning for plugin.json files...${colors.reset}`);
  
  // Find all plugin.json files
  const pluginFiles = findPluginJsons(REPO_ROOT);
  const totalFound = pluginFiles.length;
  
  console.log(`Found ${colors.blue}${totalFound}${colors.reset} plugin.json files\n`);
  
  // Process each plugin
  const plugins = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const filePath of pluginFiles) {
    const plugin = readPluginJson(filePath);
    
    if (plugin) {
      plugin.path = constructGitHubUrl(filePath);
      plugins.push(plugin);
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Sort plugins by name
  plugins.sort((a, b) => a.name.localeCompare(b.name));
  
  // Create output object
  const output = {
    metadata: {
      exportedAt: new Date().toISOString(),
      totalPlugins: plugins.length,
      repository: 'Laodai123/vbook-plugins-collection'
    },
    data: plugins
  };
  
  // Write to file
  const jsonContent = JSON.stringify(output, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');
  
  // Print summary
  console.log(`${colors.green}✅ Export complete!${colors.reset}`);
  console.log(`\n${colors.cyan}📊 Summary:${colors.reset}`);
  console.log(`  ├── Total plugins exported: ${colors.green}${successCount}${colors.reset}`);
  if (errorCount > 0) {
    console.log(`  ├── ${colors.yellow}Errors:${colors.reset} ${errorCount}`);
  }
  console.log(`  └── Output file: ${colors.blue}${OUTPUT_FILE}${colors.reset}`);
  
  // Locale breakdown
  const localeCounts = {};
  for (const plugin of plugins) {
    const locale = plugin.locale || 'unknown';
    localeCounts[locale] = (localeCounts[locale] || 0) + 1;
  }
  
  console.log(`\n${colors.cyan}🌍 Plugins by Locale:${colors.reset}`);
  for (const [locale, count] of Object.entries(localeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ├── ${locale}: ${count}`);
  }
  
  // Type breakdown
  const typeCounts = {};
  for (const plugin of plugins) {
    const type = plugin.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  
  console.log(`\n${colors.cyan}📂 Plugins by Type:${colors.reset}`);
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ├── ${type}: ${count}`);
  }
  
  console.log(`\n${colors.dim}File size: ${(jsonContent.length / 1024).toFixed(2)} KB${colors.reset}\n`);
}

// Run the export
try {
  exportPlugins();
} catch (err) {
  console.error(`${colors.yellow}❌ Error:${colors.reset}`, err.message);
  process.exit(1);
}
const fs = require('fs');
const path = require('path');

// Patterns to search for
const patterns = [
  /dark:bg-gray-\d+/g,
  /dark:text-gray-\d+/g,
  /dark:border-gray-\d+/g,
  /dark:hover:bg-gray-\d+/g,
  /dark:hover:text-gray-\d+/g,
  /dark:hover:border-gray-\d+/g,
  /bg-white(?!\s*\/)/g,  // bg-white but not bg-white/80
  /bg-gray-50\b/g,
  /bg-gray-100\b/g,
  /text-gray-900\b/g,
  /text-gray-700\b/g,
  /text-gray-600\b/g,
  /border-gray-200\b/g,
  /border-gray-300\b/g,
];

// Results storage
const results = {
  'dark:bg-gray-*': [],
  'dark:text-gray-*': [],
  'dark:border-gray-*': [],
  'dark:hover:bg-gray-*': [],
  'dark:hover:text-gray-*': [],
  'dark:hover:border-gray-*': [],
  'bg-white': [],
  'bg-gray-50': [],
  'bg-gray-100': [],
  'text-gray-900': [],
  'text-gray-700': [],
  'text-gray-600': [],
  'border-gray-200': [],
  'border-gray-300': [],
};

// Scan directory recursively
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules, .next, etc.
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.git') {
      return;
    }

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      scanFile(filePath);
    }
  });
}

// Scan individual file
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for className strings
    const classNameMatch = line.match(/className=["']([^"']+)["']/g);
    
    if (classNameMatch) {
      classNameMatch.forEach(classString => {
        // Check each pattern
        if (/dark:bg-gray-\d+/.test(classString)) {
          results['dark:bg-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/dark:text-gray-\d+/.test(classString)) {
          results['dark:text-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/dark:border-gray-\d+/.test(classString)) {
          results['dark:border-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/dark:hover:bg-gray-\d+/.test(classString)) {
          results['dark:hover:bg-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/dark:hover:text-gray-\d+/.test(classString)) {
          results['dark:hover:text-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/dark:hover:border-gray-\d+/.test(classString)) {
          results['dark:hover:border-gray-*'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\bbg-white\b(?!\/)/.test(classString)) {
          results['bg-white'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\bbg-gray-50\b/.test(classString)) {
          results['bg-gray-50'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\bbg-gray-100\b/.test(classString)) {
          results['bg-gray-100'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\btext-gray-900\b/.test(classString)) {
          results['text-gray-900'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\btext-gray-700\b/.test(classString)) {
          results['text-gray-700'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\btext-gray-600\b/.test(classString)) {
          results['text-gray-600'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\bborder-gray-200\b/.test(classString)) {
          results['border-gray-200'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
        
        if (/\bborder-gray-300\b/.test(classString)) {
          results['border-gray-300'].push({
            file: filePath.replace(/\\/g, '/'),
            line: index + 1,
            content: line.trim(),
            className: classString
          });
        }
      });
    }
  });
}

// Generate report
function generateReport() {
  console.log('\n🔍 THEME MIGRATION REPORT\n');
  console.log('='.repeat(80));
  
  let totalIssues = 0;
  
  Object.keys(results).forEach(pattern => {
    if (results[pattern].length > 0) {
      totalIssues += results[pattern].length;
      console.log(`\n📌 Pattern: ${pattern} (${results[pattern].length} occurrences)`);
      console.log('-'.repeat(80));
      
      results[pattern].forEach(item => {
        console.log(`   📁 ${item.file}:${item.line}`);
        console.log(`   ${item.className}`);
        console.log('');
      });
    }
  });
  
  console.log('='.repeat(80));
  console.log(`\n✅ Total issues found: ${totalIssues}\n`);
  
  // Summary
  console.log('\n📊 SUMMARY BY PATTERN:\n');
  Object.keys(results).forEach(pattern => {
    if (results[pattern].length > 0) {
      console.log(`   ${pattern.padEnd(30)} : ${results[pattern].length} issues`);
    }
  });
  
  // Generate replacement suggestions
  console.log('\n\n💡 SUGGESTED REPLACEMENTS:\n');
  console.log('   dark:bg-gray-900        →  (remove, use bg-card)');
  console.log('   dark:bg-gray-950        →  (remove, use bg-background)');
  console.log('   dark:bg-gray-800        →  (remove, use bg-muted)');
  console.log('   dark:text-gray-100      →  (remove, use text-foreground)');
  console.log('   dark:text-gray-300      →  (remove, use text-muted-foreground)');
  console.log('   dark:border-gray-800    →  (remove, use border-border)');
  console.log('   dark:border-gray-700    →  (remove, use border-border)');
  console.log('   bg-white               →  bg-card');
  console.log('   bg-gray-50             →  bg-secondary or bg-muted');
  console.log('   bg-gray-100            →  bg-muted');
  console.log('   text-gray-900          →  text-foreground');
  console.log('   text-gray-700          →  text-muted-foreground');
  console.log('   text-gray-600          →  text-muted-foreground');
  console.log('   border-gray-200        →  border-border');
  console.log('   border-gray-300        →  border-border');
  
  // Save to file
  const reportContent = JSON.stringify(results, null, 2);
  fs.writeFileSync('theme-issues-report.json', reportContent);
  console.log('\n\n💾 Full report saved to: theme-issues-report.json\n');
}

// Run the script
console.log('🚀 Scanning project for theme issues...\n');
scanDirectory('./src');
generateReport();
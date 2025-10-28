const fs = require('fs');
const path = require('path');

const fixes = {
  'src/app/(main)/explore/page.tsx': [
    // 1. Change default view to 'list'
    {
      search: "const [viewMode, setViewMode] = useState<ViewMode>('grid')",
      replace: "const [viewMode, setViewMode] = useState<ViewMode>('list')"
    },
    // 2. Remove emojis from sort options
    {
      search: '<option value="date-desc">📅 Newest First</option>',
      replace: '<option value="date-desc">Newest First</option>'
    },
    {
      search: '<option value="date-asc">📅 Oldest First</option>',
      replace: '<option value="date-asc">Oldest First</option>'
    },
    {
      search: '<option value="name-asc">🔤 A → Z</option>',
      replace: '<option value="name-asc">A → Z</option>'
    },
    {
      search: '<option value="name-desc">🔤 Z → A</option>',
      replace: '<option value="name-desc">Z → A</option>'
    },
    {
      search: '<option value="size-desc">💾 Largest First</option>',
      replace: '<option value="size-desc">Largest First</option>'
    },
    {
      search: '<option value="size-asc">💾 Smallest First</option>',
      replace: '<option value="size-asc">Smallest First</option>'
    },
    // 3. Disable upload button at root + add tooltip/message
    {
      search: `          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <UploadIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Upload Files</span>
          </motion.button>`,
      replace: `          <motion.button
            whileHover={{ scale: currentFolderId ? 1.05 : 1, y: currentFolderId ? -2 : 0 }}
            whileTap={{ scale: currentFolderId ? 0.95 : 1 }}
            onClick={() => currentFolderId && setIsUploadOpen(true)}
            disabled={!currentFolderId}
            className={\`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold shadow-lg transition-all \${
              currentFolderId
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            }\`}
            title={!currentFolderId ? 'Please create or open a folder first' : 'Upload files'}
          >
            <UploadIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Upload Files</span>
          </motion.button>`
    },
    // 4. Remove folder emoji from header
    {
      search: '📂 Explore',
      replace: 'Explore'
    },
    // 5. Remove folder emoji from section headers
    {
      search: '📁 Folders',
      replace: 'Folders'
    },
    {
      search: '📄 Files',
      replace: 'Files'
    }
  ]
};

console.log('🚀 Applying Phase 1 Quick Fixes...\n');

let totalFixed = 0;

Object.keys(fixes).forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  
  fixes[file].forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      fileChanged = true;
      totalFixed++;
    }
  });
  
  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n🎉 Done! Applied ${totalFixed} fixes\n`);
console.log('✅ Changes applied:');
console.log('   1. Default view changed to LIST');
console.log('   2. Removed ALL emojis from sort options');
console.log('   3. Upload button DISABLED at root folder');
console.log('   4. Shows tooltip: "Please create or open a folder first"\n');
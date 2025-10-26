const fs = require('fs');
const path = require('path');

// Define all replacements by file
const replacements = [
  // 1. src/app/(auth)/login/login-content.tsx
  {
    file: 'src/app/(auth)/login/login-content.tsx',
    changes: [
      {
        search: 'text-gray-500 dark:text-gray-500',
        replace: 'text-muted-foreground'
      }
    ]
  },

  // 2. src/app/(auth)/register/page.tsx
  {
    file: 'src/app/(auth)/register/page.tsx',
    changes: [
      {
        search: 'text-gray-500 dark:text-gray-500',
        replace: 'text-muted-foreground'
      }
    ]
  },

  // 3. src/app/(main)/activity/page.tsx
  {
    file: 'src/app/(main)/activity/page.tsx',
    changes: [
      {
        search: 'text-gray-400 hover:text-gray-600',
        replace: 'text-muted-foreground hover:text-foreground'
      }
    ]
  },

  // 4. src/app/(main)/notes/page.tsx
  {
    file: 'src/app/(main)/notes/page.tsx',
    changes: [
      {
        search: 'border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800',
        replace: 'border-b border-border bg-gradient-to-r from-card to-muted p-4'
      }
    ]
  },

  // 5. src/app/(main)/users/page.tsx
  {
    file: 'src/app/(main)/users/page.tsx',
    changes: [
      {
        search: 'text-gray-400 hover:text-gray-600',
        replace: 'text-muted-foreground hover:text-foreground'
      }
    ]
  },

  // 6. src/app/offline/page.tsx
  {
    file: 'src/app/offline/page.tsx',
    changes: [
      {
        search: 'bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700',
        replace: 'bg-card rounded-2xl shadow-xl border border-border'
      }
    ]
  },

  // 7. src/components/activity/activity-item.tsx
  {
    file: 'src/components/activity/activity-item.tsx',
    changes: [
      {
        search: 'rounded-full bg-gray-200 p-6 dark:bg-gray-800',
        replace: 'rounded-full bg-muted p-6'
      },
      {
        search: 'h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800',
        replace: 'h-12 w-12 animate-pulse rounded-xl bg-muted'
      },
      {
        search: 'h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800',
        replace: 'h-5 w-3/4 animate-pulse rounded bg-muted'
      },
      {
        search: 'h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800',
        replace: 'h-4 w-1/2 animate-pulse rounded bg-muted'
      }
    ]
  },

  // 8. src/components/auth/password-input.tsx
  {
    file: 'src/components/auth/password-input.tsx',
    changes: [
      {
        search: 'rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
        replace: 'rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      }
    ]
  },

  // 9. src/components/dashboard/loading-skeleton.tsx
  {
    file: 'src/components/dashboard/loading-skeleton.tsx',
    changes: [
      {
        search: 'h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800',
        replace: 'h-64 animate-pulse rounded-2xl bg-muted'
      }
    ]
  },

  // 10. src/components/file-viewer/file-info-card.tsx
  {
    file: 'src/components/file-viewer/file-info-card.tsx',
    changes: [
      {
        search: 'rounded-lg bg-gray-100 p-2 dark:bg-gray-800',
        replace: 'rounded-lg bg-muted p-2'
      }
    ]
  },

  // 11. src/components/file-viewer/image-viewer-enhanced.tsx
  {
    file: 'src/components/file-viewer/image-viewer-enhanced.tsx',
    changes: [
      {
        search: 'rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        replace: 'rounded-lg bg-muted p-2 transition-colors hover:bg-accent'
      }
    ]
  },

  // 12. src/components/file-viewer/loading-file-viewer.tsx
  {
    file: 'src/components/file-viewer/loading-file-viewer.tsx',
    changes: [
      {
        search: 'h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800',
        replace: 'h-48 animate-pulse rounded-2xl bg-muted'
      }
    ]
  },

  // 13. src/components/file-viewer/ocr-text-viewer.tsx
  {
    file: 'src/components/file-viewer/ocr-text-viewer.tsx',
    changes: [
      {
        search: 'flex gap-2 border-b border-gray-200 p-3 dark:border-gray-800',
        replace: 'flex gap-2 border-b border-border p-3'
      },
      {
        search: 'flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        replace: 'flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'
      }
    ]
  },

  // 14. src/components/theme-switcher.tsx
  {
    file: 'src/components/theme-switcher.tsx',
    changes: [
      {
        search: 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        replace: 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card shadow-sm'
      },
      {
        search: 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700',
        replace: 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card shadow-sm transition-colors hover:bg-accent'
      }
    ]
  },

  // 15. src/components/ui/dialog.tsx
  {
    file: 'src/components/ui/dialog.tsx',
    changes: [
      {
        search: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600',
        replace: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
      }
    ]
  },

  // 16. src/components/users/user-card.tsx
  {
    file: 'src/components/users/user-card.tsx',
    changes: [
      {
        search: 'h-64 animate-pulse rounded-2xl border-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800',
        replace: 'h-64 animate-pulse rounded-2xl border-2 border-border bg-muted'
      }
    ]
  }
];

// Process files
let totalChanges = 0;
let filesModified = 0;

console.log('🚀 Starting automatic theme fixes...\n');

replacements.forEach(({ file, changes }) => {
  const filePath = path.join(process.cwd(), file);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    return;
  }

  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  let changeCount = 0;

  // Apply all changes for this file
  changes.forEach(({ search, replace }) => {
    const occurrences = (content.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    
    if (occurrences > 0) {
      content = content.split(search).join(replace);
      fileChanged = true;
      changeCount += occurrences;
      totalChanges += occurrences;
    }
  });

  // Write back if changed
  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    console.log(`✅ ${file} (${changeCount} replacement${changeCount > 1 ? 's' : ''})`);
  } else {
    console.log(`⏭️  ${file} (no changes needed)`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n🎉 Done! Modified ${filesModified} files with ${totalChanges} total replacements.\n`);
console.log('✨ All themes (Light, Dark, Night, AMOLED) should now work!\n');
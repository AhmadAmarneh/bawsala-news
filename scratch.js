const fs = require('fs');
['app/login/page.tsx', 'app/register/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-slate-50/g, 'bg-background').replace(/bg-white/g, 'bg-card text-card-foreground');
  fs.writeFileSync(file, content);
});

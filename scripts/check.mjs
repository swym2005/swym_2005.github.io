import { readFile, access, readdir } from 'node:fs/promises';
const root = new URL('../dist/', import.meta.url);
const paths = ['index.html', 'projects.html', ...(await readdir(new URL('projects/',root))).filter(name=>name.endsWith('.html')).map(name=>`projects/${name}`)];
const contents = new Map(await Promise.all(paths.map(async name=>[name, await readFile(new URL(name,root),'utf8')])));
let checked=0;
for(const [name,html] of contents){
  const file=new URL(name,root);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length) throw new Error(`${name}: duplicate IDs`);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const reference=match[1];
    if(/^(https?:|mailto:|tel:|data:)/.test(reference)) continue;
    const link=new URL(reference,file);
    const target=new URL(link);target.hash='';target.search='';
    await access(target);
    if(link.hash){
      const targetHtml=target.href===file.href?html:await readFile(target,'utf8');
      if(!targetHtml.includes(`id="${link.hash.slice(1)}"`)) throw new Error(`${name}: missing anchor ${reference}`);
    }
    checked++;
  }
  for(const match of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)){
    for(const id of match[1].split(' '))if(!ids.includes(id))throw new Error(`${name}: missing accessible reference ${id}`);
  }
}
console.log(`Passed: ${paths.length} pages, ${checked} local links/assets, unique IDs, and accessible references.`);

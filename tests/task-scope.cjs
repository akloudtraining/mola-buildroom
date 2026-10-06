// Actual task GET route and migrations; fictional saved tasks in isolated SQLite.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync(path.join('drizzle',file),'utf8'));
const db={prepare(query){let values=[];const statement={bind(...v){values=v;return statement;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};return statement;},async batch(statements){const out=[];for(const s of statements)out.push(await s.run());return out;}};
const cache=new Map();function load(file){if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const req=name=>name==='@/lib/database'?{database:()=>db}:name.startsWith('@/')?load(name.slice(2)+'.ts'):(()=>{throw new Error('Unexpected import '+name);})();vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(req,module,module.exports);return module.exports;}
const {seed,canadaOnlyIds}=load('lib/board.ts'),{GET}=load('app/api/items/route.ts');
(async()=>{
 assert(!canadaOnlyIds.includes('DEV-041'),'Mola bank setup must not be Canada-only');assert(canadaOnlyIds.includes('DEV-042'),'Cameroon recipient routes remain in their own queue');
 const original={...seed.find(i=>i.id==='DEV-041'),release:'Later',notes:'2026-09-28: Deferred until Mola pilot acceptance (DEV-053). Preserve existing Canada/Cameroon records.',version:2};
 sql.prepare('INSERT INTO items (id,data,version) VALUES (?,?,?)').run(original.id,JSON.stringify(original),2);
 let response=await GET();assert.equal(response.status,200);let saved=(await response.json()).items.find(i=>i.id==='DEV-041');assert.equal(saved.release,'MVP');assert.equal(saved.version,3);assert.equal(saved.status,original.status);assert.match(saved.notes,/source project-scope error/);
 const untouched={...saved,version:9,release:'Later',notes:'Fictional owner changed the delivery order.'};sql.prepare('UPDATE items SET data=?,version=9 WHERE id=?').run(JSON.stringify(untouched),untouched.id);
 response=await GET();saved=(await response.json()).items.find(i=>i.id==='DEV-041');assert.deepEqual(saved,untouched,'Owner-edited tasks cannot be overwritten by the source repair');
 const newest=(await (await GET()).json()).items.find(i=>i.id==='DEV-083');assert.equal(newest.updated,'2026-10-04T19:41:00.000Z','New task updates retain their actual source date');
 console.log('BUILDROOM SCOPE PASS: Mola bank setup restored only from the unmodified old deferral; owner edits/status preserved; Cameroon recipients remain later; new task dates retained.');
})().catch(error=>{console.error(error);process.exitCode=1;});

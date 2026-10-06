// Execute the actual page's navigation and task/evidence handlers with fictional items.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),state=[],effects=[],requests=[],cache=new Map();
let cursor=0;
const fixture=[
 {id:'DEV-053',title:'Pilot acceptance',description:'Record actual member evidence',status:'Ready to test',kind:'Test',area:'Foundation',priority:'High',release:'MVP',owner:'',criteria:'',notes:'',dependencies:'',due:'',version:3,updated:'2026-10-04T00:00:00.000Z'},
 {id:'DEV-080',title:'Resend confirmation',description:'Recover expired confirmation links',status:'Ready to test',kind:'Bug',area:'Security',priority:'High',release:'MVP',owner:'',criteria:'',notes:'',dependencies:'',due:'',version:2,updated:'2026-10-04T00:00:00.000Z'}
];
const context=vm.createContext({console,document:{},fetch:async(target,init)=>{
 assert.equal(target,'/api/items');requests.push({target,init});
 if(init?.method==='POST'){const item=JSON.parse(init.body);return Response.json({item:{...item,version:item.version+1}});}
 return Response.json({items:fixture});
}});
function load(file){
 if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 function req(name){
  if(name==='react')return {useEffect:fn=>effects.push(fn),useCallback:fn=>fn,useState:initial=>{const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;}];}};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
  if(name==='lucide-react')return new Proxy({},{get:(_,key)=>String(key)});
  if(name==='sonner')return {Toaster:'Toaster',toast:{success(){},error(){}}};
  if(name==='@/lib/board')return load('lib/board.ts');
  if(name.startsWith('@/components/ui/'))return new Proxy({},{get:(_,key)=>String(key)});
  if(name.startsWith('./'))return {default:name.slice(2)};
  throw new Error('Unexpected import: '+name);
 }
 vm.runInContext('(function(require,module,exports){'+code+'\n})',context)(req,module,module.exports);return module.exports;
}
const Page=load('app/page.tsx').default;
const render=()=>{cursor=0;effects.length=0;return Page();};
function find(node,predicate){
 if(Array.isArray(node)){for(const child of node){const match=find(child,predicate);if(match)return match;}return null;}
 if(!node||typeof node!=='object')return null;if(predicate(node))return node;return find(node.props?.children,predicate);
}
const node=(tree,type)=>find(tree,n=>n.type===type);
const board=tree=>find(tree,n=>n.props?.['aria-label']==='Development Kanban board');
const search=tree=>find(tree,n=>n.props?.['aria-label']==='Search items');

(async()=>{
 render();await Promise.all(effects.map(fn=>fn()));await new Promise(setImmediate);let tree=render();
 assert(board(tree),'Task board is the initial working surface');
 assert.equal(node(tree,'pilot-readiness'),null,'Pilot panels do not precede the board');
 assert.equal(node(tree,'mobile-acceptance'),null);
 search(tree).props.onChange({target:{value:'resend'}});tree=render();
 node(tree,'Tabs').props.onValueChange('pilot');tree=render();
 assert.equal(board(tree),null);assert.equal(search(tree),null,'Board filters are hidden in the Pilot view');
 for(const panel of ['pilot-readiness','mobile-acceptance','pilot-runbook','evidence-capture'])assert(node(tree,panel),panel+' remains reachable');
 node(tree,'pilot-readiness').props.onOpen('DEV-080');tree=render();
 assert.equal(find(tree,n=>n.type==='input'&&n.props.placeholder==='What needs to happen?').props.value,'Resend confirmation');
 node(tree,'Dialog').props.onOpenChange(false);tree=render();
 node(tree,'pilot-runbook').props.onOpen();tree=render();
 assert.equal(find(tree,n=>n.type==='input'&&n.props.placeholder==='What needs to happen?').props.value,'Pilot acceptance');
 node(tree,'Dialog').props.onOpenChange(false);tree=render();
 await node(tree,'evidence-capture').props.save({...fixture[0],notes:'Fictional phone acceptance evidence'});tree=render();
 node(tree,'Tabs').props.onValueChange('board');tree=render();
 assert(board(tree));assert.equal(search(tree).props.value,'resend','Switching views preserves the search');
 search(tree).props.onChange({target:{value:''}});tree=render();
 const acceptance=find(tree,n=>n.type==='button'&&n.props.className==='task-card'&&find(n,c=>c.type==='h4'&&c.props.children==='Pilot acceptance'));
 acceptance.props.onClick();tree=render();
 assert.equal(find(tree,n=>n.type==='textarea'&&n.props.placeholder?.startsWith('Results, reproduction')).props.value,'Fictional phone acceptance evidence','Evidence saves update the same board item');
 assert.equal(requests.filter(r=>r.init?.method==='POST').length,1);
 assert.equal(requests.length,2,'Tab navigation never reloads or writes items');
 console.log('BUILDROOM NAVIGATION PASS: board first; Pilot panels and task links reachable; filters preserved; evidence saves update the board without extra requests. Browser/layout acceptance remains pending.');
})().catch(error=>{console.error(error);process.exitCode=1;});

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('app/evidence-capture.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness(){
 const state=[true,'DEV-058','Pass','Fictional phone · 390px','Checked the exact agreement and acceptance form.',false,''],ref={current:false},calls=[];let cursor=0,resolve,reject;
 const item={id:'DEV-058',title:'Phone acceptance',status:'Ready to test',notes:'Earlier owner evidence',version:6};
 const props={items:[item],disabled:false,save:next=>{calls.push(next);return new Promise((yes,no)=>{resolve=yes;reject=no;});}};
 const module={exports:{}};
 const req=name=>name==='react'?{useRef:()=>ref,useState:()=>{const i=cursor++;return [state[i],v=>state[i]=v];}}:name==='react/jsx-runtime'?{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})}:name==='sonner'?{toast:{success(){}}}:new Proxy({},{get:(_,key)=>String(key)});
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(req,module,module.exports);
 function find(node,predicate){if(Array.isArray(node)){for(const child of node){const r=find(child,predicate);if(r)return r;}return null;}if(!node||typeof node!=='object')return null;if(predicate(node))return node;return find(node.props?.children,predicate);}
 const render=()=>{cursor=0;return module.exports.default(props);};
 return {state,ref,calls,item,render,find,complete:()=>resolve(calls[0]),fail:()=>reject(new Error('The save could not be confirmed.'))};
}
(async()=>{
 let h=harness(),tree=h.render(),form=h.find(tree,n=>n.type==='form');
 const first=form.props.onSubmit({preventDefault(){}}),second=form.props.onSubmit({preventDefault(){}});assert.equal(h.calls.length,1);assert.equal(h.calls[0].status,'Ready to test','Passing evidence cannot mark a task Done');assert.equal(h.calls[0].version,6);assert(h.calls[0].notes.startsWith('Earlier owner evidence\n'));assert.match(h.calls[0].notes,/Pass.*390px.*exact agreement/);
 tree=h.render();assert.equal(h.find(tree,n=>n.type==='fieldset').props.disabled,true);h.find(tree,n=>n.type==='Dialog').props.onOpenChange(false);assert.equal(h.state[0],true,'Pending evidence cannot be dismissed');
 h.fail();await Promise.all([first,second]);assert.equal(h.state[0],true);assert.equal(h.state[3],'Fictional phone · 390px');assert.match(h.state[4],/exact agreement/);assert.match(h.state[6],/could not be confirmed/);assert.equal(h.ref.current,false);assert.equal(h.calls.length,1,'No automatic evidence retry');
 h=harness();h.state[3]='';tree=h.render();await h.find(tree,n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.equal(h.calls.length,0);assert.match(h.state[6],/device/);
 h=harness();tree=h.render();const success=h.find(tree,n=>n.type==='form').props.onSubmit({preventDefault(){}});h.complete();await success;assert.equal(h.state[0],false);assert.equal(h.state[5],false);assert.equal(h.calls[0].status,h.item.status);
 console.log('BUILDROOM EVIDENCE PASS: one pending append, locked fields/dismissal, retained failed observations, prior notes and status preserved, passing result requires a device, no automatic retry.');
})().catch(e=>{console.error(e);process.exitCode=1;});

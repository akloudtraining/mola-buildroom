'use client';

import {useState} from 'react';
import {molaPlanUpdates,seed} from '@/lib/board';

// Publication notes are source-owned; saved task notes and acceptance remain user-owned.
const releases=molaPlanUpdates.flatMap((update,index)=>update.patch.notes?[{id:update.id,note:update.patch.notes,index}]:[]).reverse();

export default function ReleaseHistory(){
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(5);
 const filtered=releases.filter(r=>`${r.id} ${r.note}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <section className="release-history" aria-labelledby="release-history-title">
  <div className="release-history-heading"><div><div className="eyebrow">DELIVERY RECORD</div><h2 id="release-history-title">What changed</h2></div><span>{releases.length} development updates</span></div>
  <p>Published development notes, newest first. These do not change your saved task status or count as acceptance. Your observations remain in each task’s Notes / test evidence.</p>
  <label className="field">Find an update<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(5);}} placeholder="Search a task ID or change…"/></label>
  <ol>{filtered.slice(0,limit).map(r=><li key={r.index}><strong>{r.id} · {seed.find(item=>item.id===r.id)?.title||'Development update'}</strong><p>{r.note}</p></li>)}</ol>
  {!filtered.length&&<p role="status">No updates match your search.</p>}
  {filtered.length>limit&&<button className="secondary" onClick={()=>setLimit(n=>n+10)}>Show more updates ({filtered.length-limit} remaining)</button>}
 </section>;
}

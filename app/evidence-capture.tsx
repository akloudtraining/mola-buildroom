'use client';

import {useRef,useState} from 'react';
import {ClipboardPenLine, LockKeyhole, ShieldCheck} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {Item} from '@/lib/board';
import {toast} from 'sonner';

const gates = [
 {id:'DEV-058',label:'DEV-058 · Phone follow-up'},
 {id:'DEV-053',label:'DEV-053 · Fictional-member browser pilot'}
] as const;

const outcomes = ['Pass','Pass with issue','Blocked','Not run','Deferred'] as const;

export default function EvidenceCapture({items,save,disabled}:{items:Item[];save:(item:Item)=>Promise<Item>;disabled:boolean}){
 const [open,setOpen]=useState(false),[gate,setGate]=useState<(typeof gates)[number]['id']>('DEV-058'),[outcome,setOutcome]=useState<(typeof outcomes)[number]>('Not run'),[device,setDevice]=useState(''),[notes,setNotes]=useState(''),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 const selected=items.find(item=>item.id===gate);
 const openCapture=()=>{if(pending.current)return;setError('');setOutcome('Not run');setDevice('');setNotes('');setOpen(true);};
 const submit=async(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();if(pending.current)return;
  if(!selected){setError('The selected task is not available yet. Refresh the board and try again.');return;}
  const cleanDevice=device.trim();
  const cleanNotes=notes.trim();
  if(!cleanNotes){setError('Add a short observation before saving evidence.');return;}
  if(['Pass','Pass with issue'].includes(outcome)&&!cleanDevice){setError('Record the device / viewport before saving a passing result.');return;}
  const timestamp=new Date().toISOString();
  const entry=`${timestamp} — ${selected.id} evidence capture: ${outcome}. Device/viewport: ${cleanDevice||'not recorded'}. Notes: ${cleanNotes}`;
  const next={...selected,notes:selected.notes?`${selected.notes}\n${entry}`:entry,updated:timestamp,status:selected.status};
  pending.current=true;setSaving(true);setError('');
  try{await save(next);setOpen(false);toast.success(`Evidence appended to ${selected.id}`);}catch(e){setError((e as Error).message);}finally{pending.current=false;setSaving(false);}
 };
 return <section className="evidence-capture" aria-labelledby="evidence-capture-title">
  <div className="evidence-capture-header"><div className="evidence-capture-icon"><ClipboardPenLine size={22}/></div><div><div className="eyebrow">ACCEPTANCE RECORD <span>/</span> PRIVATE BUILDROOM</div><h2 id="evidence-capture-title">Capture a test result</h2></div><span className="evidence-badge"><ShieldCheck size={14}/> Status stays unchanged</span></div>
  <p>Append a timestamped observation to DEV-058 or DEV-053 after a phone or fictional-member check. This writes only to the private development board; it does not invite members, touch Mola records, or change access.</p>
  <div className="evidence-capture-footer"><span><LockKeyhole size={15}/> Keep notes factual and omit passwords, bank details, ID numbers, and other sensitive data.</span><button type="button" className="secondary" onClick={openCapture} disabled={disabled||!selected}>Record evidence</button></div>
  <Dialog open={open} onOpenChange={value=>{if(!value&&!pending.current)setOpen(false);}}><DialogContent className="editor evidence-dialog"><DialogHeader><DialogTitle>Record acceptance evidence</DialogTitle><DialogDescription>Append one timestamped observation to the selected Buildroom task. The task status is never changed here. Passing outcomes require a device / viewport.</DialogDescription></DialogHeader><form className="evidence-form" onSubmit={submit}><fieldset disabled={saving} style={{border:0,padding:0,margin:0,minWidth:0,display:"grid",gap:14}}><label className="field">Follow-up area<select value={gate} onChange={event=>setGate(event.target.value as (typeof gates)[number]['id'])}>{gates.map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select></label><div className="evidence-selected"><strong>{selected?.id||gate}</strong><span>{selected?.title||'Task will appear after the board loads.'}</span><em>{selected?.status||'Unavailable'}</em></div><label className="field">Outcome<select value={outcome} onChange={event=>setOutcome(event.target.value as (typeof outcomes)[number])}>{outcomes.map(option=><option key={option} value={option}>{option}</option>)}</select></label><label className="field">Device / viewport<input maxLength={160} value={device} onChange={event=>setDevice(event.target.value)} placeholder="e.g. owner desktop · 1440px or iPhone Safari"/></label><label className="field">Observation<textarea required maxLength={1200} rows={5} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="What did you check? Include any reproduction steps or a blocker. No sensitive data."/></label>{error&&<p role="alert" className="save-error">{error}</p>}<div className="editor-footer"><span>Saving appends a timestamped note only.</span><button type="button" className="secondary" disabled={saving} onClick={()=>setOpen(false)}>Cancel</button><button type="submit" className="primary" disabled={saving||!selected}>{saving?'Saving…':'Append evidence'}</button></div></fieldset></form></DialogContent></Dialog>
 </section>;
}

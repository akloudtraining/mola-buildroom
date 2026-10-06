import {CheckCircle2,ClipboardCheck,LockKeyhole,ShieldCheck} from 'lucide-react';

const scenarios=[
 ['01','Access & isolation','Owner selects their own founder slot, then separate members sign in. Verify assigned/disabled-slot conflicts, private member details, organization boundaries and outsider denial.'],
 ['02','Dues & rate history','Two weekly cycles, future minimum change, immutable historical dues, and duplicate-safe generation.'],
 ['03','Submission & review','A USD 100 payment with USD 40 credited to a due keeps that credit when correcting evidence. Verify remaining balance, duplicate retry, independent review and self-review denial.'],
 ['04','Extra capital & correction','Preview dues before and after moving or removing credit. Verify capped suggestions, unallocated extra capital, invalid amounts, correction history, stale review rejection and overdue restoration.'],
 ['05','Private Activity state','Named member events, private read state, idempotent read retries, and invalid-event rejection.'],
 ['06','Currency & identity guards','Currency isolation, exact amount validation, member isolation, and no contributor self-verification.'],
 ['07','Adopted funding approval rule','Use the group’s configured threshold and designated founders. Check distinct approvers, requester exclusion, duplicate-safe approval, revocation, and changed-recipient reset.'],
 ['08','Final reconciliation','No duplicate organizations, payments, dues, or notification read receipts after the isolated run.']
 ,['09','Agreement versions & acceptance','Owner publishes the agreed draft; each founder accepts only for themselves. Verify exact historical text, duplicate/stale protection, account changes and fresh acceptance of a replacement version.']
 ,['10','Interrupted saves & retry conflicts','In isolated testing, interrupt a USD 150 report and retry its retained form with USD 200. Expect a visible conflict, retained input and one unchanged report. Restore the original details to confirm an exact retry.']
];

export default function PilotRunbook({onOpen,disabled}:{onOpen:()=>void;disabled:boolean}){
 return <section className="pilot-runbook" aria-labelledby="pilot-runbook-title">
  <div className="pilot-runbook-header"><div className="pilot-runbook-icon"><ClipboardCheck size={22}/></div><div><div className="eyebrow">DEFERRED FOLLOW-UP <span>/</span> DEV-053</div><h2 id="pilot-runbook-title">Fictional-member pilot runbook</h2></div><span className="pilot-badge"><CheckCircle2 size={14}/> API pass</span></div>
  <p>The automated suites run the actual auth and workspace handlers against an isolated in-memory database. The email-session suite simulates provider confirmation, issues session cookies, and verifies member access through the real identity-selection code. It does not touch Mola records, invite members, move money, or prove real multi-account browser access.</p>
  <div className="pilot-boundary"><LockKeyhole size={16}/><span>Browser and real-member testing are deferred by DEV-096. Resume these scenarios when useful and record actual outcomes in DEV-053; they do not hold up implementation.</span></div>
  <div className="pilot-grid">{scenarios.map(([number,title,detail])=><article key={number}><span className="pilot-number">{number}</span><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div>
  <div className="pilot-footer"><span><ShieldCheck size={15}/> Automated evidence: <code>pnpm run test:pilot-engineering</code> · 44 behavioral suites.</span><button className="secondary" type="button" onClick={onOpen} disabled={disabled}>Open DEV-053</button></div>
 </section>;
}

import {CheckCircle2,ShieldCheck,Smartphone} from 'lucide-react';

const checks=[
 'Open the private Mola URL in a phone-width viewport using the owner session only.',
 'Browse Overview, Contributions, Activity, Members, Statements, Projects, Funding requests, Governance, Accounts & recipients, and Agreements & notes.',
 'Open and cancel a contribution form, member-access form, obligation/deadline form, weekly-minimum form, account setup form, funding request, funding-approval form, governance decision, and meeting note.',
 'Switch Mola Holdings and the Canada/Cameroon group, then refresh; confirm the selected organization and records remain unchanged.',
 'Confirm there is no horizontal page overflow, tables scroll inside their panels, dialogs remain usable, and controls are easy to tap.',
 'Record the result in DEV-058. Testing is deferred by owner decision DEV-096; record the actual outcome when checked.'
];

export default function MobileAcceptance(){
 return <section className="mobile-gate" aria-labelledby="mobile-gate-title">
  <div className="mobile-gate-header"><div className="mobile-gate-icon"><Smartphone size={22}/></div><div><div className="eyebrow">DEFERRED FOLLOW-UP <span>/</span> DEV-058</div><h2 id="mobile-gate-title">Phone check · when needed</h2></div><span className="gate-badge"><ShieldCheck size={14}/> Read-only</span></div>
  <p>This check is deferred and does not hold up pilot development. When resumed, use the owner session to verify the current Mola build on a phone-sized viewport. The source-level CSS contract is only a regression guard; it does not replace this check. Do not invite members, save records, change access, move money, or switch storage authority during this check.</p>
  <ol>{checks.map((check,i)=><li key={check}><span><CheckCircle2 size={17}/></span><div><strong>{i===0?'Start here':i===checks.length-1?'Finish here':'Check'}</strong><p>{check}</p></div></li>)}</ol>
 </section>;
}

import React, { useMemo, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, ShieldCheck, Sparkles } from 'lucide-react';
import { money } from '../data.js';

const options = [
  { id: 'buy', label: 'Buy something', title: 'New sneakers', amount: 1800, kind: 'expense', emoji: '👟', note: 'A little treat, a bigger trade-off.' },
  { id: 'save', label: 'Save more', title: 'Move to savings', amount: 500, kind: 'save', emoji: '🌱', note: 'Move money from spending cash into your savings goal.' },
  { id: 'cut', label: 'Cut a cost', title: 'Cancel a subscription', amount: 299, kind: 'cut', emoji: '✂️', note: 'Cancel active non-essential subscriptions to reduce recurring costs.' },
  { id: 'income', label: 'Earn extra', title: 'Quick freelance gig', amount: 800, kind: 'income', emoji: '✨', note: 'Add a little breathing room.' }
];

export default function DecisionSimulator({ balance, allowance, savings, risk, days, commitment, subscriptions, onApply }) {
  const [sel, setSel] = useState('buy');
  const [amt, setAmt] = useState(1800);
  const o = options.find(x => x.id === sel);
  const cancelPlan = useMemo(() => {
    let left = amt;
    const ids = [];
    let monthlySaved = 0;
    for (const sub of subscriptions.filter(s => s.active && !s.essential)) {
      if (left <= 0) break;
      ids.push(sub.id);
      monthlySaved += sub.amount;
      left -= sub.amount;
    }
    return { ids, monthlySaved };
  }, [amt, subscriptions]);
  const effectiveCut = o.kind === 'cut' ? cancelPlan.monthlySaved : 0;
  const delta = o.kind === 'expense' || o.kind === 'save' ? -amt : o.kind === 'income' ? amt : 0;
  const projected = balance + delta;
  const allow = Math.max(0, (projected - commitment) / Math.max(1, days));
  const risk2 = Math.max(5, Math.min(95, Math.round(risk + (o.kind === 'expense' ? amt / 90 : o.kind === 'income' ? -amt / 100 : o.kind === 'cut' ? -effectiveCut / 25 : -amt / 200))));
  const canApply = amt > 0 && ((o.kind !== 'save' && o.kind !== 'expense') || amt <= balance);
  return <section className="panel simulator">
    <div className="section-heading"><div><div className="eyebrow"><Sparkles size={13}/> DECISION LAB</div><h2>What if you…</h2><p>Try a money move before making it real.</p></div><span className="live-pill">● LIVE SIMULATION</span></div>
    <div className="decision-options">{options.map(x => <button key={x.id} onClick={() => { setSel(x.id); setAmt(x.amount); }} className={'decision-option ' + (sel === x.id ? 'chosen' : '')}><span>{x.emoji}</span>{x.label}</button>)}</div>
    <div className="sim-main"><div className="sim-input"><div className="small-label">SIMULATE A DECISION</div><div className="sim-title"><h3>{o.title}</h3><span>{o.emoji}</span></div><p>{o.note}</p><label>Amount (₹)<div className="amount-input">₹ <input type="number" min="0" max={o.kind === 'cut' ? 3000 : undefined} value={amt} onChange={e => setAmt(Math.max(0, Number(e.target.value)))}/></div></label><input className="range" aria-label="Adjust decision amount" type="range" min="0" max="3000" step="50" value={Math.min(3000, amt)} onChange={e => setAmt(Number(e.target.value))}/><div className="range-labels"><span>₹0</span><span>₹3,000</span></div><div className="sim-note"><ShieldCheck size={15}/>{o.kind === 'expense' ? 'Available balance goes down.' : o.kind === 'save' ? 'Cash balance goes down and savings progress goes up.' : o.kind === 'cut' ? 'Future recurring costs go down; cash today stays the same.' : 'Available balance goes up.'}</div>{(o.kind === 'expense' || o.kind === 'save') && amt > balance && <p className="validation-note">This amount is higher than your available balance.</p>}{o.kind === 'cut' && effectiveCut < amt && <p className="validation-note">Only {money(effectiveCut)} in active non-essential subscriptions can be cancelled.</p>}</div>
      <div className="sim-results"><div className="result-title">HERE'S THE RIPPLE EFFECT <span>↗</span></div><div className="impact-row"><div><small>Available balance</small><b>{money(projected)}</b></div><strong className={delta < 0 ? 'negative' : 'positive'}>{delta > 0 ? '+' : ''}{money(delta)}</strong></div><div className="impact-row"><div><small>Daily allowance · next {days} days</small><b>{money(allow)} <small>/ day</small></b></div><strong className={allow < allowance ? 'negative' : 'positive'}>{allow >= allowance ? '+' : ''}{money(allow - allowance)}</strong></div><div className="impact-row"><div><small>Savings progress</small><b>{money(savings + (o.kind === 'save' ? amt : 0))}</b></div><strong className={o.kind === 'save' ? 'positive' : 'neutral'}>{o.kind === 'save' ? '+' + money(amt) : 'No change'}</strong></div>{o.kind === 'cut' && <div className="impact-row"><div><small>Monthly recurring costs reduced</small><b>{money(effectiveCut)}</b></div><strong className="positive">−{money(effectiveCut)}</strong></div>}<div className="risk-change"><span className="risk-symbol">{risk2 > risk ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}</span><span><small>Financial risk score</small><b>{risk2}/100 <em className={risk2 > risk ? 'negative' : 'positive'}>{risk2 > risk ? 'Risk rises' : risk2 < risk ? 'Risk lowers' : 'No change'}</em></b></span><div className="risk-mini"><span style={{ width: risk2 + '%' }}/></div></div><button className="apply-button" disabled={!canApply || (o.kind === 'cut' && effectiveCut === 0)} onClick={() => onApply(o, amt)}>Apply this decision <ArrowRight size={15}/></button><div className="sim-footnote">Planning estimate, not financial advice.</div></div>
    </div>
  </section>;
}

import {LitElement,html,nothing,unsafeCSS} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import styles from './style.css?inline'
import './style.css'
import {Desk,select,categories,stages,value,formatDate,type State} from './desk'
const count=(state:State)=>Object.fromEntries(stages.map(stage=>[stage,state.records.filter(r=>r.stage===stage).length]))
class EfficiencyBench extends LitElement {
 static styles=unsafeCSS(styles)
 static properties={view:{state:true}}
 private desk=new Desk()
 private stop?:()=>void
 private unsubscribe?:()=>void
 declare private view:State
 constructor(){super();this.view=this.desk.state}
 connectedCallback(){super.connectedCallback();this.unsubscribe=this.desk.subscribe(s=>{this.view=s});this.stop=this.desk.start()}
 disconnectedCallback(){this.stop?.();this.unsubscribe?.();super.disconnectedCallback()}
 render(){
  const {desk,view:s}=this
  const visible=select(s.records,s.query,s.filter,s.sort)
  const totals=count(s)
  return html`
<header class="top"><div class="wrap bar"><a class="brand" href="#board"><span class="mark" aria-hidden="true">◇</span>Model Serving Efficiency Bench</a><nav aria-label="Workspace"><a href="#board" aria-current=${s.page==='board' ? 'page' : null}>Benchmark runs</a><a href="#guide" aria-current=${s.page==='guide' ? 'page' : null}>Method notes</a></nav></div></header>
<main class="wrap">
${s.page==='board'?html`
<section class="hero"><div><p class="eyebrow">COMPUTE EFFICIENCY / WORK QUEUE</p><h1>Model Serving Efficiency Bench</h1><p class="lead">Compare energy measurements for model-serving changes before approving a rollout.</p></div><button type="button" @click=${(e:Event)=>{desk.edit()}}>New benchmark run</button></section>
<section class="stats" aria-label="Benchmark runs by stage">${repeat(stages,stage=>stage,stage=>html`<div class="stat"><span class="stat-label">${stage}</span><strong>${totals[stage] ?? 0}</strong></div>`)}</section>
<section class="panel" aria-labelledby="term-queue"><div class="panel-head"><h2 id="term-queue">Benchmark run queue</h2><span>${visible.length} visible</span></div>
<div class="filters"><label>Search records<input type="search" placeholder="Run, operator or setup" .value=${s.query} @input=${(e:Event)=>{desk.set({query:value(e)})}} /></label><label>Serving change<select aria-label="Serving change" .value=${s.filter} @change=${(e:Event)=>{desk.set({filter:value(e)})}}><option value="">All serving changes</option>${repeat(categories,x=>x,x=>html`<option .value=${x}>${x}</option>`)}</select></label><label>Sort by<select aria-label="Sort by" .value=${s.sort} @change=${(e:Event)=>{desk.set({sort:value(e)})}}><option value="due">Due date</option><option value="title">Title</option></select></label></div>
${s.success?html`<p role="status" class="success">${s.success}</p>`:nothing}
${s.error?html`<p role="alert">${s.error}</p><button type="button" @click=${(e:Event)=>{desk.load()}}>Reload list</button>`:nothing}
${s.loading?html`<p role="status">Loading records…</p>`:nothing}
${!s.loading && !s.error && visible.length===0?html`<p class="empty">No records match. Change the search or category.</p>`:nothing}
<ul class="records">${repeat(visible,row=>row.id,row=>html`<li><div><strong>${row.title}</strong><small>${row.owner} · ${row.context}</small><small class="measurement">Watt-hours per 1000 requests: ${row.amount}</small></div><span class="pill">${row.category}</span><span>${row.stage}</span><span>${formatDate(row.due)}</span><button type="button" class="secondary" @click=${(e:Event)=>{desk.edit(row)}} aria-label=${'Edit '+row.title}>Edit</button></li>`)}</ul></section>`:nothing}
${s.page==='editor'?html`<div class="inner"><a href="#board">← Back to benchmark runs</a><p class="eyebrow">COMPUTE EFFICIENCY / RECORD</p><h1>${s.id?'Edit record':'New record'}</h1><form class="panel form" @submit=${(e:Event)=>{desk.save(e)}}>
<label>Benchmark run title<input required type="text" maxLength="100" .value=${s.draft.title} @input=${(e:Event)=>{desk.field('title',e)}} /></label><label>Benchmark operator<input required type="text" maxLength="80" .value=${s.draft.owner} @input=${(e:Event)=>{desk.field('owner',e)}} /></label><label>Serving change<select aria-label="Serving change" .value=${s.draft.category} @change=${(e:Event)=>{desk.field('category',e)}}>${repeat(categories,x=>x,x=>html`<option .value=${x}>${x}</option>`)}</select></label><label>Stage<select aria-label="Stage" .value=${s.draft.stage} @change=${(e:Event)=>{desk.field('stage',e)}}>${repeat(stages,x=>x,x=>html`<option .value=${x}>${x}</option>`)}</select></label><label>Run setup reference<input required type="text" maxLength="100" .value=${s.draft.context} @input=${(e:Event)=>{desk.field('context',e)}} /></label><label>Watt-hours per 1000 requests<input type="number" required min="1" max="10000" step="1" .value=${s.draft.amount??''} @input=${(e:Event)=>desk.field('amount',e)} /></label><label>Due date<input required type="date"  .value=${s.draft.due} @input=${(e:Event)=>{desk.field('due',e)}} /></label>
<label class="wide">Comparison and test conditions<textarea required maxLength="500" rows="3" .value=${s.draft.notes} @input=${(e:Event)=>{desk.field('notes',e)}}></textarea></label>
${s.error?html`<p role="alert" class="wide">${s.error}</p>`:nothing}
<div class="wide form-actions"><button type="submit" .disabled=${s.saving}>${s.saving?'Saving…':'Save record'}</button><a href="#board">Cancel</a></div></form></div>`:nothing}
${s.page==='guide'?html`<div class="inner"><p class="eyebrow">COMPUTE EFFICIENCY / PLAYBOOK</p><h1>Keep benchmark conditions comparable</h1><article class="panel guide"><h2>Review checklist</h2><p>Run the same request mix at comparable load and note the meter boundary. Check latency and response quality before interpreting an energy difference.</p><h2>Before closing a record</h2><p>Close the comparison only after the baseline setup, test conditions and any quality tradeoff are recorded.</p><a href="https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act">Read the official background</a></article></div>`:nothing}
</main><footer class="wrap footer">Model Serving Efficiency Bench <span>·</span> Sample workspace</footer>`
 }
}
customElements.define('efficiency-bench',EfficiencyBench)
document.getElementById('app')!.append(document.createElement('efficiency-bench'))

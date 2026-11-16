import{i as e,t}from"./jsx-runtime-Cx0BB4qO.js";import{n,t as r}from"./classnames-DwgxuFP5.js";import{n as i,t as a}from"./Input-B7uVRVk-.js";import{t as o,u as s}from"./SelectCore-voinwAZG.js";import{t as c}from"./Chip-1Mn7NEx8.js";import{t as l}from"./Select-CfwZ_hrf.js";import{t as u}from"./CheckboxCore-DMkZMHK0.js";import{t as d}from"./Switch-Dgw_oJK2.js";import{t as f}from"./Badge-cOLEPnOI.js";import{i as p}from"./menuKeyboard-CKzeeh_N.js";import{t as m}from"./Tooltip-CXLh7Y5n.js";import{f as h,n as g,r as _,s as v,t as y,u as b}from"./ConfirmDialog-DCmL7_Fe.js";import{t as x}from"./Card-CYrd9D1N.js";import{N as S,P as C,_ as w,f as T,g as E,h as D,n as O,r as k,s as ee,t as A}from"./PasswordInputCore-CdP7gBwF.js";import{t as j}from"./Avatar-BIau1hC4.js";import{n as M,t as te}from"./useToast-D6xe3E3t.js";import{a as N,i as ne,n as re,r as P,t as ie}from"./ThinkingIndicator-BR_NRk1h.js";import{t as ae}from"./Progress-VDIyBd16.js";import{C as oe,a as se,b as F,g as ce,i as le,l as I,n as ue,r as de,t as fe,y as pe}from"./schemas-DIHN92HJ.js";import{t as me}from"./useClipboard-vfymnL4M.js";import{t as L}from"./Kbd-CsfFuKHu.js";import{n as he,r as ge,t as _e}from"./Collapsible-BY6oHyQg.js";import{t as R}from"./Segmented-CMLYIM_i.js";import{C as ve,S as ye,_ as be,a as xe,b as Se,f as Ce,g as z,h as we,i as Te,l as Ee,m as De,n as Oe,o as ke,p as Ae,r as je,s as Me,t as Ne,u as B,v as V,x as H,y as Pe}from"./stackblitz-BVjCFTKe.js";import{t as Fe}from"./AvatarGroup-DfZGybhJ.js";import{n as U,t as Ie}from"./StreamingText-D8f2AhTV.js";import{n as Le,r as Re,t as ze}from"./ConversationItem-DbThHj8q.js";import{d as W,i as Be,l as Ve,m as G,s as He}from"./index-DTFmVJX0.js";import{a as Ue,r as We}from"./styles-DBn9Gwwz.js";import{t as K}from"./createLucideIcon-ImJ9FoQF.js";import{t as Ge}from"./search-CgLO0CJ1.js";var Ke={name:`ellipsis`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`1`,key:`41hilf`}],[`circle`,{cx:`19`,cy:`12`,r:`1`,key:`1wjl8i`}],[`circle`,{cx:`5`,cy:`12`,r:`1`,key:`1pcz8c`}]],aliases:[`more-horizontal`]};Ke.node;var qe=K(Ke),Je={name:`file-search`,size:24,node:[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`circle`,{cx:`11.5`,cy:`14.5`,r:`2.5`,key:`1bq0ko`}],[`path`,{d:`M13.3 16.3 15 18`,key:`2quom7`}]]};Je.node;var Ye=K(Je),Xe={name:`git-pull-request`,size:24,node:[[`circle`,{cx:`18`,cy:`18`,r:`3`,key:`1xkwt0`}],[`circle`,{cx:`6`,cy:`6`,r:`3`,key:`1lh9wr`}],[`path`,{d:`M13 6h3a2 2 0 0 1 2 2v7`,key:`1yeb86`}],[`line`,{x1:`6`,x2:`6`,y1:`9`,y2:`21`,key:`rroup`}]]};Xe.node;var Ze=K(Xe),Qe={name:`messages-square`,size:24,node:[[`path`,{d:`M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z`,key:`1n2ejm`}],[`path`,{d:`M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1`,key:`1qfcsi`}]]};Qe.node;var $e=K(Qe),et={name:`plus`,size:24,node:[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`M12 5v14`,key:`s699le`}]]};et.node;var tt=K(et),q=e(n(),1),J=t(),nt=`Nimbus Review Copilot`,rt=`Dev`,Y=[{value:`nimbus-4o`,label:`Nimbus 4o`,contextLength:`128k`,cps:14},{value:`nimbus-4o-mini`,label:`Nimbus 4o mini`,contextLength:`32k`,cps:26},{value:`nimbus-reasoner`,label:`Nimbus reasoner`,contextLength:`200k`,cps:9}],it=[`Ana Petrova`,`Ben Okafor`,`Chen Wei`,`Dana Silva`],at=`Review PR #482 — is the new retry loop safe to ship?`,ot=`{ "repo": "nimbus-gateway",
  "pull": 482,
  "focus": "retry.go" }`,st=`retry.go        +38 −4
backoff cap     2s → 8s
payload policy  unchanged (verbatim)
tests           11 passed, 2 skipped`,ct=`Mostly safe, with one sharp edge. The doubled backoff cap is fine and the new jitter prevents thundering herds, but the webhook path still retries the 1.2 MB payload verbatim — exactly the failure mode from the week-42 incident. Key retries on the Idempotency-Key header and fall back to the batched format after two failures; that mirrors the fix that recovered Ferrite Labs. The two skipped tests are the webhook ones, so add coverage there before merge.`,lt=`Checked the CI history for this branch: the skipped webhook tests have been skipped for three weeks (imported flag), not flaked. I can draft the idempotency patch on a side branch and link it to the PR — want the diff posted here or as review comments?`,ut=[{id:`retry-go`,title:`gateway/retry.go @ v2.3`,url:`#ai-workbench`,snippet:`backoff := base * math.Pow(2, float64(attempt)); if backoff > cap { backoff = cap }`},{id:`postmortem`,title:`postmortem/webhook-410.md`,url:`#ai-workbench`,snippet:`The 1.2 MB body is rejected by the gateway before ingest; every retry re-sends it verbatim.`},{id:`runbook`,title:`runbook/retries.md`,url:`#ai-workbench`,snippet:`Retries must be idempotent — key them on Idempotency-Key, never on attempt count.`}],dt=[{id:`retry-loop`,title:`PR #482 · retry loop safety`,subtitle:`nimbus-gateway`,time:`2m`},{id:`flaky-e2e`,title:`Flaky e2e: checkout spec`,subtitle:`nimbus-web`,time:`1h`},{id:`migration-notes`,title:`Draft v2.3 migration notes`,subtitle:`docs`,time:`3h`},{id:`secrets`,title:`Rotate leaked CI secrets`,subtitle:`infra`,time:`yesterday`}],ft={"retry-loop":[{id:1,kind:`user`,text:at}],"flaky-e2e":[{id:1,kind:`user`,text:`The checkout spec failed twice on main last night — same assertion?`},{id:2,kind:`answer`,phase:`done`,text:`Different assertions, same cause: both runs raced the stubbed clock at midnight UTC. Freeze the clock fixture and the pair of failures collapses into one deterministic case.`}]},pt={thinkMs:900,tool:{thoughtSeconds:4,runMs:1100},answer:ct},mt={thinkMs:700,tool:{thoughtSeconds:3,runMs:900},answer:lt};function ht(e){return`14:${String(5+e%50).padStart(2,`0`)}`}var X=e=>new Promise(t=>{setTimeout(t,e)});function gt(e,t){return X(200).then(()=>{if(e!==`@`)return[];let n=t.toLowerCase();return it.filter(e=>e.toLowerCase().startsWith(n))})}function _t({children:e}){return(0,J.jsx)(`code`,{style:{fontFamily:`var(--haze-font-mono)`,fontSize:`var(--haze-text-xs)`,whiteSpace:`pre`,color:`var(--haze-color-text-secondary)`},children:e})}function vt(){let[e,t]=(0,q.useState)(dt),[n,r]=(0,q.useState)(ft),[i,a]=(0,q.useState)({}),[o,s]=W(void 0,`retry-loop`),[c,,l]=W(void 0,Y[0].value),[u,,d]=W(void 0,``),[,p,m]=W(void 0,[`repo: nimbus-gateway`,`PR #482`]),[h,g,_]=W(void 0,!1),[v,y]=W(void 0,!1),b=Y.find(e=>e.value===c)??Y[0],x=(0,q.useRef)(0),S=(0,q.useRef)(100),C=()=>S.current+=1;(0,q.useEffect)(()=>()=>{x.current+=1},[]);let w=(0,q.useCallback)((e,t)=>{r(n=>({...n,[e]:[...n[e]??[],t]}))},[]),T=(0,q.useCallback)((e,t,n)=>{r(r=>({...r,[e]:(r[e]??[]).map(e=>e.id===t?n(e):e)}))},[]),E=(0,q.useCallback)((e,t)=>{a(n=>({...n,[e]:t}))},[]),D=(0,q.useCallback)(async(e,t)=>{let n=x.current+=1,r=()=>n===x.current;E(e,`thinking`);let i=C();if(w(e,{id:i,kind:`thinking`}),await X(t.thinkMs),!r())return;let a=t.tool?t.tool.thoughtSeconds:Math.max(1,Math.round(t.thinkMs/1e3));if(T(e,i,()=>({id:i,kind:`thought`,seconds:a})),t.tool){E(e,`tool`);let n=C();if(w(e,{id:n,kind:`tool`,status:`running`}),await X(t.tool.runMs),!r())return;T(e,n,()=>({id:n,kind:`tool`,status:`done`}))}E(e,`answering`),w(e,{id:C(),kind:`answer`,text:t.answer,phase:`streaming`})},[w,T,E]);(0,q.useEffect)(()=>{let e=setTimeout(()=>{D(`retry-loop`,pt)},0);return()=>clearTimeout(e)},[D]);let O=(i[o]??`idle`)!==`idle`,k=e=>{e.trim()&&(w(o,{id:C(),kind:`user`,text:e}),D(o,mt))},ee=()=>{x.current+=1,E(o,`idle`),r(e=>{let t=[...e[o]??[]];for(;t.length>0;){let e=t[t.length-1];if(!(e.kind===`thinking`||e.kind===`tool`&&e.status===`running`||e.kind===`answer`&&e.phase===`streaming`))break;t.pop()}return{...e,[o]:t}})},A=()=>{let n=`review-${e.length+1}`;t(e=>[{id:n,title:`New review session`,subtitle:`no repo bound`,time:`now`},...e]),s(n)},M=e=>{T(o,e,e=>e.kind===`answer`?{...e,phase:`done`}:e),E(o,`idle`)},te=e=>{switch(e.kind){case`user`:return(0,J.jsx)(U,{role:`user`,name:rt,status:`sent`,timestamp:ht(e.id),avatar:(0,J.jsx)(j,{size:`sm`,fallback:`DV`}),children:(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`},children:e.text})},e.id);case`thinking`:return(0,J.jsx)(ie,{text:`Reading the diff…`},e.id);case`thought`:return(0,J.jsxs)(`div`,{"data-slot":`workbench-thought`,style:{padding:`var(--haze-space-1) 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`Thought for `,e.seconds,`s`]},e.id);case`tool`:return(0,J.jsx)(re,{name:`read_diff`,status:e.status,input:(0,J.jsx)(_t,{children:ot}),output:e.status===`done`?(0,J.jsx)(_t,{children:st}):void 0},e.id);case`answer`:return(0,J.jsxs)(U,{role:`assistant`,name:nt,timestamp:ht(e.id),copyable:!0,avatar:(0,J.jsx)(j,{size:`sm`,fallback:`RC`}),children:[e.phase===`streaming`?(0,J.jsx)(Ie,{text:e.text,speed:b.cps,onComplete:()=>M(e.id)}):(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`},children:e.text}),e.phase===`done`&&o===`retry-loop`&&(0,J.jsx)(ke,{compact:!0,items:ut,label:`Citations for this review`,style:{marginTop:`var(--haze-space-2)`}})]},e.id)}},P=e.find(e=>e.id===o)??e[0];return(0,J.jsx)(`div`,{"data-slot":`ai-workbench-block`,style:{height:`100%`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`},children:(0,J.jsx)(Ce,{style:{height:`100%`},sidebarCollapsed:_,mobileSidebarOpen:v,activityBar:(0,J.jsxs)(be,{"aria-label":`Workbench views`,children:[(0,J.jsx)(V,{icon:(0,J.jsx)($e,{size:20}),label:`Conversations`,active:!0,badge:3}),(0,J.jsx)(V,{icon:(0,J.jsx)(Ze,{size:20}),label:`Open reviews`,badge:5}),(0,J.jsx)(V,{icon:(0,J.jsx)(Ye,{size:20}),label:`Code search`}),(0,J.jsx)(V,{slot:`end`,icon:(0,J.jsx)(je,{size:20}),label:`Settings`})]}),sidebar:(0,J.jsxs)(`div`,{"data-slot":`workbench-conversations`,style:{height:`100%`,display:`flex`,flexDirection:`column`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-3) var(--haze-space-3) var(--haze-space-2)`},children:[(0,J.jsx)(`span`,{style:{flex:1,fontSize:`var(--haze-text-xs)`,fontWeight:`var(--haze-weight-semibold)`,letterSpacing:`0.04em`,textTransform:`uppercase`,color:`var(--haze-color-text-muted)`},children:`Conversations`}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:A,children:`New`})]}),(0,J.jsx)(`div`,{style:{flex:1,minHeight:0,overflowY:`auto`,padding:`0 var(--haze-space-2)`},children:(0,J.jsx)(Le,{children:e.map(e=>(0,J.jsx)(ze,{title:e.title,subtitle:e.subtitle,active:e.id===o,onClick:()=>s(e.id),end:(0,J.jsx)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:e.time})},e.id))})})]}),auxiliaryBar:(0,J.jsxs)(`div`,{"data-slot":`workbench-sources`,style:{height:`100%`,display:`flex`,flexDirection:`column`,background:`var(--haze-color-bg)`},children:[(0,J.jsx)(`div`,{style:{padding:`var(--haze-space-3)`,borderBottom:`1px solid var(--haze-color-border)`,fontSize:`var(--haze-text-xs)`,fontWeight:`var(--haze-weight-semibold)`,letterSpacing:`0.04em`,textTransform:`uppercase`,color:`var(--haze-color-text-muted)`},children:`Citations`}),(0,J.jsxs)(`div`,{style:{flex:1,minHeight:0,overflowY:`auto`,padding:`var(--haze-space-3)`},children:[(0,J.jsx)(ke,{items:ut,label:`Sources cited by the copilot`}),(0,J.jsx)(`p`,{style:{margin:`var(--haze-space-3) 0 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:`Drag the panel edge to resize; the handle collapses it entirely.`})]})]}),statusBar:(0,J.jsx)(we,{left:(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(z,{priority:!0,children:b.label}),(0,J.jsxs)(z,{children:[`ctx `,b.contextLength]}),(0,J.jsx)(z,{children:`grounding: repo + docs`})]}),right:(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(z,{children:`main · clean`}),(0,J.jsx)(z,{priority:!0,children:`5 reviews open`})]})}),tabBar:(0,J.jsxs)(Ae,{"aria-label":`Workbench navigation`,children:[(0,J.jsx)(De,{icon:(0,J.jsx)($e,{size:18}),label:`Chats`,badge:3,active:v,onSelect:()=>y(e=>!e)}),(0,J.jsx)(De,{icon:(0,J.jsx)(Ze,{size:18}),label:`Reviews`,badge:5,onSelect:()=>y(!0)})]}),children:(0,J.jsxs)(`div`,{"data-slot":`workbench-chat`,style:{height:`100%`,minWidth:0,display:`flex`,flexDirection:`column`,background:`var(--haze-color-bg-subtle)`},children:[(0,J.jsxs)(`header`,{"data-slot":`workbench-chat-header`,style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-2) var(--haze-space-3)`,borderBottom:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg)`},children:[(0,J.jsx)(G,{size:`sm`,variant:`ghost`,square:!0,"aria-label":h?`Show conversations`:`Hide conversations`,onClick:()=>g(e=>!e),children:(0,J.jsx)(Te,{size:16,"aria-hidden":`true`})}),(0,J.jsxs)(`div`,{style:{minWidth:0},children:[(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`,fontWeight:`var(--haze-weight-semibold)`,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:P.title}),(0,J.jsxs)(`div`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[P.subtitle,` · scripted demo, no network`]})]}),(0,J.jsx)(`span`,{style:{flex:1}}),O?(0,J.jsx)(f,{color:`info`,children:`Generating…`}):(0,J.jsx)(f,{color:`success`,children:`ready`})]}),(0,J.jsx)(ne,{role:`log`,"aria-label":`Review conversation transcript`,style:{flex:1,minHeight:0},children:(n[o]??[]).length===0?(0,J.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:`240px`},children:(0,J.jsx)(N,{description:`Ask about a pull request, a test or a runbook — replies are scripted, nothing leaves the page.`})}):(n[o]??[]).map(te)}),(0,J.jsxs)(`footer`,{"data-slot":`workbench-composer`,style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-3)`,borderTop:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg)`},children:[(0,J.jsx)(`div`,{style:{width:`180px`,flexShrink:0},children:(0,J.jsx)(Re,{value:l,options:Y.map(({value:e,label:t,contextLength:n})=>({value:e,label:t,contextLength:n}))})}),(0,J.jsx)(`div`,{style:{flex:1,minWidth:0},children:(0,J.jsx)(ve,{value:d,tags:m,onTagsChange:p,triggers:[`@`],getSuggestions:gt,onSubmit:()=>k(u),placeholder:O?`Copilot is responding…`:`Ask, or @ a reviewer…`,disabled:O,maxRows:4})}),O&&(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:ee,children:`Stop`})]})]})})})}var Z=`Nimbus Copilot`,yt=`Ana`,bt=`Why did event volume drop for Ferrite Labs last week?`,xt=`{ "workspace": "ferrite-labs",
  "metric": "ingested_events",
  "range": "14d" }`,St=`wk 41 → 71,980 events
wk 42 → 44,610 events (−38%)
source: webhook/v2, 3 collectors`,Ct=`Ferrite Labs lost 38% of ingested events in week 42 — all of it from the webhook source, while the SDK collectors stayed flat. The cliff starts Tuesday 09:40, which lines up with their v2.3 webhook rollout. The failing payload now sends a 1.2 MB body and gets rejected by the gateway before ingest. Retrying with the v2 batched format should recover it — want me to draft the migration note?`,wt=`Scanned the last 24 hours across this workspace: ingest is flat everywhere else, so the Ferrite Labs cliff is still the only outlier. I can pin an annotation to the chart and alert you when the webhook error rate clears — say the word.`,Tt=[{id:`anomaly`,title:`Ferrite Labs volume drop`,subtitle:`Investigating the week-42 cliff`,time:`09:41`},{id:`retention`,title:`Weekly retention digest`,subtitle:`Summarized last week`,time:`Yesterday`},{id:`ingest`,title:`Ingest backfill window`,subtitle:`Resolved`,time:`Mon`}],Et={anomaly:[{id:1,kind:`user`,text:bt}],retention:[{id:2,kind:`user`,text:`Give me the one-line retention story for last week.`},{id:3,kind:`answer`,text:`Rolling 7-day retention held at 41% — up 1.2 points. Power users drove the lift; trial workspaces were flat.`,phase:`done`}],ingest:[{id:4,kind:`user`,text:`Is the October backfill window still open?`},{id:5,kind:`answer`,text:`It closed Sunday 23:59 UTC. The next window opens Nov 3 — queued replays carry over automatically.`,phase:`done`}]},Dt={thinkMs:1300,tool:{thoughtSeconds:4,runMs:1700},answer:Ct},Ot={thinkMs:900,answer:wt};function kt(e){return`09:${String(40+e%20).padStart(2,`0`)}`}var At=e=>new Promise(t=>{setTimeout(t,e)});function jt({children:e}){return(0,J.jsx)(`code`,{style:{fontFamily:`var(--haze-font-mono)`,fontSize:`var(--haze-text-xs)`,whiteSpace:`pre`,color:`var(--haze-color-text-secondary)`},children:e})}function Mt(){let[e,t]=(0,q.useState)(Tt),[n,r]=(0,q.useState)(Et),[i,a]=(0,q.useState)({}),[o,s]=W(void 0,`anomaly`),c=(0,q.useRef)(0),l=(0,q.useRef)(100),u=()=>l.current+=1;(0,q.useEffect)(()=>()=>{c.current+=1},[]);let d=(0,q.useCallback)((e,t)=>{r(n=>({...n,[e]:[...n[e]??[],t]}))},[]),p=(0,q.useCallback)((e,t,n)=>{r(r=>({...r,[e]:(r[e]??[]).map(e=>e.id===t?n(e):e)}))},[]),m=(0,q.useCallback)((e,t)=>{a(n=>({...n,[e]:t}))},[]),h=(0,q.useCallback)(async(e,t)=>{let n=c.current+=1,r=()=>n===c.current;m(e,`thinking`);let i=u();if(d(e,{id:i,kind:`thinking`}),await At(t.thinkMs),!r())return;let a=t.tool?t.tool.thoughtSeconds:Math.max(1,Math.round(t.thinkMs/1e3));if(p(e,i,()=>({id:i,kind:`thought`,seconds:a})),t.tool){m(e,`tool`);let n=u();if(d(e,{id:n,kind:`tool`,status:`running`}),await At(t.tool.runMs),!r())return;p(e,n,()=>({id:n,kind:`tool`,status:`done`}))}m(e,`answering`),d(e,{id:u(),kind:`answer`,text:t.answer,phase:`streaming`})},[d,p,m]);(0,q.useEffect)(()=>{let e=setTimeout(()=>{h(`anomaly`,Dt)},0);return()=>clearTimeout(e)},[h]);let g=i[o]??`idle`,_=e=>{d(o,{id:u(),kind:`user`,text:e}),h(o,Ot)},v=()=>{c.current+=1,m(o,`idle`),r(e=>{let t=[...e[o]??[]];for(;t.length>0;){let e=t[t.length-1];if(!(e.kind===`thinking`||e.kind===`tool`&&e.status===`running`||e.kind===`answer`&&e.phase===`streaming`))break;t.pop()}return{...e,[o]:t}})},y=()=>{let n=`fresh-${e.length+1}`;t(e=>[{id:n,title:`New conversation`,subtitle:`Just started`,time:`now`},...e]),s(n)},b=e=>{p(o,e,e=>e.kind===`answer`?{...e,phase:`done`}:e),m(o,`idle`)};return(0,J.jsxs)(`div`,{"data-slot":`chat-block`,style:{display:`flex`,height:`100%`,minHeight:`480px`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`},children:[(0,J.jsxs)(`section`,{"aria-label":`Chat with ${Z}`,style:{flex:1,minWidth:0,display:`flex`,flexDirection:`column`},children:[(0,J.jsxs)(`header`,{"data-slot":`chat-header`,style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-3)`,padding:`var(--haze-space-3) var(--haze-space-4)`,borderBottom:`1px solid var(--haze-color-border)`},children:[(0,J.jsx)(j,{fallback:`NC`}),(0,J.jsxs)(`div`,{style:{minWidth:0},children:[(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`,fontWeight:`var(--haze-weight-semibold)`},children:Z}),(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:`Workspace analytics agent · scripted demo`})]}),(0,J.jsx)(`span`,{style:{flex:1}}),g===`idle`?(0,J.jsx)(f,{children:`Ready`}):(0,J.jsx)(f,{color:`info`,children:`Generating…`})]}),(0,J.jsx)(ne,{role:`log`,"aria-label":`Conversation transcript`,style:{flex:1,minHeight:0,background:`var(--haze-color-bg-subtle)`},children:(n[o]??[]).length===0?(0,J.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`,minHeight:`240px`},children:(0,J.jsx)(N,{description:`Ask about workspaces, events or alerts — every reply here is scripted, no network involved.`})}):(n[o]??[]).map(e=>{switch(e.kind){case`user`:return(0,J.jsx)(U,{role:`user`,name:yt,status:`sent`,timestamp:kt(e.id),avatar:(0,J.jsx)(j,{size:`sm`,fallback:`AN`}),children:(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`},children:e.text})},e.id);case`thinking`:return(0,J.jsx)(ie,{text:`Pulling workspace metrics…`},e.id);case`thought`:return(0,J.jsxs)(`div`,{"data-slot":`chat-thought`,style:{padding:`var(--haze-space-1) 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`Thought for `,e.seconds,`s`]},e.id);case`tool`:return(0,J.jsx)(re,{name:`query_events`,status:e.status,input:(0,J.jsx)(jt,{children:xt}),output:e.status===`done`?(0,J.jsx)(jt,{children:St}):void 0},e.id);case`answer`:return(0,J.jsx)(U,{role:`assistant`,name:Z,timestamp:kt(e.id),copyable:!0,avatar:(0,J.jsx)(j,{size:`sm`,fallback:`NC`}),children:e.phase===`streaming`?(0,J.jsx)(Ie,{text:e.text,speed:12,onComplete:()=>b(e.id)}):(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`},children:e.text})},e.id)}})}),(0,J.jsx)(`footer`,{"data-slot":`chat-composer`,style:{borderTop:`1px solid var(--haze-color-border)`,padding:`var(--haze-space-3)`,background:`var(--haze-color-bg)`},children:(0,J.jsx)(P,{onSend:_,generating:g!==`idle`,onStop:v,placeholder:g===`idle`?`Ask a follow-up…`:`Assistant is responding…`})})]}),(0,J.jsxs)(`aside`,{"data-slot":`chat-conversations`,"aria-label":`Conversations`,style:{width:`264px`,flexShrink:0,display:`flex`,flexDirection:`column`,borderInlineStart:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-3) var(--haze-space-3) var(--haze-space-2)`},children:[(0,J.jsx)(`span`,{style:{flex:1,fontSize:`var(--haze-text-xs)`,fontWeight:`var(--haze-weight-semibold)`,letterSpacing:`0.04em`,textTransform:`uppercase`,color:`var(--haze-color-text-muted)`},children:`Conversations`}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:y,children:`New chat`})]}),(0,J.jsx)(`div`,{style:{flex:1,minHeight:0,overflowY:`auto`,padding:`0 var(--haze-space-2)`},children:(0,J.jsx)(Le,{children:e.map(e=>(0,J.jsx)(ze,{title:e.title,subtitle:e.subtitle,active:e.id===o,onClick:()=>s(e.id),end:(0,J.jsx)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:e.time})},e.id))})})]})]})}var Q=[{key:`all`,title:`All teams`,children:[{key:`eng`,title:`Engineering`,children:[{key:`eng-fe`,title:`Frontend`},{key:`eng-plat`,title:`Platform`},{key:`eng-data`,title:`Data`}]},{key:`growth`,title:`Growth`,children:[{key:`growth-lifecycle`,title:`Lifecycle`},{key:`growth-ads`,title:`Ads`}]},{key:`ops`,title:`Operations`,children:[{key:`ops-alerts`,title:`Alerting`},{key:`ops-freight`,title:`Freight`}]}]}];function Nt(e,t){for(let n of e)n.children&&n.children.length>0?Nt(n.children,t):t.push(n.key);return t}var Pt={all:Nt(Q,[])};function Ft(e){for(let t of e)Pt[t.key]=t.children&&t.children.length>0?Nt(t.children,[]):[t.key],t.children&&Ft(t.children)}Ft(Q);var It=[{id:`p-01`,name:`Checkout event tap`,team:`eng-fe`,owner:`ada@nimbus.dev`,schedule:`15m`,status:`healthy`},{id:`p-02`,name:`Funnel pageviews`,team:`eng-fe`,owner:`grace@nimbus.dev`,schedule:`hourly`,status:`healthy`},{id:`p-03`,name:`Gateway request log`,team:`eng-plat`,owner:`kwame@nimbus.dev`,schedule:`15m`,status:`degraded`},{id:`p-04`,name:`Deploy markers`,team:`eng-plat`,owner:`rina@nimbus.dev`,schedule:`hourly`,status:`healthy`},{id:`p-05`,name:`Warehouse sync`,team:`eng-data`,owner:`tomas@nimbus.dev`,schedule:`daily`,status:`healthy`},{id:`p-06`,name:`Backfill queue`,team:`eng-data`,owner:`tomas@nimbus.dev`,schedule:`hourly`,status:`paused`},{id:`p-07`,name:`Trial activation`,team:`growth-lifecycle`,owner:`yuki@nimbus.dev`,schedule:`daily`,status:`healthy`},{id:`p-08`,name:`Attribution joins`,team:`growth-ads`,owner:`omar@nimbus.dev`,schedule:`hourly`,status:`degraded`},{id:`p-09`,name:`Anomaly detector`,team:`ops-alerts`,owner:`rina@nimbus.dev`,schedule:`15m`,status:`healthy`},{id:`p-10`,name:`Shipment tracker`,team:`ops-freight`,owner:`leo@nimbus.dev`,schedule:`hourly`,status:`healthy`}],Lt=le({name:se().min(2,`Name must be at least 2 characters`),owner:de(`Enter a valid email address`),schedule:fe([`15m`,`hourly`,`daily`],{message:`Pick a schedule`})}),Rt=xe(Lt);function zt(e){return(0,J.jsx)(f,{color:e===`healthy`?`success`:e===`degraded`?`warning`:`default`,children:e})}function Bt(e){return(0,J.jsx)(f,{color:e===`15m`?`info`:`default`,children:e})}function Vt({pipeline:e,onCancel:t,onSubmit:n}){let r=ce({initialValues:e?{name:e.name,owner:e.owner,schedule:e.schedule}:{name:``,owner:``,schedule:``},validate:Rt,validateDeps:[`name`,`owner`,`schedule`]});return(0,J.jsx)(pe,{form:r,onValidSubmit:n,children:(0,J.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`var(--haze-space-4)`},children:[(0,J.jsx)(I,{form:r,name:`name`,label:`Pipeline name`,rules:{required:!0},input:i,placeholder:`Checkout event tap`}),(0,J.jsx)(I,{form:r,name:`owner`,label:`Owner email`,rules:{required:!0},input:i,type:`email`,placeholder:`owner@nimbus.dev`}),(0,J.jsxs)(I,{form:r,name:`schedule`,label:`Schedule`,rules:{required:!0},input:o,children:[(0,J.jsx)(s,{value:``,children:`Pick a schedule…`}),(0,J.jsx)(s,{value:`15m`,children:`Every 15 minutes`}),(0,J.jsx)(s,{value:`hourly`,children:`Hourly`}),(0,J.jsx)(s,{value:`daily`,children:`Daily`})]}),(0,J.jsxs)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`var(--haze-space-2)`},children:[(0,J.jsx)(G,{onClick:e=>e.currentTarget.form?.requestSubmit(),children:`Save pipeline`}),(0,J.jsx)(G,{variant:`ghost`,onClick:t,children:`Cancel`})]})]})})}function Ht(){let e=te(),[t,n,r]=W(void 0,[`all`]),[i,a,o]=W(void 0,`md`),[,s,c]=W(void 0,!1),[,l,u]=W(void 0,!1),[,,d]=W(void 0,[`all`]),[m,h]=(0,q.useState)(It),[g,_]=(0,q.useState)(null),[v,b]=(0,q.useState)(0),[x,S]=(0,q.useState)(null),C=(0,q.useRef)(It.length+1),w=(0,q.useMemo)(()=>Pt[t[0]??`all`]??[],[t]),T=(0,q.useMemo)(()=>m.filter(e=>w.includes(e.team)),[m,w]),E=(0,q.useCallback)(()=>{_(null),b(e=>e+1),s(!0)},[s]),D=(0,q.useCallback)(e=>{_(e),b(e=>e+1),s(!0)},[s]),O=(0,q.useCallback)(()=>s(!1),[s]),k=t=>{if(g)h(e=>e.map(e=>e.id===g.id?{...e,...t,schedule:t.schedule}:e)),e(`Updated ${t.name}`,{variant:`success`});else{let n=`p-${String(C.current).padStart(2,`0`)}`;C.current+=1,h(e=>[...e,{id:n,team:w[0]??`eng-fe`,owner:t.owner,name:t.name,schedule:t.schedule,status:`healthy`}]),e(`Created ${t.name}`,{variant:`success`})}O()},A=(0,q.useCallback)(e=>{S(e),l(!0)},[l]),j=(0,q.useCallback)(()=>{l(!1),S(null)},[l]),M=()=>{x&&(h(e=>e.filter(e=>e.id!==x.id)),e(`Deleted ${x.name}`,{variant:`success`}),S(null))},N=(0,q.useMemo)(()=>[{accessorKey:`name`,header:`Pipeline`,cell:e=>(0,J.jsx)(`strong`,{children:e.getValue()})},{accessorKey:`owner`,header:`Owner`},{accessorKey:`schedule`,header:`Schedule`,cell:e=>Bt(e.getValue())},{accessorKey:`status`,header:`Status`,cell:e=>zt(e.getValue())},{id:`actions`,header:``,cell:({row:e})=>(0,J.jsxs)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`var(--haze-space-1)`},children:[(0,J.jsx)(G,{size:`sm`,variant:`ghost`,onClick:()=>D(e.original),children:`Edit`}),(0,J.jsx)(G,{size:`sm`,variant:`ghost`,onClick:()=>A(e.original),children:`Delete`})]}),meta:{sortable:!1}}],[D,A]);return(0,J.jsxs)(`div`,{"data-slot":`crud-block`,style:{display:`flex`,height:`100%`,minHeight:`480px`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`},children:[(0,J.jsxs)(`aside`,{"data-slot":`crud-tree`,"aria-label":`Pipelines by team`,style:{width:`232px`,flexShrink:0,display:`flex`,flexDirection:`column`,padding:`var(--haze-space-3)`,borderInlineEnd:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg-subtle)`},children:[(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-xs)`,fontWeight:`var(--haze-weight-semibold)`,letterSpacing:`0.04em`,textTransform:`uppercase`,color:`var(--haze-color-text-muted)`,margin:`0 0 var(--haze-space-2) var(--haze-space-2)`},children:`Teams`}),(0,J.jsx)(ee,{treeData:Q,selectedKeys:r,expandedKeys:d,onSelect:e=>n(e.length>0?[e[e.length-1]]:[]),blockNode:!0})]}),(0,J.jsxs)(`main`,{"data-slot":`crud-detail`,style:{flex:1,minWidth:0,display:`flex`,flexDirection:`column`,gap:`var(--haze-space-3)`,padding:`var(--haze-space-4)`},children:[(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-3)`},children:[(0,J.jsx)(`h2`,{style:{margin:0,fontSize:`var(--haze-text-lg)`,fontWeight:`var(--haze-weight-semibold)`},children:`Event pipelines`}),(0,J.jsx)(f,{color:`info`,children:T.length}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`var(--haze-space-1)`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`Keyboard: `,(0,J.jsx)(L,{size:`sm`,children:`Tab`}),` reaches a cell,`,(0,J.jsx)(L,{size:`sm`,children:`←`}),(0,J.jsx)(L,{size:`sm`,children:`↑`}),(0,J.jsx)(L,{size:`sm`,children:`↓`}),(0,J.jsx)(L,{size:`sm`,children:`→`}),` roam,`,(0,J.jsx)(L,{size:`sm`,children:`Enter`}),` sorts a header`]})]}),(0,J.jsx)(F,{columns:N,data:T,getRowId:e=>e.id,sortable:!0,size:i,toolbar:(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,flexWrap:`wrap`},children:[(0,J.jsx)(G,{size:`sm`,onClick:E,children:`New pipeline`}),(0,J.jsx)(R,{size:`sm`,options:[{value:`sm`,label:`S`},{value:`md`,label:`M`},{value:`lg`,label:`L`}],value:o,onChange:a,"aria-label":`Table density`})]})})]}),(0,J.jsx)(p,{open:c,onClose:O,title:g?`Edit pipeline`:`New pipeline`,children:(0,J.jsx)(Vt,{pipeline:g,onCancel:O,onSubmit:k},v)}),(0,J.jsxs)(y,{open:u,title:`Delete pipeline`,confirmText:`Delete`,variant:`danger`,onConfirm:M,onCancel:j,onClose:j,children:[`Delete `,x?.name,`? Its collectors stop ingesting immediately — there is no undo.`]})]})}function Ut(){return(0,J.jsx)(M,{children:(0,J.jsx)(Ht,{})})}var Wt=[{id:`w-101`,name:`Acme Robotics`,plan:`enterprise`,seats:42,events:184230,mrr:1890,status:`healthy`},{id:`w-102`,name:`Lumen Studio`,plan:`pro`,seats:12,events:96410,mrr:480,status:`healthy`},{id:`w-103`,name:`Ferrite Labs`,plan:`pro`,seats:9,events:71980,mrr:360,status:`at risk`},{id:`w-104`,name:`Harbor & Co`,plan:`free`,seats:3,events:12004,mrr:0,status:`trial`},{id:`w-105`,name:`Northwind Freight`,plan:`enterprise`,seats:65,events:268750,mrr:2925,status:`healthy`},{id:`w-106`,name:`Quanta Health`,plan:`pro`,seats:18,events:122866,mrr:720,status:`healthy`},{id:`w-107`,name:`Bright Meadow`,plan:`free`,seats:2,events:8312,mrr:0,status:`trial`},{id:`w-108`,name:`Kestrel Analytics`,plan:`pro`,seats:14,events:101540,mrr:560,status:`at risk`},{id:`w-109`,name:`Orbit Logistics`,plan:`enterprise`,seats:51,events:210390,mrr:2295,status:`healthy`},{id:`w-110`,name:`Pinewood Press`,plan:`free`,seats:5,events:19748,mrr:0,status:`trial`},{id:`w-111`,name:`Solstice Energy`,plan:`pro`,seats:21,events:143605,mrr:840,status:`healthy`},{id:`w-112`,name:`Umbra Games`,plan:`pro`,seats:11,events:88120,mrr:440,status:`at risk`}],Gt=e=>(0,J.jsx)(f,{color:e===`enterprise`?`success`:e===`pro`?`info`:`default`,children:e}),Kt=e=>(0,J.jsx)(f,{color:e===`healthy`?`success`:e===`trial`?`default`:`warning`,children:e}),qt=[{accessorKey:`name`,header:`Workspace`},{accessorKey:`plan`,header:`Plan`,cell:e=>Gt(e.getValue())},{accessorKey:`seats`,header:`Seats`},{accessorKey:`events`,header:`Events / mo`,cell:e=>e.getValue().toLocaleString(`en-US`)},{accessorKey:`mrr`,header:`MRR`,cell:e=>`$${e.getValue().toLocaleString(`en-US`)}`},{accessorKey:`status`,header:`Status`,cell:e=>Kt(e.getValue())}];function Jt(){let e=ye(Wt,qt),t=URL.createObjectURL(new Blob([e],{type:`text/csv;charset=utf-8`})),n=document.createElement(`a`);n.href=t,n.download=`nimbus-workspaces.csv`,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(t)}function Yt(){return(0,J.jsxs)(Me,{children:[(0,J.jsxs)(Ee,{title:`Workspace`,children:[(0,J.jsx)(B,{active:!0,children:`Overview`}),(0,J.jsx)(B,{children:`Events`}),(0,J.jsx)(B,{children:`Funnels`}),(0,J.jsx)(B,{children:`Alerts`})]}),(0,J.jsxs)(Ee,{title:`Account`,children:[(0,J.jsx)(B,{children:`Billing`}),(0,J.jsx)(B,{children:`Members`}),(0,J.jsx)(B,{children:`Settings`})]})]})}function Xt(){let[e,t,n]=W(void 0,`md`);return(0,J.jsx)(`div`,{"data-slot":`dashboard-block`,style:{height:`100%`,display:`flex`,flexDirection:`column`},children:(0,J.jsx)(Pe,{header:(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-3)`,padding:`0 var(--haze-space-3)`},children:[(0,J.jsx)(`strong`,{style:{color:`var(--haze-color-primary)`},children:`Nimbus Console`}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsxs)(l,{size:`sm`,defaultValue:`acme`,"aria-label":`Workspace`,children:[(0,J.jsx)(s,{value:`acme`,children:`acme-robotics`}),(0,J.jsx)(s,{value:`lumen`,children:`lumen-studio`}),(0,J.jsx)(s,{value:`ferrite`,children:`ferrite-labs`})]}),(0,J.jsx)(f,{color:`info`,children:`ND`})]}),sidebar:(0,J.jsx)(Yt,{}),children:(0,J.jsxs)(`div`,{"data-slot":`dashboard-content`,style:{display:`flex`,flexDirection:`column`,gap:`var(--haze-space-4)`,padding:`var(--haze-space-4)`},children:[(0,J.jsxs)(E,{children:[(0,J.jsx)(D,{href:`#dashboard`,children:`Nimbus`}),(0,J.jsx)(D,{href:`#dashboard`,children:`Analytics`}),(0,J.jsx)(D,{children:`Overview`})]}),(0,J.jsxs)(k,{"data-slot":`dashboard-stats`,children:[(0,J.jsx)(O,{title:`MRR`,value:`$12,610`,trend:`up`,trendValue:`+12.4%`,description:`vs last month`}),(0,J.jsx)(O,{title:`Active workspaces`,value:`1,284`,trend:`up`,trendValue:`+38`,description:`rolling 30 days`}),(0,J.jsx)(O,{title:`Avg. session`,value:`7m 32s`,trend:`down`,trendValue:`-3.1%`,description:`all plans`}),(0,J.jsx)(O,{title:`Churn`,value:`2.1%`,trend:`neutral`,description:`target under 3%`})]}),(0,J.jsx)(F,{columns:qt,data:Wt,getRowId:e=>e.id,size:e,pageSize:6,columnToggle:!0,toolbar:(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`},children:[(0,J.jsx)(R,{size:`sm`,options:[{value:`sm`,label:`S`},{value:`md`,label:`M`},{value:`lg`,label:`L`}],value:n,onChange:t,"aria-label":`Table density`}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:Jt,children:`Export CSV`})]})})]})})})}var Zt=[{id:`i-0a11`,name:`gateway-edge-1`,region:`us-east-1`,status:`healthy`,vcpus:8,memoryGb:32,cost:214,uptime:99.98,owner:`Ana Petrova`},{id:`i-0a12`,name:`gateway-edge-2`,region:`us-west-2`,status:`healthy`,vcpus:8,memoryGb:32,cost:218,uptime:99.91,owner:`Ana Petrova`},{id:`i-0b21`,name:`ingest-primary`,region:`us-east-1`,status:`degraded`,vcpus:16,memoryGb:64,cost:486,uptime:97.42,owner:`Ben Okafor`},{id:`i-0b22`,name:`ingest-replica`,region:`us-east-1`,status:`healthy`,vcpus:16,memoryGb:64,cost:486,uptime:99.95,owner:`Ben Okafor`},{id:`i-0c31`,name:`vector-index-a`,region:`eu-central-1`,status:`healthy`,vcpus:32,memoryGb:128,cost:1042,uptime:99.99,owner:`Chen Wei`},{id:`i-0c32`,name:`vector-index-b`,region:`eu-central-1`,status:`rebooting`,vcpus:32,memoryGb:128,cost:1042,uptime:98.7,owner:`Chen Wei`},{id:`i-0d41`,name:`cache-redis-1`,region:`us-west-2`,status:`healthy`,vcpus:4,memoryGb:16,cost:96,uptime:99.99,owner:`Dana Silva`},{id:`i-0d42`,name:`cache-redis-2`,region:`ap-southeast-1`,status:`healthy`,vcpus:4,memoryGb:16,cost:102,uptime:99.87,owner:`Dana Silva`},{id:`i-0e51`,name:`worker-batch-1`,region:`us-east-1`,status:`healthy`,vcpus:8,memoryGb:32,cost:178,uptime:99.62,owner:`Ben Okafor`},{id:`i-0e52`,name:`worker-batch-2`,region:`us-east-1`,status:`stopped`,vcpus:8,memoryGb:32,cost:0,uptime:91.15,owner:`Ben Okafor`},{id:`i-0f61`,name:`worker-batch-3`,region:`eu-central-1`,status:`healthy`,vcpus:8,memoryGb:32,cost:181,uptime:99.44,owner:`Chen Wei`},{id:`i-0f71`,name:`search-api-1`,region:`ap-southeast-1`,status:`healthy`,vcpus:12,memoryGb:48,cost:305,uptime:99.93,owner:`Dana Silva`},{id:`i-0f72`,name:`search-api-2`,region:`ap-southeast-1`,status:`degraded`,vcpus:12,memoryGb:48,cost:305,uptime:96.08,owner:`Dana Silva`},{id:`i-0g81`,name:`ci-runner-x1`,region:`us-west-2`,status:`healthy`,vcpus:64,memoryGb:256,cost:1688,uptime:99.71,owner:`Ana Petrova`},{id:`i-0g82`,name:`ci-runner-x2`,region:`us-west-2`,status:`rebooting`,vcpus:64,memoryGb:256,cost:1688,uptime:98.31,owner:`Ana Petrova`},{id:`i-0h91`,name:`metrics-store`,region:`eu-central-1`,status:`healthy`,vcpus:24,memoryGb:96,cost:742,uptime:99.96,owner:`Chen Wei`},{id:`i-0h92`,name:`metrics-rollup`,region:`us-east-1`,status:`healthy`,vcpus:6,memoryGb:24,cost:133,uptime:99.88,owner:`Chen Wei`},{id:`i-0i01`,name:`staging-db`,region:`us-east-1`,status:`stopped`,vcpus:16,memoryGb:64,cost:0,uptime:88.04,owner:`Dana Silva`}],Qt=[`us-east-1`,`us-west-2`,`eu-central-1`,`ap-southeast-1`],$t=[`healthy`,`degraded`,`rebooting`,`stopped`],en=e=>e.split(` `).map(e=>e.charAt(0)).join(``).slice(0,2),tn=e=>(0,J.jsx)(f,{color:e===`healthy`?`success`:e===`degraded`?`warning`:e===`rebooting`?`info`:`default`,children:e}),nn=e=>(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,minWidth:`120px`},children:[(0,J.jsx)(ae,{value:e,size:`sm`}),(0,J.jsxs)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-secondary)`},children:[e.toFixed(2),`%`]})]}),rn=[{accessorKey:`name`,header:`Instance`,cell:e=>(0,J.jsx)(`strong`,{children:e.getValue()}),meta:{width:160}},{accessorKey:`region`,header:`Region`},{accessorKey:`status`,header:`Status`,cell:e=>tn(e.getValue()),meta:{width:120}},{accessorKey:`vcpus`,header:`vCPU`,meta:{width:80}},{accessorKey:`memoryGb`,header:`Memory (GB)`,meta:{width:120}},{accessorKey:`cost`,header:`Cost / mo`,cell:e=>`$${e.getValue().toLocaleString(`en-US`)}`,meta:{width:100}},{accessorKey:`uptime`,header:`Uptime (30d)`,cell:e=>nn(e.getValue()),meta:{width:180}},{accessorKey:`owner`,header:`Owner`,cell:e=>(0,J.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`var(--haze-space-2)`},children:[(0,J.jsx)(j,{size:`sm`,fallback:en(e.getValue())}),(0,J.jsx)(`span`,{children:e.getValue()})]}),meta:{excludeFromExport:!0,width:160}}];function an(e,t){let n=ye(e,rn),r=URL.createObjectURL(new Blob([n],{type:`text/csv;charset=utf-8`})),i=document.createElement(`a`);i.href=r,i.download=t,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(r)}var on={display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,flexWrap:`wrap`};function sn(){let[e,t,n]=W(void 0,`all`),[r,i,a]=W(void 0,`all`),[o,c,u]=W(void 0,`md`),[d,p]=W(void 0,{}),m=(0,q.useMemo)(()=>Zt.filter(t=>(e===`all`||t.region===e)&&(r===`all`||t.status===r)),[e,r]),h=Object.values(d).filter(Boolean).length,g=(0,q.useMemo)(()=>m.filter(e=>d[e.id]===!0),[m,d]);return(0,J.jsxs)(`div`,{"data-slot":`data-table-block`,style:{height:`100%`,display:`flex`,flexDirection:`column`,gap:`var(--haze-space-3)`,padding:`var(--haze-space-4)`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`header`,{"data-slot":`data-table-header`,style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-3)`,flexWrap:`wrap`},children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`h2`,{style:{margin:0,fontSize:`var(--haze-text-lg)`,fontWeight:`var(--haze-weight-semibold)`},children:`Compute fleet`}),(0,J.jsxs)(`p`,{style:{margin:0,fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text-secondary)`},children:[m.length,` of `,Zt.length,` instances · sort, filter, resize, select and export`]})]}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsxs)(`div`,{style:on,children:[(0,J.jsxs)(l,{size:`sm`,value:n,onValuesChange:e=>t(typeof e==`string`?e:`all`),"aria-label":`Filter by region`,children:[(0,J.jsx)(s,{value:`all`,children:`All regions`}),Qt.map(e=>(0,J.jsx)(s,{value:e,children:e},e))]}),(0,J.jsxs)(l,{size:`sm`,value:a,onValuesChange:e=>i(typeof e==`string`?e:`all`),"aria-label":`Filter by status`,children:[(0,J.jsx)(s,{value:`all`,children:`All statuses`}),$t.map(e=>(0,J.jsx)(s,{value:e,children:e},e))]}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:()=>an(m,`nimbus-fleet.csv`),children:`Export CSV`})]})]}),h>0&&(0,J.jsxs)(`div`,{"data-slot":`data-table-bulk-bar`,style:on,children:[(0,J.jsxs)(f,{color:`info`,children:[h,` selected`]}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:()=>an(g,`nimbus-fleet-selection.csv`),children:`Export selection`}),(0,J.jsx)(G,{size:`sm`,variant:`ghost`,onClick:()=>p({}),children:`Clear selection`})]}),(0,J.jsx)(F,{columns:rn,data:m,getRowId:e=>e.id,sortable:!0,selectable:!0,rowSelection:d,filterable:!0,resizable:!0,pageSize:8,columnToggle:!0,size:o,summary:e=>[{label:`Filtered totals`,cells:[`${e.length} instances`,``,``,H(e,`vcpus`),`${H(e,`memoryGb`)} GB`,`$${H(e,`cost`).toLocaleString(`en-US`)}`,`${(Se(e,`uptime`)??0).toFixed(2)}% avg`,``]}],toolbar:(0,J.jsx)(R,{size:`sm`,options:[{value:`sm`,label:`S`},{value:`md`,label:`M`},{value:`lg`,label:`L`}],value:u,onChange:c,"aria-label":`Table density`})})]})}var cn=[{id:`backlog`,name:`Backlog`,hint:`groomed next sprint`,color:`var(--haze-color-text-muted)`},{id:`progress`,name:`In progress`,hint:`WIP limit 4`,color:`var(--haze-color-primary)`},{id:`review`,name:`Review`,hint:`needs a reviewer`,color:`var(--haze-color-warning)`},{id:`done`,name:`Done`,hint:`this sprint`,color:`var(--haze-color-success)`}],ln=[{id:`NB-412`,title:`Idempotency-Key on webhook retries`,column:`progress`,priority:`P0`,labels:[`gateway`,`reliability`],assignees:[`Ana Petrova`,`Ben Okafor`],points:5,progress:60},{id:`NB-415`,title:`Batched payload fallback after 2 failures`,column:`progress`,priority:`P1`,labels:[`gateway`],assignees:[`Ben Okafor`],points:3,progress:25},{id:`NB-401`,title:`Freeze clock fixture in checkout e2e`,column:`review`,priority:`P1`,labels:[`flaky`,`e2e`],assignees:[`Dana Silva`,`Chen Wei`,`Ana Petrova`],points:2,progress:90},{id:`NB-408`,title:`Trim ingest payload snapshot to 1 MB`,column:`review`,priority:`P2`,labels:[`ingest`],assignees:[`Chen Wei`],points:1,progress:100},{id:`NB-419`,title:`Alert on webhook error-rate cliff`,column:`backlog`,priority:`P1`,labels:[`observability`],assignees:[`Dana Silva`],points:3,progress:0},{id:`NB-421`,title:`Runbook: collector rollbacks`,column:`backlog`,priority:`P2`,labels:[`docs`],assignees:[],points:2,progress:0},{id:`NB-422`,title:`Rotate CI secrets quarterly`,column:`backlog`,priority:`P0`,labels:[`security`,`infra`],assignees:[`Ana Petrova`],points:1,progress:0},{id:`NB-418`,title:`Dashboard: 30d uptime column`,column:`backlog`,priority:`P2`,labels:[`console`],assignees:[`Chen Wei`,`Dana Silva`],points:2,progress:0},{id:`NB-396`,title:`v2.3 migration notes`,column:`done`,priority:`P1`,labels:[`docs`],assignees:[`Ben Okafor`],points:2,progress:100},{id:`NB-399`,title:`Backoff cap 2s → 8s`,column:`done`,priority:`P0`,labels:[`gateway`],assignees:[`Ana Petrova`,`Chen Wei`],points:3,progress:100},{id:`NB-403`,title:`Retry jitter across collectors`,column:`done`,priority:`P1`,labels:[`gateway`,`reliability`],assignees:[`Ben Okafor`],points:2,progress:100}],un=[{title:`Spike: QUIC for collector transport`,priority:`P2`,labels:[`spike`],assignees:[],points:1,progress:0},{title:`Reduce cold-start of ingest workers`,priority:`P1`,labels:[`ingest`,`perf`],assignees:[`Chen Wei`],points:3,progress:0},{title:`Audit PII in payload snapshots`,priority:`P0`,labels:[`security`],assignees:[`Dana Silva`,`Ana Petrova`],points:2,progress:0},{title:`Changelog page for v2.4`,priority:`P2`,labels:[`docs`],assignees:[],points:1,progress:0}],dn=e=>e.split(` `).map(e=>e.charAt(0)).join(``).slice(0,2),fn=e=>(0,J.jsx)(f,{color:e===`P0`?`danger`:e===`P1`?`warning`:`default`,children:e});function pn({issue:e,onMove:t,onDelete:n}){return(0,J.jsxs)(g,{children:[(0,J.jsxs)(_,{children:[(0,J.jsxs)(oe,{children:[`Actions for `,e.id]}),(0,J.jsx)(qe,{size:14,"aria-hidden":`true`})]}),(0,J.jsxs)(h,{align:`end`,children:[cn.filter(t=>t.id!==e.column).map(n=>(0,J.jsxs)(b,{onClick:()=>t(e.id,n.id),children:[`Move to `,n.name]},n.id)),(0,J.jsx)(v,{}),(0,J.jsx)(b,{danger:!0,onClick:()=>n(e.id),children:`Delete issue`})]})]})}function mn({issue:e,onMove:t,onDelete:n}){return(0,J.jsxs)(`article`,{"data-slot":`kanban-card`,style:{display:`flex`,flexDirection:`column`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-3)`,border:`1px solid var(--haze-color-border)`,borderRadius:`var(--haze-radius-md)`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`flex-start`,gap:`var(--haze-space-2)`},children:[(0,J.jsxs)(`div`,{style:{flex:1,minWidth:0,fontSize:`var(--haze-text-sm)`,fontWeight:`var(--haze-weight-medium)`,lineHeight:`var(--haze-leading-snug)`},children:[(0,J.jsx)(`span`,{style:{fontFamily:`var(--haze-font-mono)`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`,display:`block`},children:e.id}),e.title]}),(0,J.jsx)(pn,{issue:e,onMove:t,onDelete:n})]}),e.labels.length>0&&(0,J.jsx)(`div`,{style:{display:`flex`,gap:`var(--haze-space-1)`,flexWrap:`wrap`},children:e.labels.map(e=>(0,J.jsx)(c,{variant:`outline`,children:e},e))}),e.progress>0&&(0,J.jsx)(ae,{value:e.progress,size:`sm`,color:`success`}),(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`},children:[e.assignees.length>0?e.assignees.length>1?(0,J.jsx)(Fe,{max:2,total:e.assignees.length,children:e.assignees.map(e=>(0,J.jsx)(m,{content:e,children:(0,J.jsx)(j,{size:`sm`,fallback:dn(e)})},e))}):(0,J.jsx)(j,{size:`sm`,fallback:dn(e.assignees[0])}):(0,J.jsx)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:`unassigned`}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsx)(m,{content:`Story points`,children:(0,J.jsxs)(`span`,{style:{fontFamily:`var(--haze-font-mono)`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-secondary)`},children:[e.points,` pt`]})}),fn(e.priority)]})]})}function hn(){let[e,t]=(0,q.useState)(ln),[n,r]=(0,q.useState)(0),[i,o,c]=W(void 0,`all`),[u,d,p]=W(void 0,``),m=(0,q.useMemo)(()=>e.filter(e=>(i===`all`||e.priority===i)&&(u.trim()===``||`${e.id} ${e.title}`.toLowerCase().includes(u.trim().toLowerCase()))),[e,i,u]),h=e=>m.filter(t=>t.column===e),g=(e,n)=>{t(t=>t.map(t=>t.id===e?{...t,column:n}:t))},_=e=>{t(t=>t.filter(t=>t.id!==e))};return(0,J.jsxs)(`div`,{"data-slot":`kanban-block`,style:{height:`100%`,display:`flex`,flexDirection:`column`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`,background:`var(--haze-color-bg-subtle)`},children:[(0,J.jsxs)(`header`,{"data-slot":`kanban-header`,style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,flexWrap:`wrap`,padding:`var(--haze-space-3) var(--haze-space-4)`,borderBottom:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`h2`,{style:{margin:0,fontSize:`var(--haze-text-lg)`,fontWeight:`var(--haze-weight-semibold)`},children:`Nimbus · sprint 42 board`}),(0,J.jsxs)(`p`,{style:{margin:0,fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text-secondary)`},children:[m.length,` issues · move cards from the ⋯ menu`]})]}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsx)(a,{size:`sm`,value:p,onChange:e=>d(e.target.value),placeholder:`Search issues…`,"aria-label":`Search issues`,style:{width:`180px`}}),(0,J.jsxs)(l,{size:`sm`,value:c,onValuesChange:e=>o(typeof e==`string`?e:`all`),"aria-label":`Filter by priority`,children:[(0,J.jsx)(s,{value:`all`,children:`All priorities`}),(0,J.jsx)(s,{value:`P0`,children:`P0`}),(0,J.jsx)(s,{value:`P1`,children:`P1`}),(0,J.jsx)(s,{value:`P2`,children:`P2`})]}),(0,J.jsxs)(G,{size:`sm`,onClick:()=>{let e=un[n%un.length],i=`NB-${430+n}`;r(e=>e+1),t(t=>[{...e,id:i,column:`backlog`},...t])},children:[(0,J.jsx)(tt,{size:14,"aria-hidden":`true`}),`New issue`]})]}),(0,J.jsx)(`div`,{"data-slot":`kanban-columns`,style:{flex:1,minHeight:0,display:`flex`,gap:`var(--haze-space-3)`,padding:`var(--haze-space-3) var(--haze-space-4)`,overflowX:`auto`},children:cn.map(e=>{let t=h(e.id);return(0,J.jsxs)(`section`,{"data-slot":`kanban-column`,"aria-label":`${e.name} — ${t.length} issues`,style:{flex:`1 1 260px`,minWidth:`240px`,display:`flex`,flexDirection:`column`,minHeight:0,border:`1px solid var(--haze-color-border)`,borderRadius:`var(--haze-radius-lg)`,background:`var(--haze-color-bg)`},children:[(0,J.jsxs)(`header`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-2) var(--haze-space-3)`,borderBottom:`1px solid var(--haze-color-border)`},children:[(0,J.jsx)(`span`,{"aria-hidden":`true`,style:{width:`var(--haze-space-2)`,height:`var(--haze-space-2)`,borderRadius:`var(--haze-radius-full)`,background:e.color,flexShrink:0}}),(0,J.jsx)(`strong`,{style:{fontSize:`var(--haze-text-sm)`},children:e.name}),(0,J.jsx)(f,{children:t.length}),(0,J.jsx)(`span`,{style:{flex:1}}),(0,J.jsx)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:e.hint})]}),(0,J.jsx)(`div`,{"data-slot":`kanban-column-cards`,style:{flex:1,minHeight:0,overflowY:`auto`,display:`flex`,flexDirection:`column`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-3)`},children:t.length===0?(0,J.jsx)(N,{description:`Nothing in ${e.name.toLowerCase()}`}):t.map(e=>(0,J.jsx)(mn,{issue:e,onMove:g,onDelete:_},e.id))})]},e.id)})}),(0,J.jsxs)(`footer`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-2)`,padding:`var(--haze-space-2) var(--haze-space-4)`,borderTop:`1px solid var(--haze-color-border)`,background:`var(--haze-color-bg)`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[(0,J.jsx)(Ge,{size:12,"aria-hidden":`true`}),`Static board by design — haze-ui ships single-container sorting (SortableTagGroup / SortableTabList / SortableTree), not cross-column drag.`]})]})}var gn=le({email:de(`Enter a valid email address`),password:se().min(8,`Password must be at least 8 characters`),remember:ue()}),_n=xe(gn);function vn(){let e=ce({initialValues:{email:``,password:``,remember:!0},validate:_n,validateDeps:[`email`,`password`]}),[t,n]=W(void 0,!1);return(0,J.jsx)(pe,{form:e,onValidSubmit:()=>n(!0),children:(0,J.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`var(--haze-space-4)`},children:[t&&(0,J.jsx)(Ve,{color:`success`,children:`Signed in — the schema passed for this workspace.`}),(0,J.jsx)(I,{form:e,name:`email`,label:`Work email`,rules:{required:!0},input:i,type:`email`,placeholder:`you@company.com`}),(0,J.jsx)(I,{form:e,name:`password`,label:`Password`,rules:{required:!0},input:A,placeholder:`At least 8 characters`}),(0,J.jsx)(I,{form:e,name:`remember`,label:`Keep me signed in on this device`,input:u,valueToProps:e=>({checked:!!e})}),(0,J.jsx)(G,{style:{width:`100%`},onClick:e=>{e.currentTarget.form?.requestSubmit()},children:`Sign in`})]})})}function yn(){return(0,J.jsxs)(`div`,{"data-slot":`login-block`,style:{display:`flex`,height:`100%`,minHeight:`420px`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`},children:[(0,J.jsxs)(`div`,{"data-slot":`login-brand`,style:{flex:`1 1 55%`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`,padding:`var(--haze-space-8)`,background:`var(--haze-color-bg-subtle)`,borderInlineEnd:`1px solid var(--haze-color-border)`},children:[(0,J.jsx)(`strong`,{style:{color:`var(--haze-color-primary)`,fontSize:`var(--haze-text-xl)`},children:`Nimbus`}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`h2`,{style:{margin:`0 0 var(--haze-space-2)`,fontSize:`var(--haze-text-2xl)`,lineHeight:`var(--haze-leading-tight)`,color:`var(--haze-color-text)`},children:`Analytics your whole team actually reads.`}),(0,J.jsx)(`p`,{style:{margin:0,fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text-secondary)`},children:`1,284 workspaces ship with Nimbus — from first event to board deck.`})]}),(0,J.jsx)(`span`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:`SOC 2 Type II · GDPR · 99.98% uptime`})]}),(0,J.jsx)(`div`,{"data-slot":`login-panel`,style:{flex:`1 1 45%`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`var(--haze-space-6)`,background:`var(--haze-color-bg)`},children:(0,J.jsx)(`div`,{style:{width:`min(360px, 100%)`},children:(0,J.jsxs)(x,{variant:`outlined`,children:[(0,J.jsx)(`h2`,{style:{margin:`0 0 var(--haze-space-1)`,fontSize:`var(--haze-text-lg)`},children:`Welcome back`}),(0,J.jsx)(`p`,{style:{margin:`0 0 var(--haze-space-4)`,fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text-secondary)`},children:`Sign in to your Nimbus workspace.`}),(0,J.jsx)(vn,{}),(0,J.jsxs)(`p`,{style:{margin:`var(--haze-space-3) 0 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`New to Nimbus? `,(0,J.jsx)(`a`,{href:`#login`,children:`Create a workspace`})]})]})})})]})}function $({title:e,description:t,children:n}){return(0,J.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`var(--haze-space-4)`,padding:`var(--haze-space-3) 0`,borderBottom:`1px solid var(--haze-color-border)`},children:[(0,J.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text)`},children:e}),(0,J.jsx)(`div`,{style:{fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:t})]}),n]})}function bn(){let[e,,t]=W(void 0,!0),[,,n]=W(void 0,!0),[,,r]=W(void 0,!1);return(0,J.jsxs)(`div`,{"data-slot":`settings-notifications`,children:[(0,J.jsx)($,{title:`Product updates`,description:`New features and changelog highlights.`,children:(0,J.jsx)(d,{checked:t,"aria-label":`Product updates`})}),(0,J.jsx)($,{title:`Weekly digest`,description:`A Monday summary of workspace activity.`,children:(0,J.jsx)(d,{checked:n,"aria-label":`Weekly digest`})}),(0,J.jsx)($,{title:`Anomaly alerts`,description:`Email me when a metric breaks its band.`,children:(0,J.jsx)(d,{checked:r,"aria-label":`Anomaly alerts`})}),(0,J.jsx)(`p`,{style:{margin:`var(--haze-space-3) 0 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:e?`Product updates are on.`:`Product updates are off.`})]})}function xn(){let[e,,t]=W(void 0,`system`),[,,n]=W(void 0,`comfortable`);return(0,J.jsxs)(`div`,{"data-slot":`settings-appearance`,children:[(0,J.jsx)($,{title:`Theme`,description:`Follow the system, or pin light / dark.`,children:(0,J.jsxs)(S,{value:t,name:`settings-theme`,children:[(0,J.jsx)(C,{value:`system`,children:`System`}),(0,J.jsx)(C,{value:`light`,children:`Light`}),(0,J.jsx)(C,{value:`dark`,children:`Dark`})]})}),(0,J.jsx)($,{title:`Density`,description:`Comfortable spacing or the compact scale.`,children:(0,J.jsxs)(l,{value:n,size:`sm`,"aria-label":`Density`,children:[(0,J.jsx)(s,{value:`comfortable`,children:`Comfortable`}),(0,J.jsx)(s,{value:`compact`,children:`Compact`})]})}),(0,J.jsxs)(`p`,{style:{margin:`var(--haze-space-3) 0 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`Theme: `,e]})]})}function Sn(){let[,,e]=W(void 0,!0),[t,,n]=W(void 0,[`email`]);return(0,J.jsxs)(`div`,{"data-slot":`settings-security`,children:[(0,J.jsx)($,{title:`Two-factor authentication`,description:`Require a TOTP code at sign-in.`,children:(0,J.jsx)(d,{checked:e,"aria-label":`Two-factor authentication`})}),(0,J.jsx)($,{title:`Alert routes`,description:`Where security notices are delivered.`,children:(0,J.jsx)(`div`,{style:{minWidth:`240px`},children:(0,J.jsx)(T,{multiple:!0,value:n,options:[{value:`email`,label:`Email`},{value:`sms`,label:`SMS`},{value:`slack`,label:`Slack`},{value:`pagerduty`,label:`PagerDuty`}],placeholder:`Add a route…`})})}),(0,J.jsxs)(`p`,{style:{margin:`var(--haze-space-3) 0 0`,fontSize:`var(--haze-text-xs)`,color:`var(--haze-color-text-muted)`},children:[`Active routes: `,t.join(`, `)]})]})}function Cn(){let[,,e]=W(void 0,`notifications`);return(0,J.jsxs)(`div`,{"data-slot":`settings-block`,style:{padding:`var(--haze-space-5)`,background:`var(--haze-color-bg)`,fontFamily:`var(--haze-font-sans)`,color:`var(--haze-color-text)`},children:[(0,J.jsx)(`h2`,{style:{margin:`0 0 var(--haze-space-1)`,fontSize:`var(--haze-text-xl)`},children:`Workspace settings`}),(0,J.jsx)(`p`,{style:{margin:`0 0 var(--haze-space-4)`,fontSize:`var(--haze-text-sm)`,color:`var(--haze-color-text-secondary)`},children:`Preferences apply to everyone in acme-robotics.`}),(0,J.jsxs)(x,{variant:`outlined`,children:[(0,J.jsx)(w,{value:e,variant:`card`,items:[{value:`notifications`,label:`Notifications`,panel:(0,J.jsx)(bn,{})},{value:`appearance`,label:`Appearance`,panel:(0,J.jsx)(xn,{})},{value:`security`,label:`Security`,panel:(0,J.jsx)(Sn,{})}]}),(0,J.jsxs)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`var(--haze-space-2)`,marginTop:`var(--haze-space-4)`},children:[(0,J.jsx)(G,{variant:`ghost`,children:`Discard`}),(0,J.jsx)(G,{children:`Save changes`})]})]})]})}var wn=new Map(Object.entries(Object.assign({"./blocks/AiWorkbenchBlock.tsx":`import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';
import {
  MessagesSquare,
  GitPullRequest,
  FileSearch,
  Settings,
  PanelLeft,
} from 'lucide-react';

import {
  ActivityRail,
  ActivityRailItem,
  Avatar,
  Badge,
  Button,
  ChatContainer,
  ChatMessage,
  ConversationItem,
  ConversationList,
  Empty,
  ModelPicker,
  PromptInput,
  Sources,
  StatusBar,
  StatusItem,
  StreamingText,
  TabBar,
  TabBarItem,
  ThinkingIndicator,
  ToolCallCard,
  Workbench,
} from '@/lib';

/*
 * AI workbench block: the Workbench shell assembled as a double-column AI
 * coding-review desk — activity rail + ConversationList sidebar on the left,
 * the chat column (ChatContainer + scripted ThinkingIndicator → ToolCallCard
 * → StreamingText turn) in the middle, a docked Sources citations panel on
 * the right, PromptInput + ModelPicker as the composer and a StatusBar
 * under everything. Same no-network script idea as the chat block, but the
 * layout is the point here: resizable columns, collapsible sidebar, mobile
 * overlays — all Workbench features, not local CSS.
 */

type Phase = 'idle' | 'thinking' | 'tool' | 'answering';

type Entry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'thinking' }
  | { id: number; kind: 'thought'; seconds: number }
  | { id: number; kind: 'tool'; status: 'running' | 'done' }
  | { id: number; kind: 'answer'; text: string; phase: 'streaming' | 'done' };

type Conversation = { id: string; title: string; subtitle: string; time: string };

type ToolScript = { thoughtSeconds: number; runMs: number };

type TurnScript = { thinkMs: number; tool?: ToolScript; answer: string };

type Model = {
  value: string;
  label: string;
  contextLength: string;
  /** Characters per StreamingText tick — the model card changes pacing. */
  cps: number;
};

const AGENT_NAME = 'Nimbus Review Copilot';
const USER_NAME = 'Dev';

const MODELS: Model[] = [
  { value: 'nimbus-4o', label: 'Nimbus 4o', contextLength: '128k', cps: 14 },
  { value: 'nimbus-4o-mini', label: 'Nimbus 4o mini', contextLength: '32k', cps: 26 },
  { value: 'nimbus-reasoner', label: 'Nimbus reasoner', contextLength: '200k', cps: 9 },
];

const REVIEWERS = ['Ana Petrova', 'Ben Okafor', 'Chen Wei', 'Dana Silva'];

const TOUR_QUESTION = 'Review PR #482 — is the new retry loop safe to ship?';

const TOOL_INPUT = \`{ "repo": "nimbus-gateway",
  "pull": 482,
  "focus": "retry.go" }\`;

const TOOL_OUTPUT = \`retry.go        +38 −4
backoff cap     2s → 8s
payload policy  unchanged (verbatim)
tests           11 passed, 2 skipped\`;

const TOUR_ANSWER =
  'Mostly safe, with one sharp edge. The doubled backoff cap is fine and the new jitter prevents thundering herds, but the webhook path still retries the 1.2 MB payload verbatim — exactly the failure mode from the week-42 incident. Key retries on the Idempotency-Key header and fall back to the batched format after two failures; that mirrors the fix that recovered Ferrite Labs. The two skipped tests are the webhook ones, so add coverage there before merge.';

const FOLLOW_UP_ANSWER =
  'Checked the CI history for this branch: the skipped webhook tests have been skipped for three weeks (imported flag), not flaked. I can draft the idempotency patch on a side branch and link it to the PR — want the diff posted here or as review comments?';

const SOURCE_ITEMS = [
  {
    id: 'retry-go',
    title: 'gateway/retry.go @ v2.3',
    url: '#ai-workbench',
    snippet: 'backoff := base * math.Pow(2, float64(attempt)); if backoff > cap { backoff = cap }',
  },
  {
    id: 'postmortem',
    title: 'postmortem/webhook-410.md',
    url: '#ai-workbench',
    snippet: 'The 1.2 MB body is rejected by the gateway before ingest; every retry re-sends it verbatim.',
  },
  {
    id: 'runbook',
    title: 'runbook/retries.md',
    url: '#ai-workbench',
    snippet: 'Retries must be idempotent — key them on Idempotency-Key, never on attempt count.',
  },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'retry-loop', title: 'PR #482 · retry loop safety', subtitle: 'nimbus-gateway', time: '2m' },
  { id: 'flaky-e2e', title: 'Flaky e2e: checkout spec', subtitle: 'nimbus-web', time: '1h' },
  { id: 'migration-notes', title: 'Draft v2.3 migration notes', subtitle: 'docs', time: '3h' },
  { id: 'secrets', title: 'Rotate leaked CI secrets', subtitle: 'infra', time: 'yesterday' },
];

const SEED_ENTRIES: Record<string, Entry[]> = {
  'retry-loop': [{ id: 1, kind: 'user', text: TOUR_QUESTION }],
  'flaky-e2e': [
    { id: 1, kind: 'user', text: 'The checkout spec failed twice on main last night — same assertion?' },
    {
      id: 2,
      kind: 'answer',
      phase: 'done',
      text: 'Different assertions, same cause: both runs raced the stubbed clock at midnight UTC. Freeze the clock fixture and the pair of failures collapses into one deterministic case.',
    },
  ],
};

const TOUR_SCRIPT: TurnScript = {
  thinkMs: 900,
  tool: { thoughtSeconds: 4, runMs: 1100 },
  answer: TOUR_ANSWER,
};

const FOLLOW_UP_SCRIPT: TurnScript = {
  thinkMs: 700,
  tool: { thoughtSeconds: 3, runMs: 900 },
  answer: FOLLOW_UP_ANSWER,
};

/** Deterministic fake clock (chat-block pattern): stable timestamps, no
 * Date in the render. */
function stamp(id: number): string {
  return \`14:\${String(5 + (id % 50)).padStart(2, '0')}\`;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** Async reviewer-mention source for PromptInput's @ trigger — stale
 * responses are dropped by the component itself. */
function suggestReviewer(trigger: string, query: string): Promise<string[]> {
  return sleep(200).then(() => {
    if (trigger !== '@') return [];
    const q = query.toLowerCase();
    return REVIEWERS.filter((name) => name.toLowerCase().startsWith(q));
  });
}

function Mono({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--haze-font-mono)',
        fontSize: 'var(--haze-text-xs)',
        whiteSpace: 'pre',
        color: 'var(--haze-color-text-secondary)',
      }}
    >
      {children}
    </code>
  );
}

export default function AiWorkbenchBlock() {
  const [conversations, setConversations] = useState(SEED_CONVERSATIONS);
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  // User-facing state, one Control each: active conversation, picked model,
  // composer draft/tags, workbench chrome.
  const [activeId, setActiveId] = useControl(undefined, 'retry-loop');
  const [modelValue, , modelCtrl] = useControl(undefined, MODELS[0]!.value);
  const [draft, , draftCtrl] = useControl(undefined, '');
  const [, setTags, tagsCtrl] = useControl(undefined, ['repo: nimbus-gateway', 'PR #482']);
  const [sidebarCollapsed, setSidebarCollapsed, sidebarCtrl] = useControl(undefined, false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useControl(undefined, false);

  const model = MODELS.find((m) => m.value === modelValue) ?? MODELS[0]!;

  const runRef = useRef(0);
  const idRef = useRef(100);
  const nextId = () => (idRef.current += 1);

  // Invalidation guard (chat-block pattern): unmount / stop / new run bumps
  // the counter so cancelled sleeps never mutate state.
  useEffect(() => () => {
    runRef.current += 1;
  }, []);

  const append = useCallback((conv: string, entry: Entry) => {
    setEntries((prev) => ({ ...prev, [conv]: [...(prev[conv] ?? []), entry] }));
  }, []);

  const patch = useCallback(
    (conv: string, id: number, updater: (entry: Entry) => Entry) => {
      setEntries((prev) => ({
        ...prev,
        [conv]: (prev[conv] ?? []).map((entry) =>
          entry.id === id ? updater(entry) : entry
        ),
      }));
    },
    []
  );

  const setPhaseFor = useCallback((conv: string, phase: Phase) => {
    setPhases((prev) => ({ ...prev, [conv]: phase }));
  }, []);

  const playTurn = useCallback(
    async (conv: string, script: TurnScript) => {
      const run = (runRef.current += 1);
      const alive = () => run === runRef.current;

      setPhaseFor(conv, 'thinking');
      const thinkingId = nextId();
      append(conv, { id: thinkingId, kind: 'thinking' });
      await sleep(script.thinkMs);
      if (!alive()) return;

      const thoughtSeconds = script.tool
        ? script.tool.thoughtSeconds
        : Math.max(1, Math.round(script.thinkMs / 1000));
      patch(conv, thinkingId, () => ({
        id: thinkingId,
        kind: 'thought',
        seconds: thoughtSeconds,
      }));

      if (script.tool) {
        setPhaseFor(conv, 'tool');
        const toolId = nextId();
        append(conv, { id: toolId, kind: 'tool', status: 'running' });
        await sleep(script.tool.runMs);
        if (!alive()) return;
        patch(conv, toolId, () => ({ id: toolId, kind: 'tool', status: 'done' }));
      }

      setPhaseFor(conv, 'answering');
      append(conv, { id: nextId(), kind: 'answer', text: script.answer, phase: 'streaming' });
    },
    [append, patch, setPhaseFor]
  );

  // The scripted review plays once on mount in the seeded conversation —
  // kicked from a timer so the effect body itself never writes state.
  useEffect(() => {
    const timer = setTimeout(() => {
      void playTurn('retry-loop', TOUR_SCRIPT);
    }, 0);
    return () => clearTimeout(timer);
  }, [playTurn]);

  const phase = phases[activeId] ?? 'idle';
  const generating = phase !== 'idle';

  const send = (text: string) => {
    if (!text.trim()) return;
    append(activeId, { id: nextId(), kind: 'user', text });
    void playTurn(activeId, FOLLOW_UP_SCRIPT);
  };

  const stopGeneration = () => {
    runRef.current += 1;
    setPhaseFor(activeId, 'idle');
    setEntries((prev) => {
      const list = [...(prev[activeId] ?? [])];
      while (list.length > 0) {
        const last = list[list.length - 1]!;
        const incomplete =
          last.kind === 'thinking' ||
          (last.kind === 'tool' && last.status === 'running') ||
          (last.kind === 'answer' && last.phase === 'streaming');
        if (!incomplete) break;
        list.pop();
      }
      return { ...prev, [activeId]: list };
    });
  };

  const newChat = () => {
    const id = \`review-\${conversations.length + 1}\`;
    setConversations((prev) => [
      { id, title: 'New review session', subtitle: 'no repo bound', time: 'now' },
      ...prev,
    ]);
    setActiveId(id);
  };

  const markAnswerDone = (id: number) => {
    patch(activeId, id, (entry) =>
      entry.kind === 'answer' ? { ...entry, phase: 'done' } : entry
    );
    setPhaseFor(activeId, 'idle');
  };

  const renderEntry = (entry: Entry) => {
    switch (entry.kind) {
      case 'user':
        return (
          <ChatMessage
            key={entry.id}
            role='user'
            name={USER_NAME}
            status='sent'
            timestamp={stamp(entry.id)}
            avatar={<Avatar size='sm' fallback='DV' />}
          >
            <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
          </ChatMessage>
        );
      case 'thinking':
        return <ThinkingIndicator key={entry.id} text='Reading the diff…' />;
      case 'thought':
        return (
          <div
            key={entry.id}
            data-slot='workbench-thought'
            style={{
              padding: 'var(--haze-space-1) 0',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Thought for {entry.seconds}s
          </div>
        );
      case 'tool':
        return (
          <ToolCallCard
            key={entry.id}
            name='read_diff'
            status={entry.status}
            input={<Mono>{TOOL_INPUT}</Mono>}
            output={entry.status === 'done' ? <Mono>{TOOL_OUTPUT}</Mono> : undefined}
          />
        );
      case 'answer':
        return (
          <ChatMessage
            key={entry.id}
            role='assistant'
            name={AGENT_NAME}
            timestamp={stamp(entry.id)}
            copyable
            avatar={<Avatar size='sm' fallback='RC' />}
          >
            {entry.phase === 'streaming' ? (
              <StreamingText
                text={entry.text}
                speed={model.cps}
                onComplete={() => markAnswerDone(entry.id)}
              />
            ) : (
              <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
            )}
            {entry.phase === 'done' && activeId === 'retry-loop' && (
              <Sources
                compact
                items={SOURCE_ITEMS}
                label='Citations for this review'
                style={{ marginTop: 'var(--haze-space-2)' }}
              />
            )}
          </ChatMessage>
        );
    }
  };

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]!;

  return (
    <div
      data-slot='ai-workbench-block'
      style={{ height: '100%', fontFamily: 'var(--haze-font-sans)', color: 'var(--haze-color-text)' }}
    >
      <Workbench
        style={{ height: '100%' }}
        sidebarCollapsed={sidebarCtrl}
        mobileSidebarOpen={mobileSidebarOpen}
        activityBar={
          <ActivityRail aria-label='Workbench views'>
            <ActivityRailItem
              icon={<MessagesSquare size={20} />}
              label='Conversations'
              active
              badge={3}
            />
            <ActivityRailItem icon={<GitPullRequest size={20} />} label='Open reviews' badge={5} />
            <ActivityRailItem icon={<FileSearch size={20} />} label='Code search' />
            <ActivityRailItem slot='end' icon={<Settings size={20} />} label='Settings' />
          </ActivityRail>
        }
        sidebar={
          <div
            data-slot='workbench-conversations'
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--haze-color-bg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--haze-space-2)',
                padding: 'var(--haze-space-3) var(--haze-space-3) var(--haze-space-2)',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 'var(--haze-text-xs)',
                  fontWeight: 'var(--haze-weight-semibold)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                Conversations
              </span>
              <Button size='sm' variant='outline' onClick={newChat}>
                New
              </Button>
            </div>
            {/* ConversationList takes className only — the rail wraps it and
                owns the overflow. */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '0 var(--haze-space-2)',
              }}
            >
              <ConversationList>
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    title={conversation.title}
                    subtitle={conversation.subtitle}
                    active={conversation.id === activeId}
                    onClick={() => setActiveId(conversation.id)}
                    end={
                      <span
                        style={{
                          fontSize: 'var(--haze-text-xs)',
                          color: 'var(--haze-color-text-muted)',
                        }}
                      >
                        {conversation.time}
                      </span>
                    }
                  />
                ))}
              </ConversationList>
            </div>
          </div>
        }
        auxiliaryBar={
          <div
            data-slot='workbench-sources'
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--haze-color-bg)',
            }}
          >
            <div
              style={{
                padding: 'var(--haze-space-3)',
                borderBottom: '1px solid var(--haze-color-border)',
                fontSize: 'var(--haze-text-xs)',
                fontWeight: 'var(--haze-weight-semibold)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--haze-color-text-muted)',
              }}
            >
              Citations
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--haze-space-3)' }}>
              <Sources items={SOURCE_ITEMS} label='Sources cited by the copilot' />
              <p
                style={{
                  margin: 'var(--haze-space-3) 0 0',
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                Drag the panel edge to resize; the handle collapses it entirely.
              </p>
            </div>
          </div>
        }
        statusBar={
          <StatusBar
            left={
              <>
                <StatusItem priority>{model.label}</StatusItem>
                <StatusItem>ctx {model.contextLength}</StatusItem>
                <StatusItem>grounding: repo + docs</StatusItem>
              </>
            }
            right={
              <>
                <StatusItem>main · clean</StatusItem>
                <StatusItem priority>5 reviews open</StatusItem>
              </>
            }
          />
        }
        tabBar={
          <TabBar aria-label='Workbench navigation'>
            <TabBarItem
              icon={<MessagesSquare size={18} />}
              label='Chats'
              badge={3}
              active={mobileSidebarOpen}
              onSelect={() => setMobileSidebarOpen((v) => !v)}
            />
            <TabBarItem
              icon={<GitPullRequest size={18} />}
              label='Reviews'
              badge={5}
              onSelect={() => setMobileSidebarOpen(true)}
            />
          </TabBar>
        }
      >
        <div
          data-slot='workbench-chat'
          style={{
            height: '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--haze-color-bg-subtle)',
          }}
        >
          <header
            data-slot='workbench-chat-header'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--haze-space-2)',
              padding: 'var(--haze-space-2) var(--haze-space-3)',
              borderBottom: '1px solid var(--haze-color-border)',
              background: 'var(--haze-color-bg)',
            }}
          >
            <Button
              size='sm'
              variant='ghost'
              square
              aria-label={sidebarCollapsed ? 'Show conversations' : 'Hide conversations'}
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <PanelLeft size={16} aria-hidden='true' />
            </Button>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'var(--haze-text-sm)',
                  fontWeight: 'var(--haze-weight-semibold)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeConversation.title}
              </div>
              <div
                style={{
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                {activeConversation.subtitle} · scripted demo, no network
              </div>
            </div>
            <span style={{ flex: 1 }} />
            {generating ? (
              <Badge color='info'>Generating…</Badge>
            ) : (
              <Badge color='success'>ready</Badge>
            )}
          </header>

          <ChatContainer
            role='log'
            aria-label='Review conversation transcript'
            style={{ flex: 1, minHeight: 0 }}
          >
            {(entries[activeId] ?? []).length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '240px',
                }}
              >
                <Empty description='Ask about a pull request, a test or a runbook — replies are scripted, nothing leaves the page.' />
              </div>
            ) : (
              (entries[activeId] ?? []).map(renderEntry)
            )}
          </ChatContainer>

          <footer
            data-slot='workbench-composer'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--haze-space-2)',
              padding: 'var(--haze-space-3)',
              borderTop: '1px solid var(--haze-color-border)',
              background: 'var(--haze-color-bg)',
            }}
          >
            <div style={{ width: '180px', flexShrink: 0 }}>
              <ModelPicker
                value={modelCtrl}
                options={MODELS.map(({ value, label, contextLength }) => ({
                  value,
                  label,
                  contextLength,
                }))}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <PromptInput
                value={draftCtrl}
                tags={tagsCtrl}
                onTagsChange={setTags}
                triggers={['@']}
                getSuggestions={suggestReviewer}
                onSubmit={() => send(draft)}
                placeholder={generating ? 'Copilot is responding…' : 'Ask, or @ a reviewer…'}
                disabled={generating}
                maxRows={4}
              />
            </div>
            {generating && (
              <Button size='sm' variant='outline' onClick={stopGeneration}>
                Stop
              </Button>
            )}
          </footer>
        </div>
      </Workbench>
    </div>
  );
}
`,"./blocks/ChatBlock.tsx":`import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import {
  Avatar,
  Badge,
  Button,
  ChatContainer,
  ChatInput,
  ChatMessage,
  ConversationItem,
  ConversationList,
  Empty,
  StreamingText,
  ThinkingIndicator,
  ToolCallCard,
} from '@/lib';

/*
 * Chat block: the AI conversation family assembled into one screen — a
 * scrolling ChatContainer (role="log") of ChatMessages, a scripted agent
 * turn that plays a ThinkingIndicator, a ToolCallCard (running → done)
 * and a StreamingText answer, plus a ChatInput whose send button flips
 * to a stop control while the turn runs. The right rail is a
 * ConversationList: switching or starting chats swaps the transcript,
 * and every reply is scripted — no network, timers only. All layout
 * glue is inline styles over --haze-* tokens so the block re-themes.
 */

type Phase = 'idle' | 'thinking' | 'tool' | 'answering';

type Entry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'thinking' }
  | { id: number; kind: 'thought'; seconds: number }
  | { id: number; kind: 'tool'; status: 'running' | 'done' }
  | { id: number; kind: 'answer'; text: string; phase: 'streaming' | 'done' };

type Conversation = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
};

type ToolScript = { thoughtSeconds: number; runMs: number };

type TurnScript = { thinkMs: number; tool?: ToolScript; answer: string };

const AGENT_NAME = 'Nimbus Copilot';
const USER_NAME = 'Ana';

const TOUR_QUESTION =
  'Why did event volume drop for Ferrite Labs last week?';

const TOOL_INPUT = \`{ "workspace": "ferrite-labs",
  "metric": "ingested_events",
  "range": "14d" }\`;

const TOOL_OUTPUT = \`wk 41 → 71,980 events
wk 42 → 44,610 events (−38%)
source: webhook/v2, 3 collectors\`;

const TOUR_ANSWER =
  'Ferrite Labs lost 38% of ingested events in week 42 — all of it from the webhook source, while the SDK collectors stayed flat. The cliff starts Tuesday 09:40, which lines up with their v2.3 webhook rollout. The failing payload now sends a 1.2 MB body and gets rejected by the gateway before ingest. Retrying with the v2 batched format should recover it — want me to draft the migration note?';

const FOLLOW_UP_ANSWER =
  'Scanned the last 24 hours across this workspace: ingest is flat everywhere else, so the Ferrite Labs cliff is still the only outlier. I can pin an annotation to the chart and alert you when the webhook error rate clears — say the word.';

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'anomaly', title: 'Ferrite Labs volume drop', subtitle: 'Investigating the week-42 cliff', time: '09:41' },
  { id: 'retention', title: 'Weekly retention digest', subtitle: 'Summarized last week', time: 'Yesterday' },
  { id: 'ingest', title: 'Ingest backfill window', subtitle: 'Resolved', time: 'Mon' },
];

const SEED_ENTRIES: Record<string, Entry[]> = {
  anomaly: [{ id: 1, kind: 'user', text: TOUR_QUESTION }],
  retention: [
    { id: 2, kind: 'user', text: 'Give me the one-line retention story for last week.' },
    {
      id: 3,
      kind: 'answer',
      text: 'Rolling 7-day retention held at 41% — up 1.2 points. Power users drove the lift; trial workspaces were flat.',
      phase: 'done',
    },
  ],
  ingest: [
    { id: 4, kind: 'user', text: 'Is the October backfill window still open?' },
    { id: 5, kind: 'answer', text: 'It closed Sunday 23:59 UTC. The next window opens Nov 3 — queued replays carry over automatically.', phase: 'done' },
  ],
};

const TOUR_SCRIPT: TurnScript = {
  thinkMs: 1300,
  tool: { thoughtSeconds: 4, runMs: 1700 },
  answer: TOUR_ANSWER,
};

const FOLLOW_UP_SCRIPT: TurnScript = {
  thinkMs: 900,
  answer: FOLLOW_UP_ANSWER,
};

/** Deterministic fake clock — stable timestamps keep the demo (and its
 * smoke test) reproducible without dragging Date into the render. */
function stamp(id: number): string {
  return \`09:\${String(40 + (id % 20)).padStart(2, '0')}\`;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function Mono({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--haze-font-mono)',
        fontSize: 'var(--haze-text-xs)',
        whiteSpace: 'pre',
        color: 'var(--haze-color-text-secondary)',
      }}
    >
      {children}
    </code>
  );
}

export default function ChatBlock() {
  const [conversations, setConversations] = useState(SEED_CONVERSATIONS);
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  // The active conversation is user-facing state — one Control, and a
  // host app could drive it externally.
  const [activeId, setActiveId] = useControl(undefined, 'anomaly');

  const runRef = useRef(0);
  const idRef = useRef(100);
  const nextId = () => (idRef.current += 1);

  // Invalidation guard: a new run, a stop or the unmount bumps the
  // counter, so stale sleeps from a cancelled turn never mutate state.
  useEffect(() => () => {
    runRef.current += 1;
  }, []);

  const append = useCallback((conv: string, entry: Entry) => {
    setEntries((prev) => ({ ...prev, [conv]: [...(prev[conv] ?? []), entry] }));
  }, []);

  const patch = useCallback(
    (conv: string, id: number, updater: (entry: Entry) => Entry) => {
      setEntries((prev) => ({
        ...prev,
        [conv]: (prev[conv] ?? []).map((entry) =>
          entry.id === id ? updater(entry) : entry
        ),
      }));
    },
    []
  );

  const setPhaseFor = useCallback((conv: string, phase: Phase) => {
    setPhases((prev) => ({ ...prev, [conv]: phase }));
  }, []);

  const playTurn = useCallback(
    async (conv: string, script: TurnScript) => {
      const run = (runRef.current += 1);
      const alive = () => run === runRef.current;

      setPhaseFor(conv, 'thinking');
      const thinkingId = nextId();
      append(conv, { id: thinkingId, kind: 'thinking' });
      await sleep(script.thinkMs);
      if (!alive()) return;

      const thoughtSeconds = script.tool
        ? script.tool.thoughtSeconds
        : Math.max(1, Math.round(script.thinkMs / 1000));
      patch(conv, thinkingId, () => ({
        id: thinkingId,
        kind: 'thought',
        seconds: thoughtSeconds,
      }));

      if (script.tool) {
        setPhaseFor(conv, 'tool');
        const toolId = nextId();
        append(conv, { id: toolId, kind: 'tool', status: 'running' });
        await sleep(script.tool.runMs);
        if (!alive()) return;
        patch(conv, toolId, () => ({ id: toolId, kind: 'tool', status: 'done' }));
      }

      setPhaseFor(conv, 'answering');
      append(conv, {
        id: nextId(),
        kind: 'answer',
        text: script.answer,
        phase: 'streaming',
      });
    },
    [append, patch, setPhaseFor]
  );

  // The scripted tour plays once on mount in the seeded conversation —
  // kicked from a timer so the effect body itself never writes state.
  useEffect(() => {
    const timer = setTimeout(() => {
      void playTurn('anomaly', TOUR_SCRIPT);
    }, 0);
    return () => clearTimeout(timer);
  }, [playTurn]);

  const phase = phases[activeId] ?? 'idle';

  const send = (text: string) => {
    append(activeId, { id: nextId(), kind: 'user', text });
    void playTurn(activeId, FOLLOW_UP_SCRIPT);
  };

  /** Stop keeps what finished and drops the in-flight tail (thinking
   * dots, a running tool, a half-streamed answer) in one pass. */
  const stopGeneration = () => {
    runRef.current += 1;
    setPhaseFor(activeId, 'idle');
    setEntries((prev) => {
      const list = [...(prev[activeId] ?? [])];
      while (list.length > 0) {
        const last = list[list.length - 1]!;
        const incomplete =
          last.kind === 'thinking' ||
          (last.kind === 'tool' && last.status === 'running') ||
          (last.kind === 'answer' && last.phase === 'streaming');
        if (!incomplete) break;
        list.pop();
      }
      return { ...prev, [activeId]: list };
    });
  };

  const newChat = () => {
    const id = \`fresh-\${conversations.length + 1}\`;
    setConversations((prev) => [
      { id, title: 'New conversation', subtitle: 'Just started', time: 'now' },
      ...prev,
    ]);
    setActiveId(id);
  };

  const markAnswerDone = (id: number) => {
    patch(activeId, id, (entry) =>
      entry.kind === 'answer' ? { ...entry, phase: 'done' } : entry
    );
    setPhaseFor(activeId, 'idle');
  };

  const renderEntry = (entry: Entry) => {
    switch (entry.kind) {
      case 'user':
        return (
          <ChatMessage
            key={entry.id}
            role='user'
            name={USER_NAME}
            status='sent'
            timestamp={stamp(entry.id)}
            avatar={<Avatar size='sm' fallback='AN' />}
          >
            <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
          </ChatMessage>
        );
      case 'thinking':
        return (
          <ThinkingIndicator
            key={entry.id}
            text='Pulling workspace metrics…'
          />
        );
      case 'thought':
        return (
          <div
            key={entry.id}
            data-slot='chat-thought'
            style={{
              padding: 'var(--haze-space-1) 0',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Thought for {entry.seconds}s
          </div>
        );
      case 'tool':
        return (
          <ToolCallCard
            key={entry.id}
            name='query_events'
            status={entry.status}
            input={<Mono>{TOOL_INPUT}</Mono>}
            output={entry.status === 'done' ? <Mono>{TOOL_OUTPUT}</Mono> : undefined}
          />
        );
      case 'answer':
        return (
          <ChatMessage
            key={entry.id}
            role='assistant'
            name={AGENT_NAME}
            timestamp={stamp(entry.id)}
            copyable
            avatar={<Avatar size='sm' fallback='NC' />}
          >
            {entry.phase === 'streaming' ? (
              <StreamingText
                text={entry.text}
                speed={12}
                onComplete={() => markAnswerDone(entry.id)}
              />
            ) : (
              <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
            )}
          </ChatMessage>
        );
    }
  };

  return (
    <div
      data-slot='chat-block'
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '480px',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      <section
        aria-label={\`Chat with \${AGENT_NAME}\`}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          data-slot='chat-header'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--haze-space-3)',
            padding: 'var(--haze-space-3) var(--haze-space-4)',
            borderBottom: '1px solid var(--haze-color-border)',
          }}
        >
          <Avatar fallback='NC' />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--haze-text-sm)', fontWeight: 'var(--haze-weight-semibold)' }}>
              {AGENT_NAME}
            </div>
            <div style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
              Workspace analytics agent · scripted demo
            </div>
          </div>
          <span style={{ flex: 1 }} />
          {phase === 'idle' ? <Badge>Ready</Badge> : <Badge color='info'>Generating…</Badge>}
        </header>

        {/* ChatContainer owns the scrollport; role="log" makes the whole
            transcript one live region for assistive tech. */}
        <ChatContainer
          role='log'
          aria-label='Conversation transcript'
          style={{ flex: 1, minHeight: 0, background: 'var(--haze-color-bg-subtle)' }}
        >
          {(entries[activeId] ?? []).length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '240px',
              }}
            >
              <Empty description='Ask about workspaces, events or alerts — every reply here is scripted, no network involved.' />
            </div>
          ) : (
            (entries[activeId] ?? []).map(renderEntry)
          )}
        </ChatContainer>

        <footer
          data-slot='chat-composer'
          style={{
            borderTop: '1px solid var(--haze-color-border)',
            padding: 'var(--haze-space-3)',
            background: 'var(--haze-color-bg)',
          }}
        >
          <ChatInput
            onSend={send}
            generating={phase !== 'idle'}
            onStop={stopGeneration}
            placeholder={
              phase === 'idle' ? 'Ask a follow-up…' : 'Assistant is responding…'
            }
          />
        </footer>
      </section>

      <aside
        data-slot='chat-conversations'
        aria-label='Conversations'
        style={{
          width: '264px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderInlineStart: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--haze-space-2)',
            padding: 'var(--haze-space-3) var(--haze-space-3) var(--haze-space-2)',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 'var(--haze-text-xs)',
              fontWeight: 'var(--haze-weight-semibold)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Conversations
          </span>
          <Button size='sm' variant='outline' onClick={newChat}>
            New chat
          </Button>
        </div>
        {/* ConversationList has no style prop (className only, for
            Linaria classes) — the rail wraps it and owns the overflow. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 var(--haze-space-2)',
          }}
        >
          <ConversationList>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                title={conversation.title}
                subtitle={conversation.subtitle}
                active={conversation.id === activeId}
                onClick={() => setActiveId(conversation.id)}
                end={
                  <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
                    {conversation.time}
                  </span>
                }
              />
            ))}
          </ConversationList>
        </div>
      </aside>
    </div>
  );
}
`,"./blocks/CrudBlock.tsx":`import type { DataTableColumnDef, TreeNodeData } from '@/lib';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';
import { z } from 'zod';

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  Form,
  FormItem,
  InputCore,
  Kbd,
  Option,
  Segmented,
  SelectCore,
  ToastContainer,
  Tree,
  useForm,
  standardSchemaFormValidator,
  useToast,
} from '@/lib';

/*
 * CRUD block: the master–detail pattern over local state — a Tree picks
 * the team (group nodes filter to their subtree), the DataTable lists
 * that team's pipelines with the toolbar strip (New + density Segmented
 * + keyboard-nav copy) and the \`size\` density prop, Dialog hosts a
 * zod-validated Form for create/edit (remounted per open so
 * initialValues reload the record), ConfirmDialog guards deletes and
 * useToast reports every mutation. ToastContainer wraps the block so
 * toasts land in the demo viewport. Layout glue is inline styles over
 * --haze-* tokens only.
 */

type Schedule = '15m' | 'hourly' | 'daily';
type PipelineStatus = 'healthy' | 'degraded' | 'paused';

type Pipeline = {
  id: string;
  name: string;
  team: string;
  owner: string;
  schedule: Schedule;
  status: PipelineStatus;
};

type PipelineFormValues = {
  name: string;
  owner: string;
  schedule: Schedule | '';
};

const TEAM_TREE: TreeNodeData[] = [
  {
    key: 'all',
    title: 'All teams',
    children: [
      {
        key: 'eng',
        title: 'Engineering',
        children: [
          { key: 'eng-fe', title: 'Frontend' },
          { key: 'eng-plat', title: 'Platform' },
          { key: 'eng-data', title: 'Data' },
        ],
      },
      {
        key: 'growth',
        title: 'Growth',
        children: [
          { key: 'growth-lifecycle', title: 'Lifecycle' },
          { key: 'growth-ads', title: 'Ads' },
        ],
      },
      {
        key: 'ops',
        title: 'Operations',
        children: [
          { key: 'ops-alerts', title: 'Alerting' },
          { key: 'ops-freight', title: 'Freight' },
        ],
      },
    ],
  },
];

/** node key → leaf keys in its subtree ('eng' → its three teams). */
function leafKeysOf(nodes: TreeNodeData[], into: string[]): string[] {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      leafKeysOf(node.children, into);
    } else {
      into.push(node.key);
    }
  }
  return into;
}

const TEAM_SCOPE: Record<string, string[]> = {
  all: leafKeysOf(TEAM_TREE, []),
};
function collectScopes(nodes: TreeNodeData[]): void {
  for (const node of nodes) {
    TEAM_SCOPE[node.key] =
      node.children && node.children.length > 0
        ? leafKeysOf(node.children, [])
        : [node.key];
    if (node.children) collectScopes(node.children);
  }
}
collectScopes(TEAM_TREE);

const INITIAL_PIPELINES: Pipeline[] = [
  { id: 'p-01', name: 'Checkout event tap', team: 'eng-fe', owner: 'ada@nimbus.dev', schedule: '15m', status: 'healthy' },
  { id: 'p-02', name: 'Funnel pageviews', team: 'eng-fe', owner: 'grace@nimbus.dev', schedule: 'hourly', status: 'healthy' },
  { id: 'p-03', name: 'Gateway request log', team: 'eng-plat', owner: 'kwame@nimbus.dev', schedule: '15m', status: 'degraded' },
  { id: 'p-04', name: 'Deploy markers', team: 'eng-plat', owner: 'rina@nimbus.dev', schedule: 'hourly', status: 'healthy' },
  { id: 'p-05', name: 'Warehouse sync', team: 'eng-data', owner: 'tomas@nimbus.dev', schedule: 'daily', status: 'healthy' },
  { id: 'p-06', name: 'Backfill queue', team: 'eng-data', owner: 'tomas@nimbus.dev', schedule: 'hourly', status: 'paused' },
  { id: 'p-07', name: 'Trial activation', team: 'growth-lifecycle', owner: 'yuki@nimbus.dev', schedule: 'daily', status: 'healthy' },
  { id: 'p-08', name: 'Attribution joins', team: 'growth-ads', owner: 'omar@nimbus.dev', schedule: 'hourly', status: 'degraded' },
  { id: 'p-09', name: 'Anomaly detector', team: 'ops-alerts', owner: 'rina@nimbus.dev', schedule: '15m', status: 'healthy' },
  { id: 'p-10', name: 'Shipment tracker', team: 'ops-freight', owner: 'leo@nimbus.dev', schedule: 'hourly', status: 'healthy' },
];

const pipelineSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  owner: z.email('Enter a valid email address'),
  schedule: z.enum(['15m', 'hourly', 'daily'], { message: 'Pick a schedule' }),
});

const pipelineValidator =
  standardSchemaFormValidator<PipelineFormValues>(pipelineSchema);

function statusBadge(status: PipelineStatus) {
  const color =
    status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'default';
  return <Badge color={color}>{status}</Badge>;
}

function scheduleBadge(schedule: Schedule) {
  return <Badge color={schedule === '15m' ? 'info' : 'default'}>{schedule}</Badge>;
}

/**
 * One dialog form, fresh per open: the parent remounts it (key=session),
 * so \`initialValues\` alone loads the record being edited.
 */
function PipelineForm({
  pipeline,
  onCancel,
  onSubmit,
}: {
  pipeline: Pipeline | null;
  onCancel: () => void;
  onSubmit: (values: PipelineFormValues) => void;
}) {
  const form = useForm<PipelineFormValues>({
    initialValues: pipeline
      ? { name: pipeline.name, owner: pipeline.owner, schedule: pipeline.schedule }
      : { name: '', owner: '', schedule: '' },
    validate: pipelineValidator,
    validateDeps: ['name', 'owner', 'schedule'],
  });

  return (
    <Form form={form} onValidSubmit={onSubmit}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-4)',
        }}
      >
        <FormItem
          form={form}
          name='name'
          label='Pipeline name'
          rules={{ required: true }}
          input={InputCore}
          placeholder='Checkout event tap'
        />
        <FormItem
          form={form}
          name='owner'
          label='Owner email'
          rules={{ required: true }}
          input={InputCore}
          type='email'
          placeholder='owner@nimbus.dev'
        />
        <FormItem
          form={form}
          name='schedule'
          label='Schedule'
          rules={{ required: true }}
          input={SelectCore}
        >
          <Option value=''>Pick a schedule…</Option>
          <Option value='15m'>Every 15 minutes</Option>
          <Option value='hourly'>Hourly</Option>
          <Option value='daily'>Daily</Option>
        </FormItem>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--haze-space-2)',
          }}
        >
          {/* Button's native \`type\` is pinned to 'button' — submit through
              the owning form so the zod chain runs first. */}
          <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
            Save pipeline
          </Button>
          <Button variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Form>
  );
}

function CrudScreen() {
  const toast = useToast();

  // Master selection, dialog/confirm open and density are user-facing —
  // Controls all the way down.
  const [selectedKeys, setSelectedKeys, selectedCtrl] = useControl<string[]>(
    undefined,
    ['all']
  );
  const [density, setDensity, densityCtrl] = useControl(undefined, 'md');
  const [, setDialogOpen, dialogOpenCtrl] = useControl(undefined, false);
  const [, setConfirmOpen, confirmOpenCtrl] = useControl(undefined, false);
  // Uncontrolled-with-default: seeds the initial expansion, then the
  // tree owns the toggling.
  const [, , expandedCtrl] = useControl<string[]>(undefined, ['all']);

  const [pipelines, setPipelines] = useState(INITIAL_PIPELINES);
  const [editing, setEditing] = useState<Pipeline | null>(null);
  const [session, setSession] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Pipeline | null>(null);
  const nextIdRef = useRef(INITIAL_PIPELINES.length + 1);

  const scope = useMemo(
    () => TEAM_SCOPE[selectedKeys[0] ?? 'all'] ?? [],
    [selectedKeys]
  );
  const rows = useMemo(
    () => pipelines.filter((pipeline) => scope.includes(pipeline.team)),
    [pipelines, scope]
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setSession((s) => s + 1);
    setDialogOpen(true);
  }, [setDialogOpen]);

  const openEdit = useCallback(
    (pipeline: Pipeline) => {
      setEditing(pipeline);
      setSession((s) => s + 1);
      setDialogOpen(true);
    },
    [setDialogOpen]
  );

  const closeDialog = useCallback(() => setDialogOpen(false), [setDialogOpen]);

  const handleSubmit = (values: PipelineFormValues) => {
    // onValidSubmit implies the zod schema passed — schedule is a Schedule.
    if (editing) {
      setPipelines((prev) =>
        prev.map((pipeline) =>
          pipeline.id === editing.id
            ? { ...pipeline, ...values, schedule: values.schedule as Schedule }
            : pipeline
        )
      );
      toast(\`Updated \${values.name}\`, { variant: 'success' });
    } else {
      const id = \`p-\${String(nextIdRef.current).padStart(2, '0')}\`;
      nextIdRef.current += 1;
      setPipelines((prev) => [
        ...prev,
        {
          id,
          team: scope[0] ?? 'eng-fe',
          owner: values.owner,
          name: values.name,
          schedule: values.schedule as Schedule,
          status: 'healthy',
        },
      ]);
      toast(\`Created \${values.name}\`, { variant: 'success' });
    }
    closeDialog();
  };

  const askDelete = useCallback(
    (pipeline: Pipeline) => {
      setPendingDelete(pipeline);
      setConfirmOpen(true);
    },
    [setConfirmOpen]
  );

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setPendingDelete(null);
  }, [setConfirmOpen]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setPipelines((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    toast(\`Deleted \${pendingDelete.name}\`, { variant: 'success' });
    setPendingDelete(null);
  };

  const columns = useMemo<DataTableColumnDef<Pipeline>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Pipeline',
        cell: (info) => <strong>{info.getValue() as string}</strong>,
      },
      { accessorKey: 'owner', header: 'Owner' },
      {
        accessorKey: 'schedule',
        header: 'Schedule',
        cell: (info) => scheduleBadge(info.getValue() as Schedule),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => statusBadge(info.getValue() as PipelineStatus),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--haze-space-1)',
            }}
          >
            <Button size='sm' variant='ghost' onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Button size='sm' variant='ghost' onClick={() => askDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
        meta: { sortable: false },
      },
    ],
    [openEdit, askDelete]
  );

  return (
    <div
      data-slot='crud-block'
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '480px',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      <aside
        data-slot='crud-tree'
        aria-label='Pipelines by team'
        style={{
          width: '232px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--haze-space-3)',
          borderInlineEnd: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg-subtle)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--haze-text-xs)',
            fontWeight: 'var(--haze-weight-semibold)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--haze-color-text-muted)',
            margin: '0 0 var(--haze-space-2) var(--haze-space-2)',
          }}
        >
          Teams
        </div>
        <Tree
          treeData={TEAM_TREE}
          selectedKeys={selectedCtrl}
          expandedKeys={expandedCtrl}
          onSelect={(keys) =>
            setSelectedKeys(keys.length > 0 ? [keys[keys.length - 1]!] : [])
          }
          blockNode
        />
      </aside>

      <main
        data-slot='crud-detail'
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-3)',
          padding: 'var(--haze-space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-3)' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-lg)',
              fontWeight: 'var(--haze-weight-semibold)',
            }}
          >
            Event pipelines
          </h2>
          <Badge color='info'>{rows.length}</Badge>
          <span style={{ flex: 1 }} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--haze-space-1)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Keyboard: <Kbd size='sm'>Tab</Kbd> reaches a cell,
            <Kbd size='sm'>←</Kbd>
            <Kbd size='sm'>↑</Kbd>
            <Kbd size='sm'>↓</Kbd>
            <Kbd size='sm'>→</Kbd> roam,
            <Kbd size='sm'>Enter</Kbd> sorts a header
          </span>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          sortable
          size={density as 'sm' | 'md' | 'lg'}
          toolbar={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--haze-space-2)',
                flexWrap: 'wrap',
              }}
            >
              <Button size='sm' onClick={openCreate}>
                New pipeline
              </Button>
              <Segmented
                size='sm'
                options={[
                  { value: 'sm', label: 'S' },
                  { value: 'md', label: 'M' },
                  { value: 'lg', label: 'L' },
                ]}
                value={densityCtrl}
                onChange={setDensity}
                aria-label='Table density'
              />
            </div>
          }
        />
      </main>

      <Dialog
        open={dialogOpenCtrl}
        onClose={closeDialog}
        title={editing ? 'Edit pipeline' : 'New pipeline'}
      >
        <PipelineForm
          key={session}
          pipeline={editing}
          onCancel={closeDialog}
          onSubmit={handleSubmit}
        />
      </Dialog>
      <ConfirmDialog
        open={confirmOpenCtrl}
        title='Delete pipeline'
        confirmText='Delete'
        variant='danger'
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
        onClose={closeConfirm}
      >
        Delete {pendingDelete?.name}? Its collectors stop ingesting immediately —
        there is no undo.
      </ConfirmDialog>
    </div>
  );
}

export default function CrudBlock() {
  return (
    <ToastContainer>
      <CrudScreen />
    </ToastContainer>
  );
}
`,"./blocks/DashboardBlock.tsx":`import type { DataTableColumnDef } from '@/lib';

import { useControl } from 'react-use-control';

import {
  AppShell,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DataTable,
  Option,
  Segmented,
  Select,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Stat,
  StatGroup,
} from '@/lib';
import { dataTableToCsv } from '@/lib/components/DataTable';

/*
 * Dashboard block: AppShell + Sidebar navigation, a Breadcrumb trail, a
 * Stat card row and a DataTable with the toolbar strip (density Segmented
 * + CSV export), client-side pagination and column toggling. Fictional
 * SaaS metrics — every visual value reads a --haze-* token so the block
 * re-themes with the site.
 */

type Plan = 'free' | 'pro' | 'enterprise';
type WorkspaceStatus = 'healthy' | 'trial' | 'at risk';

type WorkspaceRow = {
  id: string;
  name: string;
  plan: Plan;
  seats: number;
  events: number;
  mrr: number;
  status: WorkspaceStatus;
};

const WORKSPACES: WorkspaceRow[] = [
  { id: 'w-101', name: 'Acme Robotics', plan: 'enterprise', seats: 42, events: 184_230, mrr: 1890, status: 'healthy' },
  { id: 'w-102', name: 'Lumen Studio', plan: 'pro', seats: 12, events: 96_410, mrr: 480, status: 'healthy' },
  { id: 'w-103', name: 'Ferrite Labs', plan: 'pro', seats: 9, events: 71_980, mrr: 360, status: 'at risk' },
  { id: 'w-104', name: 'Harbor & Co', plan: 'free', seats: 3, events: 12_004, mrr: 0, status: 'trial' },
  { id: 'w-105', name: 'Northwind Freight', plan: 'enterprise', seats: 65, events: 268_750, mrr: 2925, status: 'healthy' },
  { id: 'w-106', name: 'Quanta Health', plan: 'pro', seats: 18, events: 122_866, mrr: 720, status: 'healthy' },
  { id: 'w-107', name: 'Bright Meadow', plan: 'free', seats: 2, events: 8_312, mrr: 0, status: 'trial' },
  { id: 'w-108', name: 'Kestrel Analytics', plan: 'pro', seats: 14, events: 101_540, mrr: 560, status: 'at risk' },
  { id: 'w-109', name: 'Orbit Logistics', plan: 'enterprise', seats: 51, events: 210_390, mrr: 2295, status: 'healthy' },
  { id: 'w-110', name: 'Pinewood Press', plan: 'free', seats: 5, events: 19_748, mrr: 0, status: 'trial' },
  { id: 'w-111', name: 'Solstice Energy', plan: 'pro', seats: 21, events: 143_605, mrr: 840, status: 'healthy' },
  { id: 'w-112', name: 'Umbra Games', plan: 'pro', seats: 11, events: 88_120, mrr: 440, status: 'at risk' },
];

const planBadge = (plan: Plan) => {
  const color = plan === 'enterprise' ? 'success' : plan === 'pro' ? 'info' : 'default';
  return <Badge color={color}>{plan}</Badge>;
};

const statusBadge = (status: WorkspaceStatus) => {
  const color = status === 'healthy' ? 'success' : status === 'trial' ? 'default' : 'warning';
  return <Badge color={color}>{status}</Badge>;
};

const columns: DataTableColumnDef<WorkspaceRow>[] = [
  { accessorKey: 'name', header: 'Workspace' },
  { accessorKey: 'plan', header: 'Plan', cell: (info) => planBadge(info.getValue() as Plan) },
  { accessorKey: 'seats', header: 'Seats' },
  {
    accessorKey: 'events',
    header: 'Events / mo',
    cell: (info) => (info.getValue() as number).toLocaleString('en-US'),
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: (info) => \`$\${(info.getValue() as number).toLocaleString('en-US')}\`,
  },
  { accessorKey: 'status', header: 'Status', cell: (info) => statusBadge(info.getValue() as WorkspaceStatus) },
];

/** Serialize the current rows through the table's own csv helper. */
function exportCsv(): void {
  const csv = dataTableToCsv(WORKSPACES, columns);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'nimbus-workspaces.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarGroup title='Workspace'>
        <SidebarItem active>Overview</SidebarItem>
        <SidebarItem>Events</SidebarItem>
        <SidebarItem>Funnels</SidebarItem>
        <SidebarItem>Alerts</SidebarItem>
      </SidebarGroup>
      <SidebarGroup title='Account'>
        <SidebarItem>Billing</SidebarItem>
        <SidebarItem>Members</SidebarItem>
        <SidebarItem>Settings</SidebarItem>
      </SidebarGroup>
    </Sidebar>
  );
}

export default function DashboardBlock() {
  // Density switcher: one control feeds the Segmented and the DataTable
  // \`size\` prop (the ControlOrValue idiom — Segmented speaks plain strings).
  const [density, setDensity, densityCtrl] = useControl(undefined, 'md');

  return (
    <div
      data-slot='dashboard-block'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <AppShell
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--haze-space-3)',
              padding: '0 var(--haze-space-3)',
            }}
          >
            <strong style={{ color: 'var(--haze-color-primary)' }}>Nimbus Console</strong>
            <span style={{ flex: 1 }} />
            <Select size='sm' defaultValue='acme' aria-label='Workspace'>
              <Option value='acme'>acme-robotics</Option>
              <Option value='lumen'>lumen-studio</Option>
              <Option value='ferrite'>ferrite-labs</Option>
            </Select>
            <Badge color='info'>ND</Badge>
          </div>
        }
        sidebar={<DashboardSidebar />}
      >
        <div
          data-slot='dashboard-content'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-4)',
            padding: 'var(--haze-space-4)',
          }}
        >
          <Breadcrumb>
            <BreadcrumbItem href='#dashboard'>Nimbus</BreadcrumbItem>
            <BreadcrumbItem href='#dashboard'>Analytics</BreadcrumbItem>
            <BreadcrumbItem>Overview</BreadcrumbItem>
          </Breadcrumb>

          <StatGroup data-slot='dashboard-stats'>
            <Stat title='MRR' value='$12,610' trend='up' trendValue='+12.4%' description='vs last month' />
            <Stat title='Active workspaces' value='1,284' trend='up' trendValue='+38' description='rolling 30 days' />
            <Stat title='Avg. session' value='7m 32s' trend='down' trendValue='-3.1%' description='all plans' />
            <Stat title='Churn' value='2.1%' trend='neutral' description='target under 3%' />
          </StatGroup>

          <DataTable
            columns={columns}
            data={WORKSPACES}
            getRowId={(row) => row.id}
            size={density as 'sm' | 'md' | 'lg'}
            pageSize={6}
            columnToggle
            toolbar={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
                <Segmented
                  size='sm'
                  options={[
                    { value: 'sm', label: 'S' },
                    { value: 'md', label: 'M' },
                    { value: 'lg', label: 'L' },
                  ]}
                  value={densityCtrl}
                  onChange={setDensity}
                  aria-label='Table density'
                />
                <Button size='sm' variant='outline' onClick={exportCsv}>
                  Export CSV
                </Button>
              </div>
            }
          />
        </div>
      </AppShell>
    </div>
  );
}
`,"./blocks/DataTableBlock.tsx":`import type { RowSelectionState } from '@tanstack/react-table';
import type { DataTableColumnDef } from '@/lib';

import { useMemo } from 'react';
import { useControl } from 'react-use-control';

import {
  Avatar,
  Badge,
  Button,
  DataTable,
  dataTableAvg,
  dataTableSum,
  dataTableToCsv,
  Option,
  Progress,
  Segmented,
  Select,
} from '@/lib';

/*
 * Data-table block: the TanStack-backed DataTable carrying a full admin
 * page — sortable headers, per-column filter row, pagination, resizable
 * columns, a toolbar strip (density, column visibility, CSV export), and
 * checkbox batch selection driving a bulk-action bar. Region/status
 * filtering is parent-driven (the top filter strip narrows \`data\` before
 * the table sees it), while the text filters use the table's own
 * \`filterable\` row — both idioms in one screen.
 */

type InstanceStatus = 'healthy' | 'degraded' | 'rebooting' | 'stopped';
type Region = 'us-east-1' | 'us-west-2' | 'eu-central-1' | 'ap-southeast-1';

type InstanceRow = {
  id: string;
  name: string;
  region: Region;
  status: InstanceStatus;
  vcpus: number;
  memoryGb: number;
  cost: number;
  uptime: number;
  owner: string;
};

const INSTANCES: InstanceRow[] = [
  { id: 'i-0a11', name: 'gateway-edge-1', region: 'us-east-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 214, uptime: 99.98, owner: 'Ana Petrova' },
  { id: 'i-0a12', name: 'gateway-edge-2', region: 'us-west-2', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 218, uptime: 99.91, owner: 'Ana Petrova' },
  { id: 'i-0b21', name: 'ingest-primary', region: 'us-east-1', status: 'degraded', vcpus: 16, memoryGb: 64, cost: 486, uptime: 97.42, owner: 'Ben Okafor' },
  { id: 'i-0b22', name: 'ingest-replica', region: 'us-east-1', status: 'healthy', vcpus: 16, memoryGb: 64, cost: 486, uptime: 99.95, owner: 'Ben Okafor' },
  { id: 'i-0c31', name: 'vector-index-a', region: 'eu-central-1', status: 'healthy', vcpus: 32, memoryGb: 128, cost: 1042, uptime: 99.99, owner: 'Chen Wei' },
  { id: 'i-0c32', name: 'vector-index-b', region: 'eu-central-1', status: 'rebooting', vcpus: 32, memoryGb: 128, cost: 1042, uptime: 98.7, owner: 'Chen Wei' },
  { id: 'i-0d41', name: 'cache-redis-1', region: 'us-west-2', status: 'healthy', vcpus: 4, memoryGb: 16, cost: 96, uptime: 99.99, owner: 'Dana Silva' },
  { id: 'i-0d42', name: 'cache-redis-2', region: 'ap-southeast-1', status: 'healthy', vcpus: 4, memoryGb: 16, cost: 102, uptime: 99.87, owner: 'Dana Silva' },
  { id: 'i-0e51', name: 'worker-batch-1', region: 'us-east-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 178, uptime: 99.62, owner: 'Ben Okafor' },
  { id: 'i-0e52', name: 'worker-batch-2', region: 'us-east-1', status: 'stopped', vcpus: 8, memoryGb: 32, cost: 0, uptime: 91.15, owner: 'Ben Okafor' },
  { id: 'i-0f61', name: 'worker-batch-3', region: 'eu-central-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 181, uptime: 99.44, owner: 'Chen Wei' },
  { id: 'i-0f71', name: 'search-api-1', region: 'ap-southeast-1', status: 'healthy', vcpus: 12, memoryGb: 48, cost: 305, uptime: 99.93, owner: 'Dana Silva' },
  { id: 'i-0f72', name: 'search-api-2', region: 'ap-southeast-1', status: 'degraded', vcpus: 12, memoryGb: 48, cost: 305, uptime: 96.08, owner: 'Dana Silva' },
  { id: 'i-0g81', name: 'ci-runner-x1', region: 'us-west-2', status: 'healthy', vcpus: 64, memoryGb: 256, cost: 1688, uptime: 99.71, owner: 'Ana Petrova' },
  { id: 'i-0g82', name: 'ci-runner-x2', region: 'us-west-2', status: 'rebooting', vcpus: 64, memoryGb: 256, cost: 1688, uptime: 98.31, owner: 'Ana Petrova' },
  { id: 'i-0h91', name: 'metrics-store', region: 'eu-central-1', status: 'healthy', vcpus: 24, memoryGb: 96, cost: 742, uptime: 99.96, owner: 'Chen Wei' },
  { id: 'i-0h92', name: 'metrics-rollup', region: 'us-east-1', status: 'healthy', vcpus: 6, memoryGb: 24, cost: 133, uptime: 99.88, owner: 'Chen Wei' },
  { id: 'i-0i01', name: 'staging-db', region: 'us-east-1', status: 'stopped', vcpus: 16, memoryGb: 64, cost: 0, uptime: 88.04, owner: 'Dana Silva' },
];

const REGIONS: Region[] = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'];
const STATUSES: InstanceStatus[] = ['healthy', 'degraded', 'rebooting', 'stopped'];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);

const statusBadge = (status: InstanceStatus) => {
  const color =
    status === 'healthy'
      ? 'success'
      : status === 'degraded'
        ? 'warning'
        : status === 'rebooting'
          ? 'info'
          : 'default';
  return <Badge color={color}>{status}</Badge>;
};

const uptimeCell = (value: number) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--haze-space-2)',
      minWidth: '120px',
    }}
  >
    <Progress value={value} size='sm' />
    <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-secondary)' }}>
      {value.toFixed(2)}%
    </span>
  </div>
);

const columns: DataTableColumnDef<InstanceRow>[] = [
  {
    accessorKey: 'name',
    header: 'Instance',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
    meta: { width: 160 },
  },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as InstanceStatus),
    meta: { width: 120 },
  },
  { accessorKey: 'vcpus', header: 'vCPU', meta: { width: 80 } },
  { accessorKey: 'memoryGb', header: 'Memory (GB)', meta: { width: 120 } },
  {
    accessorKey: 'cost',
    header: 'Cost / mo',
    cell: (info) => \`$\${(info.getValue() as number).toLocaleString('en-US')}\`,
    meta: { width: 100 },
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime (30d)',
    cell: (info) => uptimeCell(info.getValue() as number),
    meta: { width: 180 },
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: (info) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
        <Avatar size='sm' fallback={initials(info.getValue() as string)} />
        <span>{info.getValue() as string}</span>
      </span>
    ),
    meta: { excludeFromExport: true, width: 160 },
  },
];

/** Serialize rows through the table's own csv helper and download them
 * (dashboard-block pattern). */
function downloadCsv(rows: InstanceRow[], file: string): void {
  const csv = dataTableToCsv(rows, columns);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--haze-space-2)',
  flexWrap: 'wrap',
} as const;

export default function DataTableBlock() {
  // One Control per user-facing state: the two filter strips, the density
  // switcher and the row-selection map.
  const [region, setRegion, regionCtrl] = useControl(undefined, 'all');
  const [status, setStatus, statusCtrl] = useControl(undefined, 'all');
  const [density, setDensity, densityCtrl] = useControl(undefined, 'md');
  const [rowSelection, setRowSelection] = useControl(undefined, {} as RowSelectionState);

  // Parent-driven filtering: the strip narrows \`data\` before the table
  // sees it; the table's own filter row handles per-column text.
  const rows = useMemo(
    () =>
      INSTANCES.filter(
        (row) =>
          (region === 'all' || row.region === region) &&
          (status === 'all' || row.status === status)
      ),
    [region, status]
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const selectedRows = useMemo(
    () => rows.filter((row) => rowSelection[row.id] === true),
    [rows, rowSelection]
  );

  return (
    <div
      data-slot='data-table-block'
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--haze-space-3)',
        padding: 'var(--haze-space-4)',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
        background: 'var(--haze-color-bg)',
      }}
    >
      <header
        data-slot='data-table-header'
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-3)', flexWrap: 'wrap' }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--haze-text-lg)', fontWeight: 'var(--haze-weight-semibold)' }}>
            Compute fleet
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {rows.length} of {INSTANCES.length} instances · sort, filter, resize, select and export
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <div style={barStyle}>
          <Select
            size='sm'
            value={regionCtrl}
            onValuesChange={(next) => setRegion(typeof next === 'string' ? next : 'all')}
            aria-label='Filter by region'
          >
            <Option value='all'>All regions</Option>
            {REGIONS.map((r) => (
              <Option key={r} value={r}>
                {r}
              </Option>
            ))}
          </Select>
          <Select
            size='sm'
            value={statusCtrl}
            onValuesChange={(next) => setStatus(typeof next === 'string' ? next : 'all')}
            aria-label='Filter by status'
          >
            <Option value='all'>All statuses</Option>
            {STATUSES.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <Button
            size='sm'
            variant='outline'
            onClick={() => downloadCsv(rows, 'nimbus-fleet.csv')}
          >
            Export CSV
          </Button>
        </div>
      </header>

      {selectedCount > 0 && (
        <div data-slot='data-table-bulk-bar' style={barStyle}>
          <Badge color='info'>{selectedCount} selected</Badge>
          <Button
            size='sm'
            variant='outline'
            onClick={() => downloadCsv(selectedRows, 'nimbus-fleet-selection.csv')}
          >
            Export selection
          </Button>
          <Button size='sm' variant='ghost' onClick={() => setRowSelection({})}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortable
        selectable
        rowSelection={rowSelection}
        filterable
        resizable
        pageSize={8}
        columnToggle
        size={density as 'sm' | 'md' | 'lg'}
        summary={(summaryRows) => [
          {
            label: 'Filtered totals',
            cells: [
              \`\${summaryRows.length} instances\`,
              '',
              '',
              dataTableSum(summaryRows, 'vcpus'),
              \`\${dataTableSum(summaryRows, 'memoryGb')} GB\`,
              \`$\${dataTableSum(summaryRows, 'cost').toLocaleString('en-US')}\`,
              \`\${(dataTableAvg(summaryRows, 'uptime') ?? 0).toFixed(2)}% avg\`,
              '',
            ],
          },
        ]}
        toolbar={
          <Segmented
            size='sm'
            options={[
              { value: 'sm', label: 'S' },
              { value: 'md', label: 'M' },
              { value: 'lg', label: 'L' },
            ]}
            value={densityCtrl}
            onChange={setDensity}
            aria-label='Table density'
          />
        }
      />
    </div>
  );
}
`,"./blocks/KanbanBlock.tsx":`import { useMemo, useState } from 'react';
import { useControl } from 'react-use-control';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Chip,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  Input,
  Progress,
  Select,
  Option,
  Tooltip,
  VisuallyHidden,
} from '@/lib';

/*
 * Kanban block: a sprint board — four columns of issue cards with priority
 * badges, assignee avatars, labels and progress bars.
 *
 * Drag-and-drop was deliberately left out: haze-ui ships dnd only inside
 * single-container wrappers (SortableTagGroup / SortableTabList /
 * SortableTree), none of which compose into cross-column card dragging, and
 * views never import @dnd-kit directly — a raw DndContext here would break
 * the "blocks are pure haze-ui compositions" premise the page (and its
 * StackBlitz css-family mechanism) is built on. Card movement is real state
 * instead: every card's ⋯ menu moves it between columns, and the source
 * stays honest about what the library gives you.
 */

type ColumnId = 'backlog' | 'progress' | 'review' | 'done';
type Priority = 'P0' | 'P1' | 'P2';

type Issue = {
  id: string;
  title: string;
  column: ColumnId;
  priority: Priority;
  labels: string[];
  assignees: string[];
  points: number;
  progress: number;
};

const COLUMNS: { id: ColumnId; name: string; hint: string; color: string }[] = [
  { id: 'backlog', name: 'Backlog', hint: 'groomed next sprint', color: 'var(--haze-color-text-muted)' },
  { id: 'progress', name: 'In progress', hint: 'WIP limit 4', color: 'var(--haze-color-primary)' },
  { id: 'review', name: 'Review', hint: 'needs a reviewer', color: 'var(--haze-color-warning)' },
  { id: 'done', name: 'Done', hint: 'this sprint', color: 'var(--haze-color-success)' },
];

const INITIAL_ISSUES: Issue[] = [
  { id: 'NB-412', title: 'Idempotency-Key on webhook retries', column: 'progress', priority: 'P0', labels: ['gateway', 'reliability'], assignees: ['Ana Petrova', 'Ben Okafor'], points: 5, progress: 60 },
  { id: 'NB-415', title: 'Batched payload fallback after 2 failures', column: 'progress', priority: 'P1', labels: ['gateway'], assignees: ['Ben Okafor'], points: 3, progress: 25 },
  { id: 'NB-401', title: 'Freeze clock fixture in checkout e2e', column: 'review', priority: 'P1', labels: ['flaky', 'e2e'], assignees: ['Dana Silva', 'Chen Wei', 'Ana Petrova'], points: 2, progress: 90 },
  { id: 'NB-408', title: 'Trim ingest payload snapshot to 1 MB', column: 'review', priority: 'P2', labels: ['ingest'], assignees: ['Chen Wei'], points: 1, progress: 100 },
  { id: 'NB-419', title: 'Alert on webhook error-rate cliff', column: 'backlog', priority: 'P1', labels: ['observability'], assignees: ['Dana Silva'], points: 3, progress: 0 },
  { id: 'NB-421', title: 'Runbook: collector rollbacks', column: 'backlog', priority: 'P2', labels: ['docs'], assignees: [], points: 2, progress: 0 },
  { id: 'NB-422', title: 'Rotate CI secrets quarterly', column: 'backlog', priority: 'P0', labels: ['security', 'infra'], assignees: ['Ana Petrova'], points: 1, progress: 0 },
  { id: 'NB-418', title: 'Dashboard: 30d uptime column', column: 'backlog', priority: 'P2', labels: ['console'], assignees: ['Chen Wei', 'Dana Silva'], points: 2, progress: 0 },
  { id: 'NB-396', title: 'v2.3 migration notes', column: 'done', priority: 'P1', labels: ['docs'], assignees: ['Ben Okafor'], points: 2, progress: 100 },
  { id: 'NB-399', title: 'Backoff cap 2s → 8s', column: 'done', priority: 'P0', labels: ['gateway'], assignees: ['Ana Petrova', 'Chen Wei'], points: 3, progress: 100 },
  { id: 'NB-403', title: 'Retry jitter across collectors', column: 'done', priority: 'P1', labels: ['gateway', 'reliability'], assignees: ['Ben Okafor'], points: 2, progress: 100 },
];

const NEXT_POOL: Omit<Issue, 'id' | 'column'>[] = [
  { title: 'Spike: QUIC for collector transport', priority: 'P2', labels: ['spike'], assignees: [], points: 1, progress: 0 },
  { title: 'Reduce cold-start of ingest workers', priority: 'P1', labels: ['ingest', 'perf'], assignees: ['Chen Wei'], points: 3, progress: 0 },
  { title: 'Audit PII in payload snapshots', priority: 'P0', labels: ['security'], assignees: ['Dana Silva', 'Ana Petrova'], points: 2, progress: 0 },
  { title: 'Changelog page for v2.4', priority: 'P2', labels: ['docs'], assignees: [], points: 1, progress: 0 },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);

const priorityBadge = (priority: Priority) => (
  <Badge
    color={priority === 'P0' ? 'danger' : priority === 'P1' ? 'warning' : 'default'}
  >
    {priority}
  </Badge>
);

function IssueMenu({ issue, onMove, onDelete }: {
  issue: Issue;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <VisuallyHidden>Actions for {issue.id}</VisuallyHidden>
        <MoreHorizontal size={14} aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {COLUMNS.filter((column) => column.id !== issue.column).map((column) => (
          <DropdownMenuItem key={column.id} onClick={() => onMove(issue.id, column.id)}>
            Move to {column.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onClick={() => onDelete(issue.id)}>
          Delete issue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IssueCard({ issue, onMove, onDelete }: {
  issue: Issue;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      data-slot='kanban-card'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--haze-space-2)',
        padding: 'var(--haze-space-3)',
        border: '1px solid var(--haze-color-border)',
        borderRadius: 'var(--haze-radius-md)',
        background: 'var(--haze-color-bg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--haze-space-2)' }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 'var(--haze-weight-medium)',
            lineHeight: 'var(--haze-leading-snug)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--haze-font-mono)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
              display: 'block',
            }}
          >
            {issue.id}
          </span>
          {issue.title}
        </div>
        <IssueMenu issue={issue} onMove={onMove} onDelete={onDelete} />
      </div>

      {issue.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--haze-space-1)', flexWrap: 'wrap' }}>
          {issue.labels.map((label) => (
            <Chip key={label} variant='outline'>
              {label}
            </Chip>
          ))}
        </div>
      )}

      {issue.progress > 0 && <Progress value={issue.progress} size='sm' color='success' />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
        {issue.assignees.length > 0 ? (
          issue.assignees.length > 1 ? (
            <AvatarGroup max={2} total={issue.assignees.length}>
              {issue.assignees.map((name) => (
                <Tooltip key={name} content={name}>
                  <Avatar size='sm' fallback={initials(name)} />
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <Avatar size='sm' fallback={initials(issue.assignees[0]!)} />
          )
        ) : (
          <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
            unassigned
          </span>
        )}
        <span style={{ flex: 1 }} />
        <Tooltip content='Story points'>
          <span
            style={{
              fontFamily: 'var(--haze-font-mono)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {issue.points} pt
          </span>
        </Tooltip>
        {priorityBadge(issue.priority)}
      </div>
    </article>
  );
}

export default function KanbanBlock() {
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [nextIndex, setNextIndex] = useState(0);
  // User-facing filter state as Controls: priority + title search.
  const [priority, setPriority, priorityCtrl] = useControl(undefined, 'all');
  const [search, setSearch, searchCtrl] = useControl(undefined, '');

  const visible = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (priority === 'all' || issue.priority === priority) &&
          (search.trim() === '' ||
            \`\${issue.id} \${issue.title}\`.toLowerCase().includes(search.trim().toLowerCase()))
      ),
    [issues, priority, search]
  );

  const byColumn = (column: ColumnId) => visible.filter((issue) => issue.column === column);

  const moveIssue = (id: string, column: ColumnId) => {
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, column } : issue)));
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  };

  const addIssue = () => {
    // Cycled pool keeps "New issue" infinitely demoable without a form;
    // ids stay unique per click via the counter.
    const seed = NEXT_POOL[nextIndex % NEXT_POOL.length]!;
    const id = \`NB-\${430 + nextIndex}\`;
    setNextIndex((prev) => prev + 1);
    setIssues((prev) => [
      { ...seed, id, column: 'backlog' },
      ...prev,
    ]);
  };

  return (
    <div
      data-slot='kanban-block'
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
        background: 'var(--haze-color-bg-subtle)',
      }}
    >
      <header
        data-slot='kanban-header'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--haze-space-2)',
          flexWrap: 'wrap',
          padding: 'var(--haze-space-3) var(--haze-space-4)',
          borderBottom: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--haze-text-lg)', fontWeight: 'var(--haze-weight-semibold)' }}>
            Nimbus · sprint 42 board
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {visible.length} issues · move cards from the ⋯ menu
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <Input
          size='sm'
          value={searchCtrl}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search issues…'
          aria-label='Search issues'
          style={{ width: '180px' }}
        />
        <Select
          size='sm'
          value={priorityCtrl}
          onValuesChange={(next) => setPriority(typeof next === 'string' ? next : 'all')}
          aria-label='Filter by priority'
        >
          <Option value='all'>All priorities</Option>
          <Option value='P0'>P0</Option>
          <Option value='P1'>P1</Option>
          <Option value='P2'>P2</Option>
        </Select>
        <Button size='sm' onClick={addIssue}>
          <Plus size={14} aria-hidden='true' />
          New issue
        </Button>
      </header>

      <div
        data-slot='kanban-columns'
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: 'var(--haze-space-3)',
          padding: 'var(--haze-space-3) var(--haze-space-4)',
          overflowX: 'auto',
        }}
      >
        {COLUMNS.map((column) => {
          const columnIssues = byColumn(column.id);
          return (
            <section
              key={column.id}
              data-slot='kanban-column'
              aria-label={\`\${column.name} — \${columnIssues.length} issues\`}
              style={{
                flex: '1 1 260px',
                minWidth: '240px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                border: '1px solid var(--haze-color-border)',
                borderRadius: 'var(--haze-radius-lg)',
                background: 'var(--haze-color-bg)',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--haze-space-2)',
                  padding: 'var(--haze-space-2) var(--haze-space-3)',
                  borderBottom: '1px solid var(--haze-color-border)',
                }}
              >
                <span
                  aria-hidden='true'
                  style={{
                    width: 'var(--haze-space-2)',
                    height: 'var(--haze-space-2)',
                    borderRadius: 'var(--haze-radius-full)',
                    background: column.color,
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: 'var(--haze-text-sm)' }}>{column.name}</strong>
                <Badge>{columnIssues.length}</Badge>
                <span style={{ flex: 1 }} />
                <span
                  style={{
                    fontSize: 'var(--haze-text-xs)',
                    color: 'var(--haze-color-text-muted)',
                  }}
                >
                  {column.hint}
                </span>
              </header>
              <div
                data-slot='kanban-column-cards'
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--haze-space-2)',
                  padding: 'var(--haze-space-3)',
                }}
              >
                {columnIssues.length === 0 ? (
                  <Empty description={\`Nothing in \${column.name.toLowerCase()}\`} />
                ) : (
                  columnIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onMove={moveIssue}
                      onDelete={deleteIssue}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--haze-space-2)',
          padding: 'var(--haze-space-2) var(--haze-space-4)',
          borderTop: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        <Search size={12} aria-hidden='true' />
        Static board by design — haze-ui ships single-container sorting
        (SortableTagGroup / SortableTabList / SortableTree), not cross-column drag.
      </footer>
    </div>
  );
}
`,"./blocks/LoginBlock.tsx":`import { z } from 'zod';
import { useControl } from 'react-use-control';

import {
  Alert,
  Button,
  Card,
  CheckboxCore,
  Form,
  FormItem,
  InputCore,
  PasswordInputCore,
  useForm,
  standardSchemaFormValidator,
} from '@/lib';

/*
 * Login block: a brand side panel plus a centered Card holding a complete
 * form loop — useForm + Form + FormItem over InputCore / PasswordInputCore
 * / CheckboxCore, validated by one zod schema through
 * standardSchemaFormValidator (errors land per FormItem, no per-field
 * validate needed). All layout glue is inline styles over --haze-* tokens
 * so the block re-themes for free.
 */

type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean(),
});

const loginValidator = standardSchemaFormValidator<LoginValues>(loginSchema);

function LoginForm() {
  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '', remember: true },
    validate: loginValidator,
    validateDeps: ['email', 'password'],
  });
  // Signed-in confirmation banner — demo-local display state.
  const [signedIn, setSignedIn] = useControl(undefined, false);

  return (
    <Form form={form} onValidSubmit={() => setSignedIn(true)}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-4)',
        }}
      >
        {signedIn && (
          <Alert color='success'>Signed in — the schema passed for this workspace.</Alert>
        )}
        <FormItem
          form={form}
          name='email'
          label='Work email'
          rules={{ required: true }}
          input={InputCore}
          type='email'
          placeholder='you@company.com'
        />
        <FormItem
          form={form}
          name='password'
          label='Password'
          rules={{ required: true }}
          input={PasswordInputCore}
          placeholder='At least 8 characters'
        />
        <FormItem
          form={form}
          name='remember'
          label='Keep me signed in on this device'
          input={CheckboxCore}
          valueToProps={(checked) => ({ checked: !!checked })}
        />
        {/* Button's native \`type\` is pinned to 'button' — submit through the
            owning form so react-f0rm's validation chain runs first. */}
        <Button
          style={{ width: '100%' }}
          onClick={(e) => {
            e.currentTarget.form?.requestSubmit();
          }}
        >
          Sign in
        </Button>
      </div>
    </Form>
  );
}

export default function LoginBlock() {
  return (
    <div
      data-slot='login-block'
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '420px',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      {/* Brand panel — token-only surface so it flips with the theme. */}
      <div
        data-slot='login-brand'
        style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--haze-space-8)',
          background: 'var(--haze-color-bg-subtle)',
          borderInlineEnd: '1px solid var(--haze-color-border)',
        }}
      >
        <strong style={{ color: 'var(--haze-color-primary)', fontSize: 'var(--haze-text-xl)' }}>
          Nimbus
        </strong>
        <div>
          <h2
            style={{
              margin: '0 0 var(--haze-space-2)',
              fontSize: 'var(--haze-text-2xl)',
              lineHeight: 'var(--haze-leading-tight)',
              color: 'var(--haze-color-text)',
            }}
          >
            Analytics your whole team actually reads.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            1,284 workspaces ship with Nimbus — from first event to board deck.
          </p>
        </div>
        <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
          SOC 2 Type II · GDPR · 99.98% uptime
        </span>
      </div>

      {/* Form panel — the Card centers the fields in the remaining width. */}
      <div
        data-slot='login-panel'
        style={{
          flex: '1 1 45%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--haze-space-6)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div style={{ width: 'min(360px, 100%)' }}>
          <Card variant='outlined'>
            <h2 style={{ margin: '0 0 var(--haze-space-1)', fontSize: 'var(--haze-text-lg)' }}>
              Welcome back
            </h2>
            <p
              style={{
                margin: '0 0 var(--haze-space-4)',
                fontSize: 'var(--haze-text-sm)',
                color: 'var(--haze-color-text-secondary)',
              }}
            >
              Sign in to your Nimbus workspace.
            </p>
            <LoginForm />
            <p
              style={{
                margin: 'var(--haze-space-3) 0 0',
                fontSize: 'var(--haze-text-xs)',
                color: 'var(--haze-color-text-muted)',
              }}
            >
              New to Nimbus? <a href='#login'>Create a workspace</a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
`,"./blocks/SettingsBlock.tsx":`import type { ReactNode } from 'react';

import { useControl } from 'react-use-control';

import {
  Button,
  Card,
  Combobox,
  Option,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tabs,
} from '@/lib';

/*
 * Settings block: one data-driven <Tabs variant='card' items={…}> hosting
 * three preference sections (Notifications / Appearance / Security). Every
 * control is a live ControlOrValue — Switches, the theme RadioGroup, the
 * timezone Select and the alert-routes Combobox all run through
 * useControl so a host app can own any piece of this state.
 */

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--haze-space-4)',
        padding: 'var(--haze-space-3) 0',
        borderBottom: '1px solid var(--haze-color-border)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text)' }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--haze-text-xs)',
            color: 'var(--haze-color-text-muted)',
          }}
        >
          {description}
        </div>
      </div>
      {children}
    </div>
  );
}

function NotificationsPanel() {
  const [productNews, , productNewsCtrl] = useControl(undefined, true);
  const [, , weeklyDigestCtrl] = useControl(undefined, true);
  const [, , anomalyAlertsCtrl] = useControl(undefined, false);

  return (
    <div data-slot='settings-notifications'>
      <SettingRow title='Product updates' description='New features and changelog highlights.'>
        <Switch checked={productNewsCtrl} aria-label='Product updates' />
      </SettingRow>
      <SettingRow title='Weekly digest' description='A Monday summary of workspace activity.'>
        <Switch checked={weeklyDigestCtrl} aria-label='Weekly digest' />
      </SettingRow>
      <SettingRow title='Anomaly alerts' description='Email me when a metric breaks its band.'>
        <Switch checked={anomalyAlertsCtrl} aria-label='Anomaly alerts' />
      </SettingRow>
      <p
        style={{
          margin: 'var(--haze-space-3) 0 0',
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        {productNews ? 'Product updates are on.' : 'Product updates are off.'}
      </p>
    </div>
  );
}

function AppearancePanel() {
  const [theme, , themeCtrl] = useControl(undefined, 'system');
  const [, , densityCtrl] = useControl(undefined, 'comfortable');

  return (
    <div data-slot='settings-appearance'>
      <SettingRow title='Theme' description='Follow the system, or pin light / dark.'>
        <RadioGroup value={themeCtrl} name='settings-theme'>
          <Radio value='system'>System</Radio>
          <Radio value='light'>Light</Radio>
          <Radio value='dark'>Dark</Radio>
        </RadioGroup>
      </SettingRow>
      <SettingRow title='Density' description='Comfortable spacing or the compact scale.'>
        <Select value={densityCtrl} size='sm' aria-label='Density'>
          <Option value='comfortable'>Comfortable</Option>
          <Option value='compact'>Compact</Option>
        </Select>
      </SettingRow>
      <p
        style={{
          margin: 'var(--haze-space-3) 0 0',
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        Theme: {theme}
      </p>
    </div>
  );
}

function SecurityPanel() {
  const [, , twoFactorCtrl] = useControl(undefined, true);
  const [routes, , routesCtrl] = useControl(undefined, ['email'] as string[]);

  return (
    <div data-slot='settings-security'>
      <SettingRow title='Two-factor authentication' description='Require a TOTP code at sign-in.'>
        <Switch checked={twoFactorCtrl} aria-label='Two-factor authentication' />
      </SettingRow>
      <SettingRow title='Alert routes' description='Where security notices are delivered.'>
        <div style={{ minWidth: '240px' }}>
          <Combobox
            multiple
            value={routesCtrl}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'slack', label: 'Slack' },
              { value: 'pagerduty', label: 'PagerDuty' },
            ]}
            placeholder='Add a route…'
          />
        </div>
      </SettingRow>
      <p
        style={{
          margin: 'var(--haze-space-3) 0 0',
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        Active routes: {routes.join(', ')}
      </p>
    </div>
  );
}

export default function SettingsBlock() {
  const [, , activeCtrl] = useControl(undefined, 'notifications');

  return (
    <div
      data-slot='settings-block'
      style={{
        padding: 'var(--haze-space-5)',
        background: 'var(--haze-color-bg)',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      <h2 style={{ margin: '0 0 var(--haze-space-1)', fontSize: 'var(--haze-text-xl)' }}>
        Workspace settings
      </h2>
      <p
        style={{
          margin: '0 0 var(--haze-space-4)',
          fontSize: 'var(--haze-text-sm)',
          color: 'var(--haze-color-text-secondary)',
        }}
      >
        Preferences apply to everyone in acme-robotics.
      </p>
      <Card variant='outlined'>
        <Tabs
          value={activeCtrl}
          variant='card'
          items={[
            { value: 'notifications', label: 'Notifications', panel: <NotificationsPanel /> },
            { value: 'appearance', label: 'Appearance', panel: <AppearancePanel /> },
            { value: 'security', label: 'Security', panel: <SecurityPanel /> },
          ]}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--haze-space-2)',
            marginTop: 'var(--haze-space-4)',
          }}
        >
          <Button variant='ghost'>Discard</Button>
          <Button>Save changes</Button>
        </div>
      </Card>
    </div>
  );
}
`})).map(([e,t])=>{let n=e.slice(9);return[n,{fileName:n,source:t}]}));function Tn(e){let t=`${e.split(`-`).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(``)}Block.tsx`;return wn.get(t)}var En=[{id:`dashboard`,Component:Xt,overflow:`hidden`,cssFamilies:[`app-shell`,`sidebar`,`tooltip`,`stat`,`data-table`,`checkbox`,`dropdown-menu`,`empty`,`input`,`pagination`,`skeleton`,`table`,`virtual-list`,`breadcrumb`,`button`,`badge`,`segmented`,`select`,`chip`,`spinner`,`visually-hidden`]},{id:`login`,Component:yn,overflow:`auto`,cssFamilies:[`card`,`form`,`input`,`password-input`,`checkbox`,`button`,`alert`]},{id:`settings`,Component:Cn,overflow:`auto`,cssFamilies:[`tabs`,`switch`,`radio`,`select`,`combobox`,`chip`,`spinner`,`virtual-list`,`button`,`card`]},{id:`chat`,Component:Mt,overflow:`hidden`,cssFamilies:[`chat-container`,`chat-message`,`streaming-text`,`thinking-indicator`,`tool-call-card`,`chat-input`,`conversation-list`,`avatar`,`badge`,`button`,`empty`,`spinner`]},{id:`crud`,Component:Ut,overflow:`auto`,cssFamilies:[`tree`,`data-table`,`dialog`,`confirm-dialog`,`toast`,`form`,`input`,`select`,`button`,`badge`,`segmented`,`kbd`,`checkbox`,`dropdown-menu`,`empty`,`pagination`,`skeleton`,`spinner`,`table`,`virtual-list`,`visually-hidden`]},{id:`aiWorkbench`,Component:vt,overflow:`hidden`,cssFamilies:[`workbench`,`resizable`,`activity-rail`,`status-bar`,`tab-bar`,`conversation-list`,`chat-container`,`chat-message`,`streaming-text`,`thinking-indicator`,`tool-call-card`,`prompt-input`,`model-picker`,`sources`,`avatar`,`badge`,`button`,`empty`,`spinner`,`tooltip`]},{id:`dataTable`,Component:sn,overflow:`auto`,cssFamilies:[`data-table`,`checkbox`,`dropdown-menu`,`empty`,`input`,`pagination`,`progress`,`segmented`,`select`,`skeleton`,`spinner`,`table`,`virtual-list`,`visually-hidden`,`avatar`,`badge`,`button`,`chip`]},{id:`kanban`,Component:hn,overflow:`hidden`,cssFamilies:[`avatar`,`avatar-group`,`badge`,`button`,`chip`,`dropdown-menu`,`empty`,`input`,`progress`,`select`,`spinner`,`tooltip`,`virtual-list`,`visually-hidden`]}];async function Dn(e,t){let n=Tn(e.id);if(!n)return;let r=n.fileName.replace(/\.tsx$/,``);try{let{default:i}=await He(async()=>{let{default:e}=await import(`./sdk.m-BbSa6lUJ.js`);return{default:e}},[]);i.openProject(Ne(`blocks-${e.id}`,`import ${r} from './${r}';
export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <${r} />
    </div>
  );
}
`,{files:{[`src/${n.fileName}`]:t},cssFamilies:e.cssFamilies,openFile:`src/${n.fileName}`}),{newWindow:!0})}catch{}}var On=`haze-index__blockSection`,kn=`haze-index__blockDescription`,An=`haze-index__shell`,jn=`haze-index__toolbar`,Mn=`haze-index__toolbarSpacer`,Nn=`haze-index__previewArea`,Pn=`haze-index__sourceHeader`,Fn=`haze-index__sourceTrigger`,In=`haze-index__chevron`,Ln=`haze-index__chevronOpen`,Rn=`haze-index__codeStyle`;function zn({block:e}){let{t}=Be(),[n,,i]=W(!1),{copied:a,copy:o}=me(),s=Tn(e.id),c=(0,q.useMemo)(()=>s?Oe(s.source):null,[s]),{Component:l}=e;return!s||!c?null:(0,J.jsxs)(`div`,{className:An,"data-slot":`block-card`,children:[(0,J.jsxs)(`div`,{className:jn,children:[(0,J.jsxs)(`span`,{style:{fontFamily:`var(--haze-font-mono)`,fontSize:`var(--haze-text-sm)`},children:[`blocks/`,s.fileName]}),(0,J.jsx)(`span`,{className:Mn}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:()=>void Dn(e,s.source),children:`Open in StackBlitz`}),(0,J.jsx)(G,{size:`sm`,variant:`outline`,onClick:()=>void o(s.source),children:a?`Copied`:`Copy`})]}),(0,J.jsx)(`div`,{className:Nn,"data-slot":`block-preview`,style:{overflow:e.overflow},children:(0,J.jsx)(l,{})}),(0,J.jsxs)(_e,{open:i,children:[(0,J.jsx)(`div`,{className:Pn,"data-state":n?`open`:`closed`,children:(0,J.jsxs)(ge,{className:Fn,children:[(0,J.jsx)(`span`,{"aria-hidden":`true`,className:r([In,n&&Ln]),children:`▸`}),(0,J.jsxs)(`span`,{children:[t.blocks[e.id].title,` — source`]})]})}),(0,J.jsx)(he,{children:(0,J.jsx)(`pre`,{className:Rn,children:(0,J.jsx)(`code`,{children:c})})})]})]})}function Bn(){let{t:e}=Be();return(0,J.jsxs)(`div`,{className:Ue,children:[(0,J.jsx)(`h1`,{children:e.blocks.title}),(0,J.jsx)(`p`,{className:We,children:e.blocks.intro}),En.map(t=>(0,J.jsxs)(`section`,{className:On,"data-slot":`block-section`,children:[(0,J.jsx)(`h2`,{children:e.blocks[t.id].title}),(0,J.jsx)(`p`,{className:kn,children:e.blocks[t.id].description}),(0,J.jsx)(zn,{block:t})]},t.id))]})}export{Bn as default};
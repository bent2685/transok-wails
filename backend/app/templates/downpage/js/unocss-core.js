"use strict";(()=>{var G="default",z="preflights",je="shortcuts",ke="imports",ue={[ke]:-200,[z]:-100,[je]:-10,[G]:0};var fe=/[\\:]?[\s'"`;{}]+/g;function _e(n){return n.split(fe)}var W={name:"@unocss/core/extractor-split",order:0,extract({code:n}){return _e(n)}};function U(n=[]){return Array.isArray(n)?n:[n]}function _(n){return Array.from(new Set(n))}function se(n,e){return n.reduce((t,r)=>(t.findIndex(i=>e(r,i))===-1&&t.push(r),t),[])}function P(n){return typeof n=="string"}var H=class extends Set{_map;constructor(e){super(e),this._map??=new Map}add(e){return this._map??=new Map,this._map.set(e,(this._map.get(e)??0)+1),super.add(e)}delete(e){return this._map.delete(e),super.delete(e)}clear(){this._map.clear(),super.clear()}getCount(e){return this._map.get(e)??0}setCount(e,t){return this._map.set(e,t),super.add(e)}};function Y(n){return n instanceof H}function Le(n){let e=n.length,t=-1,r,s="",i=n.charCodeAt(0);for(;++t<e;){if(r=n.charCodeAt(t),r===0){s+="\uFFFD";continue}if(r===37){s+="\\%";continue}if(r===44){s+="\\,";continue}if(r>=1&&r<=31||r===127||t===0&&r>=48&&r<=57||t===1&&r>=48&&r<=57&&i===45){s+=`\\${r.toString(16)} `;continue}if(t===0&&e===1&&r===45){s+=`\\${n.charAt(t)}`;continue}if(r>=128||r===45||r===95||r>=48&&r<=57||r>=65&&r<=90||r>=97&&r<=122){s+=n.charAt(t);continue}s+=`\\${n.charAt(t)}`}return s}var q=Le;function pe(){return{events:{},emit(n,...e){(this.events[n]||[]).forEach(t=>t(...e))},on(n,e){return(this.events[n]=this.events[n]||[]).push(e),()=>this.events[n]=(this.events[n]||[]).filter(t=>t!==e)}}}function de(n){return typeof n=="function"?{match:n}:n}function ie(n){return n.length===3}function Z(n){return n!=null}function me(){}var J=class{_map=new Map;get(e,t){let r=this._map.get(e);if(r)return r.get(t)}getFallback(e,t,r){let s=this._map.get(e);return s||(s=new Map,this._map.set(e,s)),s.has(t)||s.set(t,r),s.get(t)}set(e,t,r){let s=this._map.get(e);return s||(s=new Map,this._map.set(e,s)),s.set(t,r),this}has(e,t){return this._map.get(e)?.has(t)}delete(e,t){return this._map.get(e)?.delete(t)||!1}deleteTop(e){return this._map.delete(e)}map(e){return Array.from(this._map.entries()).flatMap(([t,r])=>Array.from(r.entries()).map(([s,i])=>e(i,t,s)))}},Q=class extends Map{getFallback(e,t){let r=this.get(e);return r===void 0?(this.set(e,t),t):r}map(e){let t=[];return this.forEach((r,s)=>{t.push(e(r,s))}),t}flatMap(e){let t=[];return this.forEach((r,s)=>{t.push(...e(r,s))}),t}};function K(n){return P(n)?n:(Array.isArray(n)?n:Object.entries(n)).filter(e=>e[1]!=null)}function he(n){return Array.isArray(n)?n.find(e=>!Array.isArray(e)||Array.isArray(e[0]))?n.map(e=>K(e)):[n]:[K(n)]}function De(n){return n.filter(([e,t],r)=>{if(e.startsWith("$$"))return!1;for(let s=r-1;s>=0;s--)if(n[s][0]===e&&n[s][1]===t)return!1;return!0})}function ee(n){return n==null?"":De(n).map(([e,t])=>t!=null&&typeof t!="function"?`${e}:${t};`:void 0).filter(Boolean).join("")}function X(n){return n&&typeof n=="object"&&!Array.isArray(n)}function oe(n,e,t=!1){let r=n,s=e;if(Array.isArray(s))return t&&Array.isArray(s)?[...r,...s]:[...s];let i={...r};return X(r)&&X(s)&&Object.keys(s).forEach(f=>{X(r[f])&&X(s[f])||Array.isArray(r[f])&&Array.isArray(s[f])?i[f]=oe(r[f],s[f],t):Object.assign(i,{[f]:s[f]})}),i}function B(n){let e,t,r;if(Array.isArray(n)){for(t=Array.from({length:e=n.length});e--;)t[e]=(r=n[e])&&typeof r=="object"?B(r):r;return t}if(Object.prototype.toString.call(n)==="[object Object]"){t={};for(e in n)e==="__proto__"?Object.defineProperty(t,e,{value:B(n[e]),configurable:!0,enumerable:!0,writable:!0}):t[e]=(r=n[e])&&typeof r=="object"?B(r):r;return t}return n}function ge(n){return P(n[0])}function ye(n){return P(n[0])}var te={};function Fe(n=["-",":"]){let e=n.join("|");return te[e]||(te[e]=new RegExp(`((?:[!@<~\\w+:_-]|\\[&?>?:?\\S*\\])+?)(${e})\\(((?:[~!<>\\w\\s:/\\\\,%#.$?-]|\\[.*?\\])+?)\\)(?!\\s*?=>)`,"gm")),te[e].lastIndex=0,te[e]}function Ie(n,e=["-",":"],t=5){let r=Fe(e),s,i=n.toString(),f=new Set,d=new Map;do s=!1,i=i.replace(r,(o,a,c,h,g)=>{if(!e.includes(c))return o;s=!0,f.add(a+c);let E=g+a.length+c.length+1,C={length:o.length,items:[]};d.set(g,C);for(let w of[...h.matchAll(/\S+/g)]){let $=E+w.index,S=d.get($)?.items;S?d.delete($):S=[{offset:$,length:w[0].length,className:w[0]}];for(let b of S)b.className=b.className==="~"?a:b.className.replace(/^(!?)(.*)/,`$1${a}${c}$2`),C.items.push(b)}return"$".repeat(o.length)}),t-=1;while(s&&t);let l;if(typeof n=="string"){l="";let o=0;for(let[a,c]of d)l+=n.slice(o,a),l+=c.items.map(h=>h.className).join(" "),o=a+c.length;l+=n.slice(o)}else{l=n;for(let[o,a]of d)l.overwrite(o,o+a.length,a.items.map(c=>c.className).join(" "))}return{prefixes:Array.from(f),hasChanged:s,groupsByOffset:d,get expanded(){return l.toString()}}}function xe(n,e=["-",":"],t=5){let r=Ie(n,e,t);return typeof n=="string"?r.expanded:n}var Se=new Set;function be(n){Se.has(n)||(console.warn("[unocss]",n),Se.add(n))}function Re(n){return U(n).flatMap(e=>Array.isArray(e)?[e]:Object.entries(e))}var Ce="_uno_resolved";async function Ke(n){let e=typeof n=="function"?await n():await n;if(Ce in e)return e;e={...e},Object.defineProperty(e,Ce,{value:!0,enumerable:!1});let t=e.shortcuts?Re(e.shortcuts):void 0;if(e.shortcuts=t,e.prefix||e.layer){let r=s=>{s[2]||(s[2]={});let i=s[2];i.prefix==null&&e.prefix&&(i.prefix=U(e.prefix)),i.layer==null&&e.layer&&(i.layer=e.layer)};t?.forEach(r),e.rules?.forEach(r)}return e}async function Ee(n){let e=await Ke(n);if(!e.presets)return[e];let t=(await Promise.all((e.presets||[]).flatMap(U).flatMap(Ee))).flat();return[e,...t]}function Ge(n){if(n.length===0)return{};let e=[],t=[],r=!1,s=[],i=[],f=[];for(let l of n){if(l.pipeline===!1){r=!0;break}else l.pipeline?.include&&e.push(l.pipeline.include),l.pipeline?.exclude&&t.push(l.pipeline.exclude);l.filesystem&&s.push(l.filesystem),l.inline&&i.push(l.inline),l.plain&&f.push(l.plain)}let d={pipeline:r?!1:{include:_(Te(...e)),exclude:_(Te(...t))}};return s.length&&(d.filesystem=_(s.flat())),i.length&&(d.inline=_(i.flat())),f.length&&(d.plain=_(f.flat())),d}async function ae(n={},e={}){let t=Object.assign({},e,n),r=se((await Promise.all((t.presets||[]).flatMap(U).flatMap(Ee))).flat(),(p,u)=>p.name===u.name),s=[...r.filter(p=>p.enforce==="pre"),...r.filter(p=>!p.enforce),...r.filter(p=>p.enforce==="post")],i=[...s,t],f=[...i].reverse(),d=Object.assign({},ue,...i.map(p=>p.layers));function l(p){return _(i.flatMap(u=>U(u[p]||[])))}let o=l("extractors"),a=f.find(p=>p.extractorDefault!==void 0)?.extractorDefault;a===void 0&&(a=W),a&&!o.includes(a)&&o.unshift(a),o.sort((p,u)=>(p.order||0)-(u.order||0));let c=l("rules"),h={},g=c.length,E=c.filter(p=>ge(p)?(U(p[2]?.prefix||"").forEach(m=>{h[m+p[0]]=p}),!1):!0).reverse(),C=He(i.map(p=>p.theme)),w=l("extendTheme");for(let p of w)C=p(C)||C;let $={templates:_(i.flatMap(p=>U(p.autocomplete?.templates))),extractors:i.flatMap(p=>U(p.autocomplete?.extractors)).sort((p,u)=>(p.order||0)-(u.order||0)),shorthands:Be(i.map(p=>p.autocomplete?.shorthands||{}))},S=l("separators");S.length||(S=[":","-"]);let b=l("content"),V=Ge(b),v={mergeSelectors:!0,warn:!0,sortLayers:p=>p,...t,blocklist:l("blocklist"),presets:s,envMode:t.envMode||"build",shortcutsLayer:t.shortcutsLayer||"shortcuts",layers:d,theme:C,rules:c,rulesSize:g,rulesDynamic:E,rulesStaticMap:h,preprocess:l("preprocess"),postprocess:l("postprocess"),preflights:l("preflights"),autocomplete:$,variants:l("variants").map(de).sort((p,u)=>(p.order||0)-(u.order||0)),shortcuts:Re(l("shortcuts")).reverse(),extractors:o,safelist:l("safelist"),separators:S,details:t.details??t.envMode==="dev",content:V,transformers:se(l("transformers"),(p,u)=>p.name===u.name)};for(let p of i)p?.configResolved?.(v);return v}function He(n){return n.map(e=>e?B(e):{}).reduce((e,t)=>oe(e,t),{})}function Be(n){return n.reduce((e,t)=>{let r={};for(let s in t){let i=t[s];Array.isArray(i)?r[s]=`(${i.join("|")})`:r[s]=i}return{...e,...r}},{})}function Te(...n){return n.flatMap(Ne)}function Ne(n){return Array.isArray(n)?n:n?[n]:[]}var ve="65.4.3";var I={shortcutsNoMerge:"$$symbol-shortcut-no-merge",variants:"$$symbol-variants",parent:"$$symbol-parent",selector:"$$symbol-selector",layer:"$$symbol-layer",sort:"$$symbol-sort"},le=class n{constructor(e={},t={}){this.userConfig=e;this.defaults=t}version=ve;events=pe();config=void 0;cache=new Map;blocked=new Set;parentOrders=new Map;activatedRules=new Set;static async create(e={},t={}){let r=new n(e,t);return r.config=await ae(r.userConfig,r.defaults),r.events.emit("config",r.config),r}async setConfig(e,t){e&&(t&&(this.defaults=t),this.userConfig=e,this.blocked.clear(),this.parentOrders.clear(),this.activatedRules.clear(),this.cache.clear(),this.config=await ae(e,this.defaults),this.events.emit("config",this.config))}async applyExtractors(e,t,r=new Set){let s={original:e,code:e,id:t,extracted:r,envMode:this.config.envMode};for(let i of this.config.extractors){let f=await i.extract?.(s);if(f)if(Y(f)&&Y(r))for(let d of f)r.setCount(d,r.getCount(d)+f.getCount(d));else for(let d of f)r.add(d)}return r}makeContext(e,t){let r={rawSelector:e,currentSelector:t[1],theme:this.config.theme,generator:this,symbols:I,variantHandlers:t[2],constructCSS:(...s)=>this.constructCustomCSS(r,...s),variantMatch:t};return r}async parseToken(e,t){if(this.blocked.has(e))return;let r=`${e}${t?` ${t}`:""}`;if(this.cache.has(r))return this.cache.get(r);let s=e;for(let l of this.config.preprocess)s=l(e);if(this.isBlocked(s)){this.blocked.add(e),this.cache.set(r,null);return}let i=await this.matchVariants(e,s);if(i.every(l=>!l||this.isBlocked(l[1]))){this.blocked.add(e),this.cache.set(r,null);return}let f=async l=>{let o=this.makeContext(e,[t||l[0],l[1],l[2],l[3]]);this.config.details&&(o.variants=[...l[3]]);let a=await this.expandShortcut(o.currentSelector,o);return a?await this.stringifyShortcuts(o.variantMatch,o,a[0],a[1]):(await this.parseUtil(o.variantMatch,o))?.map(h=>this.stringifyUtil(h,o)).filter(Z)},d=(await Promise.all(i.map(l=>f(l)))).flat().filter(l=>!!l);if(d?.length)return this.cache.set(r,d),d;this.cache.set(r,null)}async generate(e,t={}){let{id:r,scope:s,preflights:i=!0,safelist:f=!0,minify:d=!1,extendedInfo:l=!1}=t,o=P(e)?await this.applyExtractors(e,r,l?new H:new Set):Array.isArray(e)?new Set(e):e;if(f){let u={generator:this,theme:this.config.theme};this.config.safelist.flatMap(m=>typeof m=="function"?m(u):m).forEach(m=>{o.has(m)||o.add(m)})}let a=d?"":`
`,c=new Set([G]),h=l?new Map:new Set,g=new Map,E={},C=Array.from(o).map(async u=>{if(h.has(u))return;let m=await this.parseToken(u);if(m!=null){h instanceof Map?h.set(u,{data:m,count:Y(o)?o.getCount(u):-1}):h.add(u);for(let x of m){let j=x[3]||"",k=x[4]?.layer;g.has(j)||g.set(j,[]),g.get(j).push(x),k&&c.add(k)}}});await Promise.all(C),await(async()=>{if(!i)return;let u={generator:this,theme:this.config.theme},m=new Set([]);this.config.preflights.forEach(({layer:x=z})=>{c.add(x),m.add(x)}),E=Object.fromEntries(await Promise.all(Array.from(m).map(async x=>{let k=(await Promise.all(this.config.preflights.filter(L=>(L.layer||z)===x).map(async L=>await L.getCSS(u)))).filter(Boolean).join(a);return[x,k]})))})();let w=this.config.sortLayers(Array.from(c).sort((u,m)=>(this.config.layers[u]??0)-(this.config.layers[m]??0)||u.localeCompare(m))),$={},S=this.config.outputToCssLayers,b=u=>{let m=u;return typeof S=="object"&&(m=S.cssLayerName?.(u)),m===null?null:m??u},V=(u=G)=>{if($[u])return $[u];let m=Array.from(g).sort((k,L)=>(this.parentOrders.get(k[0])??0)-(this.parentOrders.get(L[0])??0)||k[0]?.localeCompare(L[0]||"")||0).map(([k,L])=>{let y=L.length,R=L.filter(T=>(T[4]?.layer||G)===u).sort((T,O)=>T[0]-O[0]||(T[4]?.sort||0)-(O[4]?.sort||0)||T[5]?.currentSelector?.localeCompare(O[5]?.currentSelector??"")||T[1]?.localeCompare(O[1]||"")||T[2]?.localeCompare(O[2]||"")||0).map(([,T,O,,N,,ne])=>[[[(T&&Ye(T,s))??"",N?.sort??0]],O,!!(ne??N?.noMerge)]);if(!R.length)return;let A=R.reverse().map(([T,O,N],ne)=>{if(!N&&this.config.mergeSelectors)for(let F=ne+1;F<y;F++){let D=R[F];if(D&&!D[2]&&(T&&D[0]||T==null&&D[0]==null)&&D[1]===O)return T&&D[0]&&D[0].push(...T),null}let re=T?_(T.sort((F,D)=>F[1]-D[1]||F[0]?.localeCompare(D[0]||"")||0).map(F=>F[0]).filter(Boolean)):[];return re.length?`${re.join(`,${a}`)}{${O}}`:O}).filter(Boolean).reverse().join(a);if(!k)return A;let M=k.split(" $$ ");return`${M.join("{")}{${a}${A}${a}${"}".repeat(M.length)}`}).filter(Boolean).join(a);i&&(m=[E[u],m].filter(Boolean).join(a));let x;S&&m&&(x=b(u),x!==null&&(m=`@layer ${x}{${a}${m}${a}}`));let j=d?"":`/* layer: ${u}${x&&x!==u?`, alias: ${x}`:""} */${a}`;return $[u]=m?j+m:""},v=(u=w,m)=>{let x=u.filter(j=>!m?.includes(j));return[S&&x.length>0?`@layer ${x.map(b).filter(Z).join(", ")};`:void 0,...x.map(j=>V(j)||"")].filter(Boolean).join(a)};return{get css(){return v()},layers:w,matched:h,getLayers:v,getLayer:V,setLayer:async(u,m)=>{let x=await m(V(u));return $[u]=x,x}}}async matchVariants(e,t){let r={rawSelector:e,theme:this.config.theme,generator:this},s=async i=>{let f=!0,[,,d,l]=i;for(;f;){f=!1;let o=i[1];for(let a of this.config.variants){if(!a.multiPass&&l.has(a))continue;let c=await a.match(o,r);if(c){if(P(c)){if(c===o)continue;c={matcher:c}}if(Array.isArray(c)){if(!c.length)continue;if(c.length===1)c=c[0];else{if(a.multiPass)throw new Error("multiPass can not be used together with array return variants");let h=c.map(g=>{let E=g.matcher??o,C=[g,...d],w=new Set(l);return w.add(a),[i[0],E,C,w]});return(await Promise.all(h.map(g=>s(g)))).flat()}}i[1]=c.matcher??o,d.unshift(c),l.add(a),f=!0;break}}if(!f)break;if(d.length>500)throw new Error(`Too many variants applied to "${e}"`)}return[i]};return await s([e,t||e,[],new Set])}applyVariants(e,t=e[4],r=e[1]){let i=t.slice().sort((o,a)=>(o.order||0)-(a.order||0)).reduceRight((o,a)=>c=>{let h=a.body?.(c.entries)||c.entries,g=Array.isArray(a.parent)?a.parent:[a.parent,void 0];return(a.handle??Ze)({...c,entries:h,selector:a.selector?.(c.selector,h)||c.selector,parent:g[0]||c.parent,parentOrder:g[1]||c.parentOrder,layer:a.layer||c.layer,sort:a.sort||c.sort},o)},o=>o)({prefix:"",selector:qe(r),pseudo:"",entries:e[2]}),{parent:f,parentOrder:d}=i;f!=null&&d!=null&&this.parentOrders.set(f,d);let l={selector:[i.prefix,i.selector,i.pseudo].join(""),entries:i.entries,parent:f,layer:i.layer,sort:i.sort,noMerge:i.noMerge};for(let o of this.config.postprocess)o(l);return l}constructCustomCSS(e,t,r){let s=K(t);if(P(s))return s;let{selector:i,entries:f,parent:d}=this.applyVariants([0,r||e.rawSelector,s,void 0,e.variantHandlers]),l=`${i}{${ee(f)}}`;return d?`${d}{${l}}`:l}async parseUtil(e,t,r=!1,s){let i=P(e)?await this.matchVariants(e):[e],f=async([l,o,a])=>{this.config.details&&(t.rules=t.rules??[]);let c=this.config.rulesStaticMap[o];if(c&&c[1]&&(r||!c[2]?.internal)){t.generator.activatedRules.add(c),this.config.details&&t.rules.push(c);let g=this.config.rules.indexOf(c),E=K(c[1]),C=c[2];return P(E)?[[g,E,C]]:[[g,l,E,C,a]]}t.variantHandlers=a;let{rulesDynamic:h}=this.config;for(let g of h){let[E,C,w]=g;if(w?.internal&&!r)continue;let $=o;if(w?.prefix){let v=U(w.prefix);if(s){let p=U(s);if(!v.some(u=>p.includes(u)))continue}else{let p=v.find(u=>o.startsWith(u));if(p==null)continue;$=o.slice(p.length)}}let S=$.match(E);if(!S)continue;let b=await C(S,t);if(!b)continue;if(t.generator.activatedRules.add(g),this.config.details&&t.rules.push(g),typeof b!="string")if(Symbol.asyncIterator in b){let v=[];for await(let p of b)p&&v.push(p);b=v}else Symbol.iterator in b&&!Array.isArray(b)&&(b=Array.from(b).filter(Z));let V=he(b).filter(v=>v.length);if(V.length){let v=this.config.rules.indexOf(g);return V.map(p=>{if(P(p))return[v,p,w];let u=a,m=w;for(let x of p)x[0]===I.variants?u=[...U(x[1]),...u]:x[0]===I.parent?u=[{parent:x[1]},...u]:x[0]===I.selector?u=[{selector:x[1]},...u]:x[0]===I.layer?u=[{layer:x[1]},...u]:x[0]===I.sort&&(m={...m,sort:x[1]});return[v,l,p,m,u]})}}},d=(await Promise.all(i.map(l=>f(l)))).flat().filter(l=>!!l);if(d.length)return d}stringifyUtil(e,t){if(!e)return;if(ie(e))return[e[0],void 0,e[1],void 0,e[2],this.config.details?t:void 0,void 0];let{selector:r,entries:s,parent:i,layer:f,sort:d,noMerge:l}=this.applyVariants(e),o=ee(s);if(!o)return;let{layer:a,sort:c,...h}=e[3]??{},g={...h,layer:f??a,sort:d??c};return[e[0],r,o,i,g,this.config.details?t:void 0,l]}async expandShortcut(e,t,r=5){if(r===0)return;let s=this.config.details?o=>{t.shortcuts=t.shortcuts??[],t.shortcuts.push(o)}:me,i,f,d,l;for(let o of this.config.shortcuts){let a=e;if(o[2]?.prefix){let h=U(o[2].prefix).find(g=>e.startsWith(g));if(h==null)continue;a=e.slice(h.length)}if(ye(o)){if(o[0]===a){i=i||o[2],f=o[1],s(o);break}}else{let c=a.match(o[0]);if(c&&(f=o[1](c,t)),f){i=i||o[2],s(o);break}}}if(f&&(d=_(U(f).filter(P).map(o=>xe(o.trim()).split(/\s+/g)).flat()),l=U(f).filter(o=>!P(o)).map(o=>({handles:[],value:o}))),!f){let o=P(e)?await this.matchVariants(e):[e];for(let a of o){let[c,h,g]=a;if(c!==h){let E=await this.expandShortcut(h,t,r-1);E&&(d=E[0].filter(P).map(C=>c.replace(h,C)),l=E[0].filter(C=>!P(C)).map(C=>({handles:[...C.handles,...g],value:C.value})))}}}if(!(!d?.length&&!l?.length))return[[await Promise.all(U(d).map(async o=>(await this.expandShortcut(o,t,r-1))?.[0]||[o])),l].flat(2).filter(o=>!!o),i]}async stringifyShortcuts(e,t,r,s={layer:this.config.shortcutsLayer}){let i=new Q,f=(await Promise.all(_(r).map(async a=>{let c=P(a)?await this.parseUtil(a,t,!0,s.prefix):[[Number.POSITIVE_INFINITY,"{inline}",K(a.value),void 0,a.handles]];return!c&&this.config.warn&&be(`unmatched utility "${a}" in shortcut "${e[1]}"`),c||[]}))).flat(1).filter(Boolean).sort((a,c)=>a[0]-c[0]),[d,,l]=e,o=[];for(let a of f){if(ie(a)){o.push([a[0],void 0,a[1],void 0,a[2],t,void 0]);continue}let{selector:c,entries:h,parent:g,sort:E,noMerge:C,layer:w}=this.applyVariants(a,[...a[4],...l],d);i.getFallback(w??s.layer,new J).getFallback(c,g,[[],a[0]])[0].push([h,!!(C??a[3]?.noMerge),E??0])}return o.concat(i.flatMap((a,c)=>a.map(([h,g],E,C)=>{let w=(S,b,V)=>{let v=Math.max(...V.map(u=>u[1])),p=V.map(u=>u[0]);return(S?[p.flat(1)]:p).map(u=>{let m=ee(u);if(m)return[g,E,m,C,{...s,noMerge:b,sort:v,layer:c},t,void 0]})};return[[h.filter(([,S])=>S).map(([S,,b])=>[S,b]),!0],[h.filter(([,S])=>!S).map(([S,,b])=>[S,b]),!1]].map(([S,b])=>[...w(!1,b,S.filter(([V])=>V.some(v=>v[0]===I.shortcutsNoMerge))),...w(!0,b,S.filter(([V])=>V.every(v=>v[0]!==I.shortcutsNoMerge)))])}).flat(2).filter(Boolean)))}isBlocked(e){return!e||this.config.blocklist.map(t=>Array.isArray(t)?t[0]:t).some(t=>typeof t=="function"?t(e):P(t)?t===e:t.test(e))}getBlocked(e){let t=this.config.blocklist.find(r=>{let s=Array.isArray(r)?r[0]:r;return typeof s=="function"?s(e):P(s)?s===e:s.test(e)});return t?Array.isArray(t)?t:[t,void 0]:void 0}};async function Ae(n,e){return await le.create(n,e)}var Me=/\s\$\$\s+/g;function We(n){return Me.test(n)}function Ye(n,e){return We(n)?n.replace(Me,e?` ${e} `:" "):e?`${e} ${n}`:n}var we=/^\[(.+?)(~?=)"(.*)"\]$/;function qe(n){return we.test(n)?n.replace(we,(e,t,r,s)=>`[${q(t)}${r}"${q(s)}"]`):`.${q(n)}`}function Ze(n,e){return e(n)}function Je(n){return n.replace(/-(\w)/g,(e,t)=>t?t.toUpperCase():"")}function Pe(n){return n.charAt(0).toUpperCase()+n.slice(1)}function Ue(n){return n.replace(/(?:^|\B)([A-Z])/g,"-$1").toLowerCase()}var Ve=["Webkit","Moz","ms"];function $e(n){let e={};function t(r){let s=e[r];if(s)return s;let i=Je(r);if(i!=="filter"&&i in n)return e[r]=Ue(i);i=Pe(i);for(let f=0;f<Ve.length;f++){let d=`${Ve[f]}${i}`;if(d in n)return e[r]=Ue(Pe(d))}return r}return({entries:r})=>r.forEach(s=>{s[0].startsWith("--")||(s[0]=t(s[0]))})}function Oe(n){return n.replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<")}async function ce(n={}){if(typeof window>"u"){console.warn("@unocss/runtime been used in non-browser environment, skipped.");return}let e=window,t=window.document,r=()=>t.documentElement,s=e.__unocss||{},i=Object.assign({},n,s.runtime),f=i.defaults||{},d=i.cloakAttribute??"un-cloak";i.autoPrefix&&(f.postprocess=U(f.postprocess)).unshift($e(t.createElement("div").style)),i.configResolved?.(s,f);let l=await Ae(s,f),o=y=>i.inject?i.inject(y):r().prepend(y),a=()=>i.rootElement?i.rootElement():t.body,c=new Map,h=!0,g=new Set,E,C,w=[],$=()=>new Promise(y=>{w.push(y),C!=null&&clearTimeout(C),C=setTimeout(()=>V().then(()=>{let R=w;w=[],R.forEach(A=>A())}),0)});function S(y,R=!1){if(y.nodeType!==1)return;let A=y;A.hasAttribute(d)&&A.removeAttribute(d),R&&A.querySelectorAll(`[${d}]`).forEach(M=>{M.removeAttribute(d)})}function b(y,R){let A=c.get(y);if(!A)if(A=t.createElement("style"),A.setAttribute("data-unocss-runtime-layer",y),c.set(y,A),R==null)o(A);else{let M=b(R),T=M.parentNode;T?T.insertBefore(A,M.nextSibling):o(A)}return A}async function V(){let y=[...g],R=await l.generate(y);return R.layers.reduce((M,T)=>(b(T,M).innerHTML=R.getLayer(T)??"",T),void 0),y.filter(M=>!R.matched.has(M)).forEach(M=>g.delete(M)),{...R,getStyleElement:M=>c.get(M),getStyleElements:()=>c}}async function v(y){let R=g.size;await l.applyExtractors(y,void 0,g),R!==g.size&&await $()}async function p(y=a()){let R=y&&y.outerHTML;R&&(await v(`${R} ${Oe(R)}`),S(r()),S(y,!0))}let u=new MutationObserver(y=>{h||y.forEach(async R=>{if(R.target.nodeType!==1)return;let A=R.target;for(let M of c)if(A===M[1])return;if(R.type==="childList")R.addedNodes.forEach(async M=>{if(M.nodeType!==1)return;let T=M;E&&!E(T)||(await v(T.outerHTML),S(T))});else{if(E&&!E(A))return;if(R.attributeName!==d){let M=Array.from(A.attributes).map(O=>O.value?`${O.name}="${O.value}"`:O.name).join(" "),T=`<${A.tagName.toLowerCase()} ${M}>`;await v(T)}S(A)}})}),m=!1;function x(){if(m)return;let y=i.observer?.target?i.observer.target():a();y&&(u.observe(y,{childList:!0,subtree:!0,attributes:!0,attributeFilter:i.observer?.attributeFilter}),m=!0)}function j(){i.bypassDefined&&Qe(l.blocked),p(),x()}function k(){t.readyState==="loading"?e.addEventListener("DOMContentLoaded",j):j()}let L=e.__unocss_runtime=e.__unocss_runtime={version:l.version,uno:l,async extract(y){P(y)||(y.forEach(R=>g.add(R)),y=""),await v(y)},extractAll:p,inspect(y){E=y},toggleObserver(y){y===void 0?h=!h:h=!!y,!m&&!h&&k()},update:V,presets:e.__unocss_runtime?.presets??{}};i.ready?.(L)!==!1&&(h=!1,k())}function Qe(n=new Set){for(let e=0;e<document.styleSheets.length;e++){let t=document.styleSheets[e],r;try{if(r=t.cssRules||t.rules,!r)continue;Array.from(r).flatMap(s=>s.selectorText?.split(/,/g)||[]).forEach(s=>{s&&(s=s.trim(),s.startsWith(".")&&(s=s.slice(1)),n.add(s))})}catch{continue}}return n}ce();})();
import{d as A,u as q,g as G,h as y,i as h,w as l,j as C,t as f,q as $,l as e,n as L,k as c,m as g,_ as S,ap as ie,r as u,L as N,M as z,Y as le,e as K,V as R,aa as ne,J as se,y as X,ar as re,Q as U,s as O,z as Y,a0 as de,ai as ue,ag as ce,bh as ve,S as j,bi as pe,aL as fe,bj as me,U as ye,o as _e,W as xe,aj as ge}from"./index-BlEQ5104.js";import{_ as be}from"./NeTable.vue_vue_type_script_setup_true_lang-BDPau7Vg.js";/* empty css                                                */import{_ as we}from"./NeMultiTextInput.vue_vue_type_script_setup_true_lang-DwfeP71-.js";import"./isArrayLikeObject-CpCvCe5A.js";const ke={key:0,class:"text-primary-800 dark:text-primary-400"},De={class:"align-center flex justify-end"},he=A({__name:"ProxyTable",props:{proxies:{}},emits:["delete","edit"],setup(B,{emit:b}){const{t:v}=q(),a=b,w=[{label:v("standalone.reverse_proxy.domain_path"),key:"domain_path"},{label:v("standalone.reverse_proxy.destination_url"),key:"destination"},{label:v("standalone.reverse_proxy.description"),key:"description"},{label:v("standalone.reverse_proxy.allowed_networks"),key:"allow"},{label:"",key:"menu"}];function p(_){return[{id:"delete",label:v("common.delete"),iconStyle:"fas",icon:"trash",danger:!0,action:()=>{a("delete",_)}}]}return(_,s)=>{const r=G("font-awesome-icon");return y(),h(be,{data:_.proxies,headers:w},{domain_path:l(({item:o})=>[C("p",null,f(o.domain??o.path??o.location),1)]),destination:l(({item:o})=>[C("p",null,f(o.domain?o.destination.replace("$upstream",o.domain):o.destination),1)]),description:l(({item:o})=>[C("p",null,f(o.description?o.description:"-"),1)]),allow:l(({item:o})=>{var d,m;return[C("p",null,f(((m=(d=o.allow)==null?void 0:d.slice(0,2))==null?void 0:m.join(", "))??"-"),1),o.allow&&o.allow.length>2?(y(),$("p",ke,f(e(v)("standalone.reverse_proxy.and_n_others",{n:o.allow.length-2})),1)):L("",!0)]}),menu:l(({item:o})=>[C("div",De,[c(e(S),{kind:"tertiary",onClick:d=>a("edit",o)},{prefix:l(()=>[c(r,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:l(()=>[g(" "+f(e(v)("common.edit")),1)]),_:2},1032,["onClick"]),c(e(ie),{items:p(o),"align-to-right":!0},null,8,["items"])])]),_:1},8,["data"])}}}),Ve=A({__name:"DeleteProxyModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","proxy-deleted"],setup(B,{emit:b}){const{t:v}=q(),a=B,w=b,p=u({notificationDescription:"",notificationDetails:""}),_=u(!1);async function s(){if(a.itemToDelete)try{p.value={notificationDescription:"",notificationDetails:""},_.value=!0,await K("ns.reverseproxy","delete-proxy",{id:a.itemToDelete.id}),w("proxy-deleted"),w("close")}catch(o){p.value.notificationDescription=v(R(o)),p.value.notificationDetails=o.toString()}finally{_.value=!1}}function r(){p.value={notificationDescription:"",notificationDetails:""},w("close")}return(o,d)=>(y(),h(e(le),{visible:o.visible,kind:"warning",title:e(v)("standalone.reverse_proxy.delete_proxy"),primaryLabel:e(v)("common.delete"),primaryButtonDisabled:_.value,primaryButtonLoading:_.value,"close-aria-label":e(v)("common.close"),onPrimaryClick:d[0]||(d[0]=m=>s()),onClose:d[1]||(d[1]=m=>r())},{default:l(()=>{var m,k,V;return[g(f(e(v)("standalone.reverse_proxy.delete_proxy_message",{path:((m=o.itemToDelete)==null?void 0:m.domain)??((k=o.itemToDelete)==null?void 0:k.path)??((V=o.itemToDelete)==null?void 0:V.location)??""}))+" ",1),p.value.notificationDescription?(y(),h(e(N),{key:0,kind:"error",title:e(v)("error.cannot_delete_proxy"),description:p.value.notificationDescription,class:"my-2"},z({_:2},[p.value.notificationDetails?{name:"details",fn:l(()=>[g(f(p.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0)]}),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}}),Te={key:2,class:"flex flex-col gap-y-6"},Ce={class:"flex justify-end"},Ee=A({__name:"CreateOrEditProxyDrawer",props:{isShown:{type:Boolean},itemToEdit:{}},emits:["close","add-edit-proxy"],setup(B,{emit:b}){const v=B,{t:a}=q(),w=b,p=u(!1),_=u(!1),s=u({notificationTitle:"",notificationDescription:"",notificationDetails:""}),r=u(new ne),o=u([]),d=u(""),m=u("path"),k=u(""),V=u(""),T=u([]),x=u(""),D=u(""),E=u("_lan"),Q=[{id:"path",label:a("standalone.reverse_proxy.path")},{id:"domain",label:a("standalone.reverse_proxy.domain")}],I=u([]);function H(){o.value=[],r.value.clear()}function Z(n,t){for(let i of n)i.valid||r.value.set(t,[i.errMessage]);return n.every(i=>i.valid)}function ee(){T.value.forEach(()=>{o.value.push("")});let n=!0;for(let[P,M]of T.value.entries()){const J=ve(M);M!=""&&!J.valid&&(o.value[P]=a(J.errMessage),n=!1)}const t=[[[j(x.value),pe(x.value)],"path"]],i=[[[j(D.value),fe(D.value,!1)],"domain"]];return[[[j(k.value),me(k.value)],"destination"],[[j(V.value)],"description"],...m.value==="path"?t:i].map(([P,M])=>Z(P,M)).every(P=>P)&&n}async function ae(){if(s.value.notificationTitle="",s.value.notificationDescription="",s.value.notificationDetails="",H(),!ee())return;const n=m.value==="domain"?d.value?"edit-domain":"add-domain":d.value?"edit-path":"add-path",t=T.value.filter(Boolean);let i={destination:k.value,description:V.value};d.value&&(i.id=d.value),t.length>0&&(i.allow=t),m.value==="path"?i.path=x.value:(i.domain=D.value,i.certificate=E.value);try{_.value=!0,await K("ns.reverseproxy",n,i),w("add-edit-proxy"),W()}catch(F){F instanceof ce?r.value=F.errorBag:(s.value.notificationTitle=d.value?a("error.cannot_edit_proxy"):a("error.cannot_add_proxy"),s.value.notificationDescription=a(R(F)),s.value.notificationDetails=F.toString())}finally{_.value=!1}}async function te(){try{const n=(await K("ns.reverseproxy","list-certificates")).data.values;I.value=[...Object.keys(n).filter(t=>!n[t].pending).map(t=>({id:t,label:t==="_lan"?a("standalone.reverse_proxy.default_certificate"):t}))]}catch(n){s.value.notificationTitle=a("error.cannot_retrieve_certificates"),s.value.notificationDescription=a(R(n)),s.value.notificationDetails=n.toString()}}async function oe(){if(v.itemToEdit){const n=v.itemToEdit;d.value=n.id,m.value=n.type==="location"?"path":"domain",m.value==="domain"?(D.value=n.domain,E.value=n.certificate):x.value=n.location,k.value=n.destination,V.value=n.description,T.value=n.allow??[]}else d.value="",m.value="path",k.value="",V.value="",T.value=[],x.value="",D.value="",E.value="_lan"}function W(){s.value.notificationTitle="",s.value.notificationDescription="",s.value.notificationDetails="",H(),w("close")}return se(()=>v.isShown,()=>{v.isShown&&(p.value=!0,te().then(()=>{oe(),p.value=!1}))}),(n,t)=>(y(),h(e(ue),{"is-shown":n.isShown,onClose:t[10]||(t[10]=i=>W()),closeAriaLabel:e(a)("common.shell.close_side_drawer"),title:d.value?e(a)("standalone.reverse_proxy.edit_reverse_proxy"):e(a)("standalone.reverse_proxy.add_reverse_proxy")},{default:l(()=>[s.value.notificationTitle?(y(),h(e(N),{key:0,title:s.value.notificationTitle,description:s.value.notificationDescription,class:"mb-6",kind:"error"},z({_:2},[s.value.notificationDetails?{name:"details",fn:l(()=>[g(f(s.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0),p.value?(y(),h(e(X),{key:1,lines:20})):(y(),$("div",Te,[c(e(re),{label:e(a)("standalone.reverse_proxy.type"),options:Q,modelValue:m.value,"onUpdate:modelValue":t[0]||(t[0]=i=>m.value=i),disabled:!!n.itemToEdit},null,8,["label","modelValue","disabled"]),m.value==="path"?(y(),h(e(U),{key:0,modelValue:x.value,"onUpdate:modelValue":t[1]||(t[1]=i=>x.value=i),label:e(a)("standalone.reverse_proxy.path"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("path"))},{tooltip:l(()=>[c(e(O),null,{content:l(()=>[g(f(e(a)("standalone.reverse_proxy.path_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"])):(y(),$(Y,{key:1},[c(e(U),{modelValue:D.value,"onUpdate:modelValue":t[2]||(t[2]=i=>D.value=i),label:e(a)("standalone.reverse_proxy.domain"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("domain")),disabled:!!n.itemToEdit},{tooltip:l(()=>[c(e(O),null,{content:l(()=>[g(f(e(a)("standalone.reverse_proxy.domain_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message","disabled"]),c(e(de),{modelValue:E.value,"onUpdate:modelValue":t[3]||(t[3]=i=>E.value=i),label:e(a)("standalone.reverse_proxy.certificate"),invalidMessage:e(a)(r.value.getFirstI18nKeyFor("certificate")),noOptionsLabel:e(a)("ne_combobox.no_options_label"),noResultsLabel:e(a)("ne_combobox.no_results"),options:I.value,limitedOptionsLabel:e(a)("ne_combobox.limited_options_label"),"selected-label":e(a)("ne_combobox.selected"),"user-input-label":e(a)("ne_combobox.user_input_label"),optionalLabel:e(a)("common.optional")},null,8,["modelValue","label","invalidMessage","noOptionsLabel","noResultsLabel","options","limitedOptionsLabel","selected-label","user-input-label","optionalLabel"]),I.value.length==1&&I.value[0].id=="_lan"?(y(),h(e(N),{key:0,title:e(a)("standalone.reverse_proxy.no_certificate_configured_title"),description:e(a)("standalone.reverse_proxy.no_certificate_configured_description"),kind:"warning","primary-button-label":e(a)("standalone.reverse_proxy.go_to_certificates"),onPrimaryClick:t[4]||(t[4]=()=>{n.$router.push("/standalone/system/certificates")})},null,8,["title","description","primary-button-label"])):L("",!0)],64)),c(e(U),{modelValue:k.value,"onUpdate:modelValue":t[5]||(t[5]=i=>k.value=i),label:e(a)("standalone.reverse_proxy.destination_url"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("destination"))},{tooltip:l(()=>[c(e(O),null,{content:l(()=>[g(f(e(a)("standalone.reverse_proxy.destination_url_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),c(e(U),{modelValue:V.value,"onUpdate:modelValue":t[6]||(t[6]=i=>V.value=i),label:e(a)("standalone.reverse_proxy.description"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("description"))},null,8,["modelValue","label","invalid-message"]),c(we,{modelValue:T.value,"onUpdate:modelValue":t[7]||(t[7]=i=>T.value=i),"add-item-label":e(a)("standalone.reverse_proxy.add_cidr_network"),title:e(a)("standalone.reverse_proxy.allowed_networks"),"invalid-messages":o.value,"general-invalid-message":e(a)(r.value.getFirstI18nKeyFor("allow"))},{tooltip:l(()=>[c(e(O),null,{content:l(()=>[g(f(e(a)("standalone.reverse_proxy.allowed_networks_tooltip")),1)]),_:1})]),_:1},8,["modelValue","add-item-label","title","invalid-messages","general-invalid-message"]),t[11]||(t[11]=C("hr",null,null,-1)),C("div",Ce,[c(e(S),{kind:"tertiary",class:"mr-4",onClick:t[8]||(t[8]=i=>W())},{default:l(()=>[g(f(e(a)("common.cancel")),1)]),_:1}),c(e(S),{kind:"primary",onClick:t[9]||(t[9]=i=>ae()),disabled:_.value,loading:_.value},{default:l(()=>[g(f(d.value?e(a)("common.save"):e(a)("standalone.reverse_proxy.add_reverse_proxy")),1)]),_:1},8,["disabled","loading"])])]))]),_:1},8,["is-shown","closeAriaLabel","title"]))}}),Le={class:"flex flex-col gap-y-6"},$e={class:"flex flex-row items-center justify-between"},Be={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},Fe={key:0,class:"ml-2 flex shrink-0 flex-col gap-x-0 gap-y-2 sm:flex-row sm:gap-x-2 sm:gap-y-0"},Oe=A({__name:"ReverseProxyView",setup(B){const{t:b}=q(),v=ye(),a=u(!0),w=u([]),p=u(null),_=u(!1),s=u(!1),r=u({notificationTitle:"",notificationDescription:"",notificationDetails:""});async function o(){try{a.value=!0,w.value=(await K("ns.reverseproxy","list-proxies")).data.data}catch(x){r.value.notificationTitle=b("error.cannot_retrieve_proxies"),r.value.notificationDescription=b(R(x)),r.value.notificationDetails=x.toString()}finally{a.value=!1}}function d(x){p.value=x,_.value=!0}function m(x){p.value=x,s.value=!0}function k(){p.value=null,s.value=!1,_.value=!1}function V(){r.value={notificationTitle:"",notificationDescription:"",notificationDetails:""}}async function T(){V(),await o(),await v.getChanges()}return _e(()=>{o()}),(x,D)=>{const E=G("font-awesome-icon");return y(),$(Y,null,[C("div",Le,[c(e(xe),{tag:"h3",class:"mb-7"},{default:l(()=>[g(f(e(b)("standalone.reverse_proxy.title")),1)]),_:1}),C("div",$e,[C("p",Be,f(e(b)("standalone.reverse_proxy.page_description")),1),w.value.length>0?(y(),$("div",Fe,[c(e(S),{kind:"secondary",onClick:D[0]||(D[0]=Q=>d(null))},{prefix:l(()=>[c(E,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:l(()=>[g(" "+f(e(b)("standalone.reverse_proxy.add_reverse_proxy")),1)]),_:1})])):L("",!0)]),r.value.notificationTitle?(y(),h(e(N),{key:0,kind:"error",title:r.value.notificationTitle,description:r.value.notificationDescription},z({_:2},[r.value.notificationDetails?{name:"details",fn:l(()=>[g(f(r.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0),a.value?(y(),h(e(X),{key:1,lines:10})):r.value.notificationTitle?L("",!0):(y(),$(Y,{key:2},[w.value.length==0?(y(),h(e(ge),{key:0,title:e(b)("standalone.reverse_proxy.no_reverse_proxy_found"),icon:["fas","server"]},{default:l(()=>[c(e(S),{kind:"primary",onClick:D[1]||(D[1]=Q=>d(null))},{prefix:l(()=>[c(E,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:l(()=>[g(f(e(b)("standalone.reverse_proxy.add_reverse_proxy")),1)]),_:1})]),_:1},8,["title"])):(y(),h(he,{key:1,proxies:w.value,onDelete:m,onEdit:d},null,8,["proxies"]))],64))]),c(Ve,{visible:s.value,"item-to-delete":p.value,onClose:k,onProxyDeleted:T},null,8,["visible","item-to-delete"]),c(Ee,{"is-shown":_.value,"item-to-edit":p.value,onClose:k,onAddEditProxy:T},null,8,["is-shown","item-to-edit"])],64)}}});export{Oe as default};

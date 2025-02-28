import{d as E,u as M,a as ne,g as A,h as i,i as m,w as n,k as o,l as e,_ as $,v as le,bX as ie,m as f,t as _,bY as K,aj as O,r as k,c as J,o as q,q as w,j as g,bZ as oe,n as L,D as Q,B as X,M as z,L as T,z as F,Q as N,N as re,aa as Y,J as U,T as R,R as P,ai as de,ag as ce,S as G,bJ as _e,b4 as Z,ad as H,bs as me,aI as pe,aK as fe,ak as ge,al as W,am as he,an as se,ao as j,b_ as be,ap as ve,aq as De,y as ke,a5 as ye,a0 as Be,s as te,bN as Se,bL as we,U as xe,e as Le,V as Ce,W as Ve,a9 as $e}from"./index-BlEQ5104.js";import{u as Fe}from"./useTabs-BeLQ169O.js";import{_ as Ee}from"./BlocklistTable.vue_vue_type_script_setup_true_lang-DVIfmwgd.js";import{u as I}from"./threatShield-DPhO5atu.js";import{_ as ue}from"./DeleteModal.vue_vue_type_script_setup_true_lang-DxXJd-w5.js";import{_ as ae}from"./FormLayout.vue_vue_type_script_setup_true_lang-DaMAl8E3.js";import{_ as Me}from"./NeMultiTextInput.vue_vue_type_script_setup_true_lang-DwfeP71-.js";import"./isArrayLikeObject-CpCvCe5A.js";const ee=E({__name:"TsDisabledEmptyState",setup(C){const{t}=M(),s=ne();return(c,a)=>{const r=A("font-awesome-icon");return i(),m(e(O),{title:e(t)("standalone.threat_shield_dns.threat_shield_dns_disabled"),icon:e(K),class:"pb-8"},{default:n(()=>[o(e($),{kind:"primary",onClick:a[0]||(a[0]=()=>{e(s).push(`${e(le)()}/security/threat-shield-dns?tab=settings`)})},{prefix:n(()=>[o(r,{icon:e(ie),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("standalone.threat_shield_dns.go_to_settings")),1)]),_:1})]),_:1},8,["title","icon"])}}}),ze={class:"mb-8"},Te={class:"flex flex-col items-start justify-between gap-6 xl:flex-row"},Oe={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},Re={key:0,class:"mt-2 flex flex-row gap-x-2"},Ae={class:"space-y-6"},Ie=E({__name:"BlocklistSourcesPanel",setup(C){const{t}=M(),s=I(),c=k(""),a=k(!0),r=J(()=>c.value?s.dnsBlocklists.filter(D=>s.searchStringInDnsBlocklist(D,c.value)):s.dnsBlocklists);q(()=>{u()});async function u(){try{await s.listDnsBlocklist()}finally{a.value=!1}}async function v(D){try{await s.editDnsBlocklist(D.name,D.enabled),s.listDnsBlocklist()}catch{}}function h(){c.value=""}return(D,y)=>{var d,l;const x=A("FontAwesomeIcon");return i(),w("div",null,[g("div",ze,[g("div",Te,[g("div",Oe,[g("p",null,_(e(t)("standalone.threat_shield_dns.blocklist_sources_description")),1),e(s).isEnterprise?(i(),w("div",Re,[o(x,{icon:e(oe),class:"h-4 w-4 text-indigo-500 dark:text-indigo-300"},null,8,["icon"]),g("p",null,_(e(t)("standalone.threat_shield_dns.blocklist_subscription_description")),1)])):L("",!0)]),(d=e(s).dnsSettings)!=null&&d.enabled?(i(),m(e(X),{key:0,icon:e(Q),text:e(t)("standalone.threat_shield_dns.threat_shield_dns_enabled"),kind:"success"},null,8,["icon","text"])):L("",!0)])]),g("div",Ae,[e(s).errorListDnsBlocklists?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_retrieve_blocklists"),description:e(s).errorListDnsBlocklists,class:"mb-5"},z({_:2},[e(s).errorListDnsBlocklistsDetails?{name:"details",fn:n(()=>[f(_(e(s).errorListDnsBlocklistsDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0),e(s).errorEditDnsBlocklist?(i(),m(e(T),{key:1,kind:"error",title:e(t)("error.cannot_edit_blocklist"),description:e(s).errorEditDnsBlocklist,class:"mb-5"},z({_:2},[e(s).errorEditDnsBlocklistDetails?{name:"details",fn:n(()=>[f(_(e(s).errorEditDnsBlocklistDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):(i(),w(F,{key:2},[!e(s).loadingListDnsSettings&&!((l=e(s).dnsSettings)!=null&&l.enabled)?(i(),m(ee,{key:0})):(i(),w(F,{key:1},[o(e(N),{placeholder:e(t)("standalone.threat_shield.filter_blocklists"),modelValue:c.value,"onUpdate:modelValue":y[0]||(y[0]=p=>c.value=p),modelModifiers:{trim:!0},"is-search":"",disabled:a.value||e(s).loadingListDnsSettings,class:"max-w-xs sm:max-w-sm"},null,8,["placeholder","modelValue","disabled"]),!e(s).dnsBlocklists.length&&!e(s).loadingListDnsBlocklists?(i(),m(e(O),{key:0,title:e(t)("standalone.threat_shield_dns.no_blocklists"),icon:["fas","circle-info"],class:"mt-4"},null,8,["title"])):!r.value.length&&!e(s).loadingListDnsBlocklists?(i(),m(e(O),{key:1,title:e(t)("standalone.threat_shield_dns.no_blocklists_found"),description:e(t)("common.try_changing_search_filters"),icon:["fas","circle-info"],class:"mt-4"},{default:n(()=>[o(e($),{kind:"tertiary",onClick:h},{default:n(()=>[f(_(e(t)("common.clear_filter")),1)]),_:1})]),_:1},8,["title","description"])):(i(),m(Ee,{key:2,blocklists:r.value,"disable-toggles":e(s).loadingEditDnsBlocklist,kind:"dns",loading:a.value||e(s).loadingListDnsSettings,onToggleBlocklist:v},null,8,["blocklists","disable-toggles","loading"]))],64))],64))])])}}}),Pe=E({__name:"BypassCard",props:{bypass:{}},emits:["delete"],setup(C,{emit:t}){const{t:s}=M(),c=t;return(a,r)=>(i(),m(e(re),{menuItems:[{id:"delete",label:e(s)("common.delete"),icon:"trash",iconStyle:"fas",action:()=>c("delete",a.bypass),danger:!0}],class:"border-l-4 border-indigo-400 dark:border-indigo-500"},{title:n(()=>[g("div",null,[g("span",null,_(a.bypass),1)])]),_:1},8,["menuItems"]))}}),Ne={class:"space-y-6"},qe={class:"flex justify-end"},je=E({__name:"CreateBypassDrawer",props:{isShown:{type:Boolean}},emits:["close","reloadData"],setup(C,{emit:t}){const s=C,c=t,{t:a}=M(),r=I(),u=k(""),v=k(),h=k(new Y);U(()=>s.isShown,()=>{s.isShown&&(d(),R(v),u.value="")});function D(){c("close")}function y(){d();let l=!0;const p=G(u.value);if(!p.valid)h.value.set("address",[p.errMessage]),l&&(R(v),l=!1);else{const b=_e(u.value);b.valid||(h.value.set("address",[b.errMessage]),l&&(R(v),l=!1))}return l}async function x(){if(y())try{await r.addDnsBypass(u.value),c("reloadData"),D()}catch(p){console.error(p),p instanceof ce&&(h.value=p.errorBag)}}function d(){h.value.clear(),r.errorAddDnsBypass="",r.errorAddDnsBypassDetails=""}return(l,p)=>(i(),m(e(de),{isShown:l.isShown,title:e(a)("standalone.threat_shield_dns.add_bypass"),closeAriaLabel:e(a)("common.shell.close_side_drawer"),onClose:D},{default:n(()=>[g("form",{onSubmit:p[1]||(p[1]=P(()=>{},["prevent"]))},[g("div",Ne,[o(e(N),{label:e(a)("standalone.threat_shield_dns.ip_address_or_network_cidr"),modelValue:u.value,"onUpdate:modelValue":p[0]||(p[0]=b=>u.value=b),modelModifiers:{trim:!0},invalidMessage:e(a)(h.value.getFirstI18nKeyFor("address")),disabled:e(r).loadingAddDnsBypass,ref_key:"bypassRef",ref:v},null,8,["label","modelValue","invalidMessage","disabled"]),e(r).errorAddDnsBypass?(i(),m(e(T),{key:0,kind:"error",title:e(a)("error.cannot_create_bypass"),description:e(r).errorAddDnsBypass},z({_:2},[e(r).errorAddDnsBypassDetails?{name:"details",fn:n(()=>[f(_(e(r).errorAddDnsBypassDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0)]),p[2]||(p[2]=g("hr",{class:"my-8 border-gray-200 dark:border-gray-700"},null,-1)),g("div",qe,[o(e($),{kind:"tertiary",size:"lg",onClick:P(D,["prevent"]),disabled:e(r).loadingAddDnsBypass,class:"mr-3"},{default:n(()=>[f(_(e(a)("common.cancel")),1)]),_:1},8,["disabled"]),o(e($),{kind:"primary",size:"lg",onClick:P(x,["prevent"]),disabled:e(r).loadingAddDnsBypass,loading:e(r).loadingAddDnsBypass},{default:n(()=>[f(_(e(a)("standalone.threat_shield_dns.add_bypass")),1)]),_:1},8,["disabled","loading"])])],32)]),_:1},8,["isShown","title","closeAriaLabel"]))}}),Ue={class:"mb-8"},Ze={class:"flex flex-col items-start justify-between gap-6 xl:flex-row"},Ke={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},Je={class:"space-y-6"},We={key:0,class:"flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center"},He={key:3,class:"grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5 6xl:grid-cols-6"},Qe=E({__name:"FilterBypassPanel",setup(C){const{t}=M(),s=I(),c=k(""),a=k(!1),r=k(!1),u=k(""),v=J(()=>{if(!u.value)return s.dnsBypasses;const d=u.value.trim();return s.dnsBypasses.filter(l=>l.includes(d))});q(()=>{h()});function h(){s.listDnsBypass()}function D(){c.value="",a.value=!0}function y(d){c.value=d,r.value=!0}function x(){u.value=""}return(d,l)=>{var b,B;const p=A("font-awesome-icon");return i(),w("div",null,[g("div",Ue,[g("div",Ze,[g("div",Ke,[g("p",null,_(e(t)("standalone.threat_shield_dns.filter_bypass_description")),1)]),(b=e(s).dnsSettings)!=null&&b.enabled?(i(),m(e(X),{key:0,icon:e(Q),text:e(t)("standalone.threat_shield_dns.threat_shield_dns_enabled"),kind:"success"},null,8,["icon","text"])):L("",!0)])]),g("div",Je,[e(s).errorListDnsBypass?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_retrieve_bypasses"),description:e(s).errorListDnsBypass,class:"mb-5"},z({_:2},[e(s).errorListDnsBypassDetails?{name:"details",fn:n(()=>[f(_(e(s).errorListDnsBypassDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):(i(),w(F,{key:1},[!e(s).loadingListDnsSettings&&!((B=e(s).dnsSettings)!=null&&B.enabled)?(i(),m(ee,{key:0})):(i(),w(F,{key:1},[e(s).dnsBypasses.length&&!e(s).loadingListDnsBypass?(i(),w("div",We,[o(e(N),{placeholder:e(t)("common.filter"),modelValue:u.value,"onUpdate:modelValue":l[0]||(l[0]=S=>u.value=S),modelModifiers:{trim:!0},"is-search":"",disabled:e(s).loadingListDnsBypass||e(s).loadingListDnsSettings,class:"max-w-xs sm:max-w-sm"},null,8,["placeholder","modelValue","disabled"]),o(e($),{kind:"secondary",size:"lg",onClick:D},{prefix:n(()=>[o(p,{icon:e(Z),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("standalone.threat_shield_dns.add_bypass")),1)]),_:1})])):L("",!0),!e(s).dnsBypasses.length&&!e(s).loadingListDnsBypass?(i(),m(e(O),{key:1,title:e(t)("standalone.threat_shield_dns.no_filter_bypasses_configured"),icon:e(K),class:"mt-4"},{default:n(()=>[o(e($),{kind:"primary",size:"lg",onClick:D},{prefix:n(()=>[o(p,{icon:e(Z),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("standalone.threat_shield_dns.add_bypass")),1)]),_:1})]),_:1},8,["title","icon"])):!v.value.length&&!e(s).loadingListDnsBypass?(i(),m(e(O),{key:2,title:e(t)("standalone.threat_shield_dns.no_filter_bypasses_found"),description:e(t)("common.try_changing_search_filters"),icon:["fas","circle-info"],class:"mt-4"},{default:n(()=>[o(e($),{kind:"tertiary",onClick:x},{default:n(()=>[f(_(e(t)("common.clear_filter")),1)]),_:1})]),_:1},8,["title","description"])):L("",!0),e(s).dnsBypasses.length||e(s).loadingListDnsBypass?(i(),w("div",He,[e(s).loadingListDnsBypass?(i(),w(F,{key:0},H(8,S=>o(e(re),{key:S,loading:"",skeletonLines:2})),64)):(i(!0),w(F,{key:1},H(v.value,(S,V)=>(i(),m(Pe,{key:V,bypass:S,onDelete:y},null,8,["bypass"]))),128))])):L("",!0)],64))],64))]),o(je,{isShown:a.value,onClose:l[1]||(l[1]=S=>a.value=!1),onReloadData:h},null,8,["isShown"]),o(ue,{visible:r.value,title:e(t)("standalone.threat_shield_dns.delete_bypass"),deleteButtonLabel:e(t)("standalone.threat_shield_dns.delete_bypass"),errorNotificationTitle:e(t)("error.cannot_delete_bypass"),deleteFunction:()=>e(s).deleteDnsBypass(c.value),onClose:l[2]||(l[2]=S=>r.value=!1),onReloadData:h},{default:n(()=>[f(_(e(t)("standalone.threat_shield_dns.confirm_delete_bypass",{name:c.value})),1)]),_:1},8,["visible","title","deleteButtonLabel","errorNotificationTitle","deleteFunction"])])}}}),Xe={class:"space-y-6"},Ye={class:"flex justify-end"},Ge=E({__name:"CreateOrEditBlockedDomainDrawer",props:{isShown:{type:Boolean,default:!1},currentDomain:{type:Object},recordOptions:{type:Array}},emits:["close","reloadData"],setup(C,{emit:t}){const s=C,c=t,{t:a}=M(),r=I(),u=k(""),v=k(),h=k(""),D=k(),y=k(new Y);U(()=>s.isShown,()=>{var b;s.isShown&&(d(),s.currentDomain?(u.value=s.currentDomain.address,h.value=((b=s.currentDomain)==null?void 0:b.description)||"",R(D)):(u.value="",h.value="",R(v)))});function x(){c("close")}function d(){y.value.clear(),r.errorSaveDnsBlockedDomain="",r.errorSaveDnsBlockedDomainDetails=""}function l(){d();let b=!0;const B=G(u.value);if(!B.valid)y.value.set("address",[B.errMessage]),b&&(R(v),b=!1);else{const S=me(u.value);S.valid||(y.value.set("address",[S.errMessage]),b&&(R(v),b=!1))}return b}async function p(){if(!l())return;const B={address:u.value};h.value&&(B.description=h.value);const S=!!s.currentDomain;try{await r.saveDnsBlockedDomain(B,S),c("reloadData"),x()}catch(V){console.error(V),V instanceof ce&&(y.value=V.errorBag)}}return(b,B)=>(i(),m(e(de),{isShown:C.isShown,title:C.currentDomain?e(a)("standalone.threat_shield_dns.edit_domain"):e(a)("standalone.threat_shield_dns.add_domain"),closeAriaLabel:e(a)("common.shell.close_side_drawer"),onClose:x},{default:n(()=>[g("form",{onSubmit:B[2]||(B[2]=P(()=>{},["prevent"]))},[g("div",Xe,[o(e(N),{label:e(a)("standalone.threat_shield_dns.domain"),modelValue:u.value,"onUpdate:modelValue":B[0]||(B[0]=S=>u.value=S),modelModifiers:{trim:!0},invalidMessage:e(a)(y.value.getFirstI18nKeyFor("address")),disabled:e(r).loadingSaveDnsBlockedDomain||!!C.currentDomain,ref_key:"domainRef",ref:v},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(N),{label:e(a)("standalone.threat_shield_dns.description"),modelValue:h.value,"onUpdate:modelValue":B[1]||(B[1]=S=>h.value=S),modelModifiers:{trim:!0},disabled:e(r).loadingSaveDnsBlockedDomain,optional:"",optionalLabel:e(a)("common.optional"),ref_key:"descriptionRef",ref:D},null,8,["label","modelValue","disabled","optionalLabel"]),e(r).errorSaveDnsBlockedDomain?(i(),m(e(T),{key:0,kind:"error",title:e(a)("error.cannot_save_blocked_domain"),description:e(r).errorSaveDnsBlockedDomain},z({_:2},[e(r).errorSaveDnsBlockedDomainDetails?{name:"details",fn:n(()=>[f(_(e(r).errorSaveDnsBlockedDomainDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0)]),B[3]||(B[3]=g("hr",{class:"my-8 border-gray-200 dark:border-gray-700"},null,-1)),g("div",Ye,[o(e($),{kind:"tertiary",size:"lg",onClick:P(x,["prevent"]),disabled:e(r).loadingSaveDnsBlockedDomain,class:"mr-3"},{default:n(()=>[f(_(e(a)("common.cancel")),1)]),_:1},8,["disabled"]),o(e($),{kind:"primary",size:"lg",onClick:P(p,["prevent"]),disabled:e(r).loadingSaveDnsBlockedDomain,loading:e(r).loadingSaveDnsBlockedDomain},{default:n(()=>[f(_(C.currentDomain?e(a)("standalone.threat_shield_dns.save_domain"):e(a)("standalone.threat_shield_dns.add_domain")),1)]),_:1},8,["disabled","loading"])])],32)]),_:1},8,["isShown","title","closeAriaLabel"]))}}),es={class:"-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end"},ss=E({__name:"BlockedDomainsTable",props:{filteredDomains:{type:Array,required:!0},loading:{type:Boolean,required:!0}},emits:["reloadData","editDomain","deleteDomain","clearFilter"],setup(C,{emit:t}){const s=C,c=t,{t:a}=M(),r=k(10),{currentPage:u,paginatedItems:v}=pe(()=>s.filteredDomains,{itemsPerPage:r});function h(D){return[{id:"deleteHostSet",label:a("common.delete"),icon:"trash",iconStyle:"fas",danger:!0,action:()=>c("deleteDomain",D),disabled:!1}]}return(D,y)=>{const x=A("font-awesome-icon");return i(),m(e(De),{ariaLabel:e(a)("standalone.threat_shield_dns.blocked_domains"),cardBreakpoint:"lg",loading:C.loading,skeletonColumns:3,skeletonRows:6},{paginator:n(()=>[o(e(fe),{"current-page":e(u),"total-rows":s.filteredDomains.length,"page-size":r.value,"nav-pagination-label":e(a)("ne_table.pagination"),"next-label":e(a)("ne_table.go_to_next_page"),"previous-label":e(a)("ne_table.go_to_previous_page"),"range-of-total-label":e(a)("ne_table.of"),"page-size-label":e(a)("ne_table.show"),onSelectPage:y[1]||(y[1]=d=>{u.value=d}),onSelectPageSize:y[2]||(y[2]=d=>{r.value=d})},null,8,["current-page","total-rows","page-size","nav-pagination-label","next-label","previous-label","range-of-total-label","page-size-label"])]),default:n(()=>[o(e(ge),null,{default:n(()=>[o(e(W),null,{default:n(()=>[f(_(e(a)("standalone.threat_shield_dns.domain")),1)]),_:1}),o(e(W),null,{default:n(()=>[f(_(e(a)("standalone.threat_shield_dns.description")),1)]),_:1}),o(e(W))]),_:1}),o(e(he),null,{default:n(()=>[s.filteredDomains.length?(i(!0),w(F,{key:1},H(e(v),(d,l)=>(i(),m(e(se),{key:l},{default:n(()=>[o(e(j),{"data-label":e(a)("standalone.threat_shield_dns.domain")},{default:n(()=>[f(_(d.address),1)]),_:2},1032,["data-label"]),o(e(j),{"data-label":e(a)("standalone.threat_shield_dns.description")},{default:n(()=>[f(_(d.description||"-"),1)]),_:2},1032,["data-label"]),o(e(j),{"data-label":e(a)("common.actions")},{default:n(()=>[g("div",es,[o(e($),{kind:"tertiary",onClick:p=>c("editDomain",d)},{prefix:n(()=>[o(x,{icon:e(be),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(a)("common.edit")),1)]),_:2},1032,["onClick"]),o(e(ve),{items:h(d),alignToRight:!0},null,8,["items"])])]),_:2},1032,["data-label"])]),_:2},1024))),128)):(i(),m(e(se),{key:0},{default:n(()=>[o(e(j),{colspan:"3"},{default:n(()=>[o(e(O),{title:e(a)("standalone.threat_shield_dns.no_domain_found"),description:e(a)("common.try_changing_search_filter"),icon:e(oe),class:"bg-white dark:bg-gray-950"},{default:n(()=>[o(e($),{kind:"tertiary",onClick:y[0]||(y[0]=d=>c("clearFilter"))},{default:n(()=>[f(_(e(a)("common.clear_filter")),1)]),_:1})]),_:1},8,["title","description","icon"])]),_:1})]),_:1}))]),_:1})]),_:1},8,["ariaLabel","loading"])}}}),ts={class:"mb-8"},as={class:"flex flex-col items-start justify-between gap-6 xl:flex-row"},ns={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},ls={class:"space-y-6"},is={key:0,class:"flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center"},os=E({__name:"LocalBlocklistPanel",setup(C){const{t}=M(),s=I(),c=k(void 0),a=k(!1),r=k(!1),u=k(""),v=J(()=>u.value?s.dnsBlockedDomains.filter(l=>s.searchStringInDnsBlockedDomain(l,u.value)):s.dnsBlockedDomains);q(()=>{h()});function h(){s.listDnsBlockedDomains()}function D(){c.value=void 0,a.value=!0}function y(l){c.value=l,a.value=!0}function x(l){c.value=l,r.value=!0}function d(){u.value=""}return(l,p)=>{var B,S;const b=A("font-awesome-icon");return i(),w("div",null,[g("div",ts,[g("div",as,[g("div",ns,[g("p",null,_(e(t)("standalone.threat_shield_dns.local_blocklist_description")),1)]),(B=e(s).dnsSettings)!=null&&B.enabled?(i(),m(e(X),{key:0,icon:e(Q),text:e(t)("standalone.threat_shield_dns.threat_shield_dns_enabled"),kind:"success"},null,8,["icon","text"])):L("",!0)])]),g("div",ls,[e(s).errorListDnsBlockedDomains?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_retrieve_blocked_domains"),description:e(s).errorListDnsBlockedDomains},z({_:2},[e(s).errorListDnsBlockedDomainsDetails?{name:"details",fn:n(()=>[f(_(e(s).errorListDnsBlockedDomainsDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):(i(),w(F,{key:1},[!e(s).loadingListDnsSettings&&!((S=e(s).dnsSettings)!=null&&S.enabled)?(i(),m(ee,{key:0})):(i(),w(F,{key:1},[e(s).dnsBlockedDomains.length&&!e(s).loadingListDnsBlockedDomains?(i(),w("div",is,[o(e(N),{placeholder:e(t)("common.filter"),modelValue:u.value,"onUpdate:modelValue":p[0]||(p[0]=V=>u.value=V),modelModifiers:{trim:!0},"is-search":"",disabled:e(s).loadingListDnsBlockedDomains||e(s).loadingListDnsBlockedDomains,class:"max-w-xs sm:max-w-sm"},null,8,["placeholder","modelValue","disabled"]),o(e($),{kind:"secondary",size:"lg",onClick:D},{prefix:n(()=>[o(b,{icon:e(Z),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("standalone.threat_shield_dns.add_domain")),1)]),_:1})])):L("",!0),!e(s).dnsBlockedDomains.length&&!e(s).loadingListDnsBlockedDomains?(i(),m(e(O),{key:1,title:e(t)("standalone.threat_shield_dns.local_blocklist_is_empty"),icon:e(K),class:"mt-4"},{default:n(()=>[o(e($),{kind:"primary",size:"lg",onClick:D},{prefix:n(()=>[o(b,{icon:e(Z),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("standalone.threat_shield_dns.add_domain")),1)]),_:1})]),_:1},8,["title","icon"])):(i(),m(ss,{key:2,filteredDomains:v.value,loading:e(s).loadingListDnsBlockedDomains,onEditDomain:y,onDeleteDomain:x,onReloadData:h,onClearFilters:d},null,8,["filteredDomains","loading"]))],64))],64))]),o(Ge,{isShown:a.value,currentDomain:c.value,onClose:p[1]||(p[1]=V=>a.value=!1),onReloadData:h},null,8,["isShown","currentDomain"]),o(ue,{visible:r.value,title:e(t)("standalone.threat_shield_dns.delete_domain"),deleteButtonLabel:e(t)("standalone.threat_shield_dns.delete_domain"),errorNotificationTitle:e(t)("error.cannot_delete_blocked_domain"),deleteFunction:()=>{var V;return e(s).deleteDnsBlockedDomain(((V=c.value)==null?void 0:V.address)||"")},onClose:p[2]||(p[2]=V=>r.value=!1),onReloadData:h},{default:n(()=>{var V;return[f(_(e(t)("standalone.threat_shield_dns.confirm_delete_domain",{name:(V=c.value)==null?void 0:V.address})),1)]}),_:1},8,["visible","title","deleteButtonLabel","errorNotificationTitle","deleteFunction"])])}}}),rs={class:"max-w-4xl"},ds={class:"space-y-8"},cs={class:"space-y-8"},us={class:"space-y-8"},_s=E({__name:"SettingsPanel",setup(C){const{t}=M(),s=I(),c=k(!1),a=k([]),r=k([""]),u=k(new Y),v=k([]),h=J(()=>s.dnsZones.map(d=>({id:d,label:d})));U(()=>s.dnsSettings,()=>{s.dnsSettings&&(c.value=s.dnsSettings.enabled,r.value=s.dnsSettings.ports,s.dnsZones.length&&(a.value=s.dnsSettings.zones.map(d=>h.value.find(l=>l.id===d))))},{immediate:!0}),U(()=>s.dnsZones,()=>{s.dnsSettings&&(a.value=s.dnsSettings.zones.map(d=>h.value.find(l=>l.id===d)))},{immediate:!0});async function D(){s.listDnsSettings(),s.listDnsZones()}function y(){s.errorEditDnsSettings="",s.errorEditDnsSettingsDetails="",u.value.clear(),v.value=[],r.value.forEach(()=>{v.value.push("")});let d=!0;if(!c.value)return!0;let l=Se(a.value);l.valid||(u.value.set("zones",[t(String(l.errMessage))]),d=!1);for(const[p,b]of r.value.entries()){const B=G(b);if(!B.valid){v.value[p]=t(B.errMessage),d=!1;continue}const S=we(b);S.valid||(v.value[p]=t(S.errMessage),d=!1)}return d}async function x(){if(y())try{await s.editDnsSettings({enabled:c.value,zones:a.value.map(l=>l.id),ports:r.value}),D()}catch{}}return q(()=>{D()}),(d,l)=>{const p=A("font-awesome-icon");return i(),w("div",null,[g("div",rs,[g("div",ds,[e(s).errorListDnsSettings?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_retrieve_threat_shield_settings"),description:e(s).errorListDnsSettings},z({_:2},[e(s).errorListDnsSettingsDetails?{name:"details",fn:n(()=>[f(_(e(s).errorListDnsSettingsDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):(i(),w(F,{key:1},[o(ae,{title:e(t)("standalone.threat_shield_dns.threat_shield_settings"),description:e(t)("standalone.threat_shield_dns.threat_shield_settings_description")},{default:n(()=>[g("div",cs,[e(s).loadingListDnsSettings?(i(),m(e(ke),{key:0,lines:11,size:"lg"})):(i(),w(F,{key:1},[o(e(ye),{"top-label":e(t)("standalone.threat_shield_dns.status"),label:c.value?e(t)("common.enabled"):e(t)("common.disabled"),modelValue:c.value,"onUpdate:modelValue":l[0]||(l[0]=b=>c.value=b)},null,8,["top-label","label","modelValue"]),c.value?(i(),w(F,{key:0},[o(e(Be),{label:e(t)("standalone.threat_shield_dns.zones"),modelValue:a.value,"onUpdate:modelValue":l[1]||(l[1]=b=>a.value=b),options:h.value,placeholder:e(s).loadingListDnsZones||e(s).loadingListDnsSettings?e(t)("common.loading"):e(t)("ne_combobox.choose_multiple"),multiple:"",disabled:e(s).loadingEditDnsSettings||e(s).loadingListDnsZones,invalidMessage:u.value.getFirstFor("zones"),optionalLabel:e(t)("common.optional"),noResultsLabel:e(t)("ne_combobox.no_results"),limitedOptionsLabel:e(t)("ne_combobox.limited_options_label"),noOptionsLabel:e(t)("ne_combobox.no_options_label"),"selected-label":e(t)("ne_combobox.selected"),"user-input-label":e(t)("ne_combobox.user_input_label")},{tooltip:n(()=>[o(e(te),null,{content:n(()=>[f(_(e(t)("standalone.threat_shield_dns.zones_tooltip")),1)]),_:1})]),_:1},8,["label","modelValue","options","placeholder","disabled","invalidMessage","optionalLabel","noResultsLabel","limitedOptionsLabel","noOptionsLabel","selected-label","user-input-label"]),o(Me,{modelValue:r.value,"onUpdate:modelValue":l[2]||(l[2]=b=>r.value=b),"add-item-label":e(t)("standalone.threat_shield_dns.add_port"),title:e(t)("standalone.threat_shield_dns.redirected_ports"),required:"",disabledInputs:e(s).loadingEditDnsSettings,"invalid-messages":v.value},{tooltip:n(()=>[o(e(te),null,{content:n(()=>[f(_(e(t)("standalone.threat_shield_dns.redirected_ports_tooltip")),1)]),_:1})]),_:1},8,["modelValue","add-item-label","title","disabledInputs","invalid-messages"])],64)):L("",!0)],64))])]),_:1},8,["title","description"]),l[4]||(l[4]=g("hr",null,null,-1)),o(ae,null,{default:n(()=>[g("div",us,[e(s).errorEditDnsSettings?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_save_threat_shield_settings"),description:e(s).errorEditDnsSettings},z({_:2},[e(s).errorEditDnsSettingsDetails?{name:"details",fn:n(()=>[f(_(e(s).errorEditDnsSettingsDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0),o(e($),{kind:"primary",disabled:e(s).loadingEditDnsSettings||e(s).loadingListDnsSettings,loading:e(s).loadingEditDnsSettings,onClick:l[3]||(l[3]=b=>x())},{prefix:n(()=>[o(p,{icon:["fas","floppy-disk"],class:"h-4 w-4","aria-hidden":"true"})]),default:n(()=>[f(" "+_(e(t)("common.save")),1)]),_:1},8,["disabled","loading"])])]),_:1})],64))])])])}}}),ms={class:"mb-4 max-w-2xl text-gray-500 dark:text-gray-400"},ys=E({__name:"ThreatShieldDnsView",setup(C){const{t}=M(),s=xe(),c=I(),a=ne(),{tabs:r,selectedTab:u}=Fe([{name:"blocklistSources",label:t("standalone.threat_shield_dns.blocklist_sources")},{name:"filterBypass",label:t("standalone.threat_shield_dns.filter_bypass")},{name:"localBlocklist",label:t("standalone.threat_shield_dns.local_blocklist")},{name:"settings",label:t("standalone.threat_shield_dns.settings")}]),v=k(!1),h=k({getFlashstartConfig:!1}),D=k({getFlashstartConfig:"",getFlashstartConfigDetails:""});q(()=>{c.listDnsSettings(),y(),s.getChanges()});async function y(){var x,d;h.value.getFlashstartConfig=!0;try{const l=await Le("ns.flashstart","get-config");v.value=(d=(x=l.data)==null?void 0:x.values)==null?void 0:d.enabled}catch(l){D.value.getFlashstartConfig=t(Ce(l)),D.value.getFlashstartConfigDetails=l.toString()}finally{h.value.getFlashstartConfig=!1}}return(x,d)=>{const l=A("font-awesome-icon");return i(),w("div",null,[o(e(Ve),{tag:"h3",class:"mb-7"},{default:n(()=>[f(_(e(t)("standalone.threat_shield_dns.title")),1)]),_:1}),g("div",ms,_(e(t)("standalone.threat_shield_dns.page_description")),1),e(c).errorListDnsSettings?(i(),m(e(T),{key:0,kind:"error",title:e(t)("error.cannot_retrieve_threat_shield_settings"),description:e(c).errorListDnsSettings,class:"mb-5"},z({_:2},[e(c).errorListDnsSettingsDetails?{name:"details",fn:n(()=>[f(_(e(c).errorListDnsSettingsDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):L("",!0),v.value?(i(),m(e(O),{key:1,title:e(t)("standalone.threat_shield_dns.threat_shield_dns_disabled"),description:e(t)("standalone.threat_shield_dns.threat_shield_dns_is_disabled_description"),icon:e(K),class:"pb-8"},{default:n(()=>[o(e($),{kind:"primary",onClick:d[0]||(d[0]=()=>{e(a).push(`${e(le)()}/security/flashstart`)})},{prefix:n(()=>[o(l,{icon:e(ie),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:n(()=>[f(" "+_(e(t)("common.go_to_page",{page:e(t)("standalone.flashstart.title")})),1)]),_:1})]),_:1},8,["title","description","icon"])):(i(),w(F,{key:2},[o(e($e),{selected:e(u),srSelectTabLabel:e(t)("ne_tabs.select_a_tab"),srTabsLabel:e(t)("ne_tabs.tabs"),tabs:e(r),class:"mb-8",onSelectTab:d[1]||(d[1]=p=>u.value=p)},null,8,["selected","srSelectTabLabel","srTabsLabel","tabs"]),e(u)==="blocklistSources"?(i(),m(Ie,{key:0})):L("",!0),e(u)==="filterBypass"?(i(),m(Qe,{key:1})):L("",!0),e(u)==="localBlocklist"?(i(),m(os,{key:2})):L("",!0),e(u)==="settings"?(i(),m(_s,{key:3})):L("",!0)],64))])}}});export{ys as default};

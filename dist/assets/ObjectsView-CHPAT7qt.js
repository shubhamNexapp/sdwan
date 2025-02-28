import{d as W,r as d,u as J,aa as be,c as Z,J as re,T as ae,e as ee,g as te,h as r,i as k,w as s,j as I,R as Q,k as a,l as e,Q as oe,ar as ve,s as de,m as u,t as c,a1 as Fe,q as F,z as E,ad as le,a0 as Me,_ as R,n as N,L as ne,M as ie,ai as _e,av as fe,ag as pe,V as ge,S as ue,bl as Se,a as Te,E as Be,aI as ye,bm as X,bn as Ue,bo as Ae,bp as Pe,bq as Re,aK as he,ak as je,al as K,am as we,an as ke,ao as G,B as De,ap as xe,aq as He,v as ze,Y as Ne,U as Ve,o as Ce,br as ce,aj as se,bs as Ee,bt as qe,W as Ke,a9 as Ge}from"./index-BlEQ5104.js";import{u as We}from"./useTabs-BeLQ169O.js";import{c as Ye}from"./cloneDeep-CNXUQFZv.js";import{_ as Je,u as Qe,a as Xe}from"./useDomainSets-DcuIzYPq.js";import{u as Ze}from"./useObjects-D-lIOcFM.js";import{_ as Ie}from"./DeleteModal.vue_vue_type_script_setup_true_lang-DxXJd-w5.js";import{a as et,_ as Le}from"./CannotDeleteObjectModal.vue_vue_type_script_setup_true_lang-CreS7bAa.js";import{u as Oe}from"./objects-B0tOUNaX.js";import{_ as tt}from"./NeMultiTextInput.vue_vue_type_script_setup_true_lang-DwfeP71-.js";import"./_initCloneObject-z8l5qNBF.js";import"./isArrayLikeObject-CpCvCe5A.js";const at={class:"space-y-6"},st={class:"space-y-3"},ot={key:0,class:fe("mt-2 text-sm text-rose-700 dark:text-rose-400")},lt={class:"flex justify-end"},nt=W({__name:"CreateOrEditHostSetDrawer",props:{isShown:{type:Boolean,default:!1},currentHostSet:{type:Object},allObjects:{type:Array,required:!0},recordOptions:{type:Array}},emits:["close","reloadData"],setup(D,{emit:o}){const i=D,f=o,t=d(""),{t:n}=J(),h=d(""),B=d(),L=d("ipv4"),x=d([""]),V=d(),y=d(new be),b=d(),v=d({saveHostSet:!1}),O=d({saveHostSet:"",saveHostSetDetails:""}),C=d([{id:"ipv4",label:"IPv4"},{id:"ipv6",label:"IPv6"}]),j=Z(()=>{var l;const _=i.allObjects.filter(m=>m.ipaddr.some(S=>S.includes("-"))).map(m=>m.id);return(l=i.recordOptions)==null?void 0:l.filter(m=>{var S;return m.id!==((S=i.currentHostSet)==null?void 0:S.id)&&!_.includes(m.id)})}),U=Z(()=>{var _;return(_=i.allObjects)==null?void 0:_.filter(l=>{var m;return l.id!==((m=i.currentHostSet)==null?void 0:m.id)})});re(()=>i.isShown,()=>{i.isShown&&(A(),ae(B),i.currentHostSet?(h.value=i.currentHostSet.name,L.value=i.currentHostSet.family,x.value=Ye(i.currentHostSet.ipaddr)):(h.value="",L.value="ipv4",x.value=[""]))}),re(()=>{var _;return(_=i.currentHostSet)==null?void 0:_.matches},async _=>{_?t.value=await q(_):t.value=""});function p(){f("close")}function A(){y.value.clear(),O.value.saveHostSet="",O.value.saveHostSetDetails=""}function z(_,l,m){for(let S of _)S.valid||(y.value.set(l,[S.errMessage]),b.value||(b.value=m));return _.every(S=>S.valid)}async function q(_){try{const l=await ee("ns.objects","get-info",{ids:_}),m=[];for(const S of Object.values(l.data.info))S.type=="redirect"&&m.push(S.name);return m.join(", ")}catch(l){return console.error("Error fetching getMatchedItemsName:",l),""}}function Y(_){for(const l of _)if(l.includes("-")&&t.value)return{valid:!1,errMessage:"standalone.objects.range_not_compatible_with_port_forward"};return{valid:!0}}function $(_){for(const l of _)if(l.includes("objects/")&&t.value)return{valid:!1,errMessage:"standalone.objects.objects_are_not_compatible_with_port_forward"};return{valid:!0}}function g(_){var l;return(l=U.value)!=null&&l.find(m=>m.name===_&&m.subtype==="host_set")?{valid:!1,errMessage:"standalone.objects.host_set_already_exists"}:{valid:!0}}function H(){const _=[[[ue(h.value),Se(h.value,!0),g(h.value)],"name",B],[[$(x.value),Y(x.value),ue(x.value[0])],"ipaddr",V]];b.value=void 0;const l=_.map(([m,S,w])=>z(m,S,w)).every(m=>m);return b.value&&ae(b.value),l}async function M(){if(A(),!H())return;v.value.saveHostSet=!0;const l={name:h.value,family:L.value,ipaddr:x.value};i.currentHostSet&&(l.id=i.currentHostSet.id.replace("objects/",""));const m=i.currentHostSet?"edit-host-set":"add-host-set";try{await ee("ns.objects",m,l),f("reloadData"),p()}catch(S){console.error(S),S instanceof pe?y.value=S.errorBag:(O.value.saveHostSet=n(ge(S)),O.value.saveHostSetDetails=S.toString())}finally{v.value.saveHostSet=!1}}function T(){x.value.push("")}function P(_){x.value.splice(_,1)}return(_,l)=>{const m=te("font-awesome-icon");return r(),k(e(_e),{isShown:D.isShown,title:D.currentHostSet?e(n)("standalone.objects.edit_host_set"):e(n)("standalone.objects.add_host_set"),closeAriaLabel:e(n)("common.shell.close_side_drawer"),onClose:p},{default:s(()=>[I("form",{onSubmit:l[2]||(l[2]=Q(()=>{},["prevent"]))},[I("div",at,[a(e(oe),{label:e(n)("standalone.objects.name"),modelValue:h.value,"onUpdate:modelValue":l[0]||(l[0]=S=>h.value=S),modelModifiers:{trim:!0},invalidMessage:e(n)(y.value.getFirstI18nKeyFor("name")),helperText:e(n)("standalone.objects.name_helper"),disabled:v.value.saveHostSet,maxlength:"16",ref_key:"nameRef",ref:B},null,8,["label","modelValue","invalidMessage","helperText","disabled"]),a(e(ve),{modelValue:L.value,"onUpdate:modelValue":l[1]||(l[1]=S=>L.value=S),disabled:v.value.saveHostSet,label:e(n)("standalone.objects.ip_version"),options:C.value},{tooltip:s(()=>[a(e(de),{placement:"top-start"},{content:s(()=>[u(c(e(n)("standalone.objects.ip_family_host_set_tooltip")),1)]),_:1})]),_:1},8,["modelValue","disabled","label","options"]),I("div",null,[a(e(Fe),null,{default:s(()=>[u(c(e(n)("standalone.objects.records"))+" ",1),a(e(de),{class:"ml-1"},{content:s(()=>[u(c(e(n)("standalone.objects.host_set_records_tooltip")),1)]),_:1})]),_:1}),I("div",st,[(r(!0),F(E,null,le(x.value,(S,w)=>(r(),F("div",{key:S+w,class:"flex items-start gap-2"},[(r(),k(e(Me),{key:S+w,modelValue:x.value[w],"onUpdate:modelValue":me=>x.value[w]=me,disabled:v.value.saveHostSet,options:j.value,placeholder:e(n)("ne_combobox.choose_or_enter"),acceptUserInput:"",optionalLabel:e(n)("common.optional"),noResultsLabel:e(n)("ne_combobox.no_results"),limitedOptionsLabel:e(n)("ne_combobox.limited_options_label"),noOptionsLabel:e(n)("ne_combobox.no_options_label"),"selected-label":e(n)("ne_combobox.selected"),"user-input-label":e(n)("ne_combobox.user_input_label"),class:"grow"},null,8,["modelValue","onUpdate:modelValue","disabled","options","placeholder","optionalLabel","noResultsLabel","limitedOptionsLabel","noOptionsLabel","selected-label","user-input-label"])),a(e(R),{kind:"tertiary",size:"md",onClick:me=>P(w),disabled:w<1},{default:s(()=>[a(m,{icon:["fas","trash"],class:"h-4 w-4 py-1","aria-hidden":"true"})]),_:2},1032,["onClick","disabled"])]))),128)),y.value.getFirstI18nKeyFor("ipaddr")?(r(),F("p",ot,c(e(n)(y.value.getFirstI18nKeyFor("ipaddr"),{name:t.value})),1)):N("",!0),a(e(R),{class:"mt-4",size:"md",onClick:T,kind:"secondary"},{prefix:s(()=>[a(m,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(n)("standalone.objects.add_record")),1)]),_:1})])]),O.value.saveHostSet?(r(),k(e(ne),{key:0,kind:"error",title:e(n)("error.cannot_save_host_set"),description:O.value.saveHostSet},ie({_:2},[O.value.saveHostSetDetails?{name:"details",fn:s(()=>[u(c(O.value.saveHostSetDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):N("",!0)]),l[3]||(l[3]=I("hr",{class:"my-8 border-gray-200 dark:border-gray-700"},null,-1)),I("div",lt,[a(e(R),{kind:"tertiary",size:"lg",onClick:Q(p,["prevent"]),disabled:v.value.saveHostSet,class:"mr-3"},{default:s(()=>[u(c(e(n)("common.cancel")),1)]),_:1},8,["disabled"]),a(e(R),{kind:"primary",size:"lg",onClick:Q(M,["prevent"]),disabled:v.value.saveHostSet,loading:v.value.saveHostSet},{default:s(()=>[u(c(D.currentHostSet?e(n)("standalone.objects.save_host_set"):e(n)("standalone.objects.add_host_set")),1)]),_:1},8,["disabled","loading"])])],32)]),_:1},8,["isShown","title","closeAriaLabel"])}}}),it={class:"flex flex-wrap gap-3"},rt={key:0},dt={key:1},ut=W({__name:"HostSetRecords",props:{records:{type:Array,required:!0},allHostSets:{type:Array}},setup(D){return(o,i)=>(r(),F("div",it,[(r(!0),F(E,null,le(D.records,f=>(r(),F("span",{key:f},[f.includes("/ns_")?(r(),F("span",rt,[a(Je,{hostSetId:f,allHostSets:D.allHostSets},null,8,["hostSetId","allHostSets"])])):(r(),F("span",dt,c(f),1))]))),128))]))}}),ct={class:"flex items-center gap-2"},mt={class:"-ml-2.5 flex items-center gap-2 xl:ml-0 xl:justify-end"},bt=W({__name:"HostSetsTable",props:{filteredHostSets:{type:Array},allHostSets:{type:Array},loading:{type:Boolean,required:!0}},emits:["editHostSet","deleteHostSet","showUsagesHostSet"],setup(D,{emit:o}){const i=D,f=o,{t}=J(),n=Te(),h=Be(),{getObjectIcon:B}=Ze(),L=d(10),{currentPage:x,paginatedItems:V}=ye(()=>i.filteredHostSets,{itemsPerPage:L});X.add(Ue),X.add(Ae),X.add(Pe),X.add(Re);function y(C){const j=[{id:"showUsagesHostSet",label:t("standalone.objects.show_usages"),icon:"magnifying-glass-plus",iconStyle:"fas",action:()=>f("showUsagesHostSet",C),disabled:!C.used,danger:!1}];return b(C)&&j.push({id:"deleteHostSet",label:t("common.delete"),icon:"trash",iconStyle:"fas",danger:!0,action:()=>f("deleteHostSet",C),disabled:!1}),j}function b(C){return["host_set","host","cidr","range"].includes(C.subtype)}function v(C){let j="";switch(C){case"dhcp_static_lease":j="network/dns-dhcp?tab=static-leases";break;case"dns_record":j="network/dns-dhcp?tab=dns-records";break;case"vpn_user":j="vpn/openvpn-rw"}n.push(`${ze(h)}/${j}`)}function O(C){switch(C){case"dhcp_static_lease":return t("common.go_to_page",{page:t("standalone.dns_dhcp.tabs.static_leases")});case"dns_record":return t("common.go_to_page",{page:t("standalone.dns_dhcp.tabs.dns_records")});case"vpn_user":return t("standalone.objects.go_to_rw_accounts")}}return(C,j)=>{const U=te("font-awesome-icon");return r(),k(e(He),{ariaLabel:e(t)("standalone.objects.host_sets"),cardBreakpoint:"xl",loading:D.loading,skeletonRows:6},{paginator:s(()=>{var p;return[a(e(he),{"current-page":e(x),"total-rows":(p=i.filteredHostSets)==null?void 0:p.length,"page-size":L.value,"nav-pagination-label":e(t)("ne_table.pagination"),"next-label":e(t)("ne_table.go_to_next_page"),"previous-label":e(t)("ne_table.go_to_previous_page"),"range-of-total-label":e(t)("ne_table.of"),"page-size-label":e(t)("ne_table.show"),onSelectPage:j[0]||(j[0]=A=>{x.value=A}),onSelectPageSize:j[1]||(j[1]=A=>{L.value=A})},null,8,["current-page","total-rows","page-size","nav-pagination-label","next-label","previous-label","range-of-total-label","page-size-label"])]}),default:s(()=>[a(e(je),null,{default:s(()=>[a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.name")),1)]),_:1}),a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.type")),1)]),_:1}),a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.ip_version")),1)]),_:1}),a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.records")),1)]),_:1}),a(e(K))]),_:1}),a(e(we),null,{default:s(()=>[(r(!0),F(E,null,le(e(V),p=>(r(),k(e(ke),{key:p.id},{default:s(()=>[a(e(G),{"data-label":e(t)("standalone.objects.name")},{default:s(()=>[I("div",ct,[a(U,{icon:e(B)(p.subtype),class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"]),u(" "+c(p.name)+" ",1),p.used?N("",!0):(r(),k(e(De),{key:0,kind:"secondary",text:e(t)("standalone.objects.not_used"),size:"xs",class:"shrink-0"},null,8,["text"]))])]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("standalone.objects.type")},{default:s(()=>[u(c(e(t)(`standalone.objects.subtype_${p.subtype}`)),1)]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("standalone.objects.ip_version")},{default:s(()=>[p.family==="ipv4"?(r(),F(E,{key:0},[u(" IPv4 ")],64)):p.family==="ipv6"?(r(),F(E,{key:1},[u(" IPv6 ")],64)):(r(),F(E,{key:2},[u(" - ")],64))]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("standalone.objects.records")},{default:s(()=>[a(ut,{records:p.ipaddr,allHostSets:D.allHostSets},null,8,["records","allHostSets"])]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("common.actions")},{default:s(()=>[I("div",mt,[b(p)?(r(),k(e(R),{key:0,kind:"tertiary",size:"lg",onClick:A=>f("editHostSet",p)},{prefix:s(()=>[a(U,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(t)("common.edit")),1)]),_:2},1032,["onClick"])):(r(),k(e(R),{key:1,kind:"tertiary",onClick:A=>v(p.subtype),class:"shrink-0"},{prefix:s(()=>[a(U,{icon:["fas","arrow-right"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[u(" "+c(O(p.subtype)),1)]),_:2},1032,["onClick"])),a(e(xe),{items:y(p),alignToRight:!0},null,8,["items"])])]),_:2},1032,["data-label"])]),_:2},1024))),128))]),_:1})]),_:1},8,["ariaLabel","loading"])}}}),$e=W({__name:"ObjectUsagesModal",props:{visible:{type:Boolean,required:!0},objectName:{type:String,required:!0},usageIds:{type:Array,required:!0},showGoToObjectsButton:{type:Boolean,required:!0}},emits:["close"],setup(D,{emit:o}){const i=o,{t:f}=J();return(t,n)=>(r(),k(e(Ne),{visible:D.visible,title:e(f)("standalone.objects.name_usages",{name:D.objectName}),kind:"info",primaryLabel:e(f)("common.close"),cancelLabel:"",closeAriaLabel:e(f)("common.close"),onClose:n[0]||(n[0]=h=>i("close")),onPrimaryClick:n[1]||(n[1]=h=>i("close"))},{default:s(()=>[a(et,{usageIds:D.usageIds,showGoToObjectsButton:D.showGoToObjectsButton},null,8,["usageIds","showGoToObjectsButton"])]),_:1},8,["visible","title","primaryLabel","closeAriaLabel"]))}}),vt={class:"text-sm"},_t={class:"mb-8 flex flex-col items-start justify-between gap-6 xl:flex-row"},ft={class:"max-w-2xl text-gray-500 dark:text-gray-400"},pt={class:"space-y-6"},gt={class:"flex items-center gap-4"},St=W({__name:"HostSets",setup(D){const{t:o}=J(),{hostSets:i,listHostSets:f,loadingListHostSets:t,errorListHostSets:n,errorListHostSetsDetails:h,hostSetsComboboxOptions:B,searchStringInHostSet:L}=Qe(),x=Oe(),V=Ve(),y=d(void 0),b=d(""),v=d([]),O=d(!1),C=d(!1),j=d(!1),U=d(!1),p=d(""),A=d([]),z=d(["any"]),q=d([{id:"host",label:o("standalone.objects.subtype_host")},{id:"cidr",label:o("standalone.objects.subtype_cidr")},{id:"range",label:o("standalone.objects.subtype_range")},{id:"dhcp_static_lease",label:o("standalone.objects.subtype_dhcp_static_lease")},{id:"dns_record",label:o("standalone.objects.subtype_dns_record")},{id:"host_set",label:o("standalone.objects.subtype_host_set")},{id:"vpn_user",label:o("standalone.objects.subtype_vpn_user")},{id:"domain_set",label:o("standalone.objects.subtype_domain_set")}]),Y=d([{id:"any",label:o("common.any")},{id:"ipv4",label:"IPv4"},{id:"ipv6",label:"IPv6"}]),$=Z(()=>i.value.filter(l=>{const m=!p.value||L(l,p.value),S=!A.value.length||A.value.includes(l.subtype),w=z.value[0]=="any"||z.value.includes(l.family);return m&&S&&w}));Ce(()=>{g()});function g(){f(),x.load(),V.getChanges()}function H(){y.value=void 0,O.value=!0}function M(l){y.value=l,O.value=!0}function T(l){y.value=l,l.used?(v.value=l.matches||[],b.value=l.name,U.value=!0):C.value=!0}function P(l){v.value=l.matches||[],b.value=l.name,j.value=!0}function _(){p.value="",A.value=[],z.value=["any"]}return(l,m)=>{const S=te("FontAwesomeIcon");return r(),F("div",vt,[I("div",_t,[I("div",ft,c(e(o)("standalone.objects.host_sets_page_description")),1),e(t)||e(i).length?(r(),k(e(R),{key:0,kind:"secondary",size:"lg",onClick:H,class:"shrink-0",disabled:e(t)},{prefix:s(()=>[a(S,{icon:["fas","circle-plus"],"aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(o)("standalone.objects.add_host_set")),1)]),_:1},8,["disabled"])):N("",!0)]),I("div",pt,[e(n)?(r(),k(e(ne),{key:0,kind:"error",title:e(o)("error.cannot_retrieve_host_sets"),description:e(n),class:"mb-5"},ie({_:2},[e(h)?{name:"details",fn:s(()=>[u(c(e(h)),1)]),key:"0"}:void 0]),1032,["title","description"])):N("",!0),I("div",gt,[a(e(oe),{placeholder:e(o)("standalone.objects.filter_host_sets"),modelValue:p.value,"onUpdate:modelValue":m[0]||(m[0]=w=>p.value=w),modelModifiers:{trim:!0},disabled:e(t),class:"max-w-xs"},null,8,["placeholder","modelValue","disabled"]),a(e(ce),{modelValue:A.value,"onUpdate:modelValue":m[1]||(m[1]=w=>A.value=w),kind:"checkbox",label:e(o)("standalone.objects.type"),options:q.value,clearFilterLabel:e(o)("ne_dropdown_filter.clear_filter"),openMenuAriaLabel:e(o)("ne_dropdown_filter.open_filter")},null,8,["modelValue","label","options","clearFilterLabel","openMenuAriaLabel"]),a(e(ce),{modelValue:z.value,"onUpdate:modelValue":m[2]||(m[2]=w=>z.value=w),kind:"radio",label:e(o)("standalone.objects.ip_version"),options:Y.value,clearFilterLabel:e(o)("ne_dropdown_filter.clear_filter"),openMenuAriaLabel:e(o)("ne_dropdown_filter.open_filter")},null,8,["modelValue","label","options","clearFilterLabel","openMenuAriaLabel"]),a(e(R),{kind:"tertiary",onClick:_,disabled:e(t)},{default:s(()=>[u(c(e(o)("common.clear_filters")),1)]),_:1},8,["disabled"])]),!e(i).length&&!e(t)?(r(),k(e(se),{key:1,title:e(o)("standalone.objects.no_host_sets"),icon:["fas","circle-info"],class:"mt-4"},{default:s(()=>[a(e(R),{kind:"secondary",size:"lg",onClick:H,class:"shrink-0",disabled:e(t)},{prefix:s(()=>[a(S,{icon:["fas","circle-plus"],"aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(o)("standalone.objects.add_host_set")),1)]),_:1},8,["disabled"])]),_:1},8,["title"])):!$.value.length&&!e(t)?(r(),k(e(se),{key:2,title:e(o)("standalone.objects.no_hosts_found"),description:e(o)("common.try_changing_search_filters"),icon:["fas","circle-info"],class:"mt-4"},{default:s(()=>[a(e(R),{kind:"tertiary",onClick:_},{default:s(()=>[u(c(e(o)("common.clear_filters")),1)]),_:1})]),_:1},8,["title","description"])):(r(),k(bt,{key:3,loading:e(t),filteredHostSets:$.value,allHostSets:e(i),onEditHostSet:M,onDeleteHostSet:T,onShowUsagesHostSet:P},null,8,["loading","filteredHostSets","allHostSets"]))]),a(nt,{isShown:O.value,currentHostSet:y.value,allObjects:e(i),recordOptions:e(B),onClose:m[3]||(m[3]=w=>O.value=!1),onReloadData:g},null,8,["isShown","currentHostSet","allObjects","recordOptions"]),a(Ie,{visible:C.value,title:e(o)("standalone.objects.delete_host_set"),deleteButtonLabel:e(o)("standalone.objects.delete_host_set"),errorNotificationTitle:e(o)("error.cannot_delete_host_set"),deleteFunction:()=>{var w;return e(ee)("ns.objects","delete-host-set",{id:(w=y.value)==null?void 0:w.id.replace("objects/","")})},onClose:m[4]||(m[4]=w=>C.value=!1),onReloadData:g},{default:s(()=>{var w;return[u(c(e(o)("standalone.objects.confirm_delete_host_set",{name:(w=y.value)==null?void 0:w.name})),1)]}),_:1},8,["visible","title","deleteButtonLabel","errorNotificationTitle","deleteFunction"]),a(Le,{visible:U.value,objectName:b.value,usageIds:v.value,showGoToObjectsButton:!1,onClose:m[5]||(m[5]=w=>U.value=!1)},null,8,["visible","objectName","usageIds"]),a($e,{visible:j.value,objectName:b.value,usageIds:v.value,showGoToObjectsButton:!1,onClose:m[6]||(m[6]=w=>j.value=!1)},null,8,["visible","objectName","usageIds"])])}}}),yt={class:"space-y-6"},ht={key:0,class:fe("mt-2 text-sm text-rose-700 dark:text-rose-400")},jt={class:"flex justify-end"},wt=W({__name:"CreateOrEditDomainSetDrawer",props:{isShown:{type:Boolean,default:!1},currentDomainSet:{type:Object},allDomainSets:{type:Array,required:!0}},emits:["close","reloadData"],setup(D,{emit:o}){const i=D,f=o,{t}=J(),n=d(""),h=d(),B=d("ipv4"),L=d([""]),x=d(),V=d(new be),y=d(),b=d({saveDomainSet:!1}),v=d({saveDomainSet:"",saveDomainSetDetails:""}),O=d([{id:"ipv4",label:"IPv4"},{id:"ipv6",label:"IPv6"}]),C=Z(()=>{var $;return($=i.allDomainSets)==null?void 0:$.filter(g=>{var H;return g.id!==((H=i.currentDomainSet)==null?void 0:H.id)})});re(()=>i.isShown,()=>{i.isShown&&(U(),ae(h),i.currentDomainSet?(n.value=i.currentDomainSet.name,B.value=i.currentDomainSet.family,L.value=i.currentDomainSet.domain):(n.value="",B.value="ipv4",L.value=[""]))});function j(){f("close")}function U(){V.value.clear(),v.value.saveDomainSet="",v.value.saveDomainSetDetails=""}function p($,g,H){for(let M of $)M.valid||(V.value.set(g,[M.errMessage]),y.value||(y.value=H));return $.every(M=>M.valid)}function A(){for(const $ of L.value){if(!$)return{valid:!1,errMessage:"error.empty_domains"};const{valid:g}=Ee($);if(!g)return{valid:!1,errMessage:"error.invalid_domains"}}return{valid:!0}}function z($){var g;return(g=C.value)!=null&&g.find(H=>H.name===$)?{valid:!1,errMessage:"standalone.objects.domain_set_already_exists"}:{valid:!0}}function q(){const $=[[[ue(n.value),Se(n.value,!0),z(n.value)],"name",h],[[A()],"domain",x]];y.value=void 0;const g=$.map(([H,M,T])=>p(H,M,T)).every(H=>H);return y.value&&ae(y.value),g}async function Y(){if(U(),!q())return;b.value.saveDomainSet=!0;const g={name:n.value,family:B.value,domain:L.value};i.currentDomainSet&&(g.id=i.currentDomainSet.id.replace("objects/",""));const H=i.currentDomainSet?"edit-domain-set":"add-domain-set";try{await ee("ns.objects",H,g),f("reloadData"),j()}catch(M){console.error(M),M instanceof pe?V.value=M.errorBag:(v.value.saveDomainSet=t(ge(M)),v.value.saveDomainSetDetails=M.toString())}finally{b.value.saveDomainSet=!1}}return($,g)=>(r(),k(e(_e),{isShown:D.isShown,title:i.currentDomainSet?e(t)("standalone.objects.edit_domain_set"):e(t)("standalone.objects.add_domain_set"),closeAriaLabel:e(t)("common.shell.close_side_drawer"),onClose:j},{default:s(()=>[I("form",{onSubmit:g[3]||(g[3]=Q(()=>{},["prevent"]))},[I("div",yt,[a(e(oe),{label:e(t)("standalone.objects.name"),modelValue:n.value,"onUpdate:modelValue":g[0]||(g[0]=H=>n.value=H),modelModifiers:{trim:!0},invalidMessage:e(t)(V.value.getFirstI18nKeyFor("name")),helperText:e(t)("standalone.objects.name_helper"),disabled:b.value.saveDomainSet,maxlength:"16",ref_key:"nameRef",ref:h},null,8,["label","modelValue","invalidMessage","helperText","disabled"]),a(e(ve),{modelValue:B.value,"onUpdate:modelValue":g[1]||(g[1]=H=>B.value=H),disabled:b.value.saveDomainSet,label:e(t)("standalone.objects.ip_version"),options:O.value},{tooltip:s(()=>[a(e(de),{placement:"top-start"},{content:s(()=>[u(c(e(t)("standalone.objects.ip_family_domain_set_tooltip")),1)]),_:1})]),_:1},8,["modelValue","disabled","label","options"]),a(tt,{title:e(t)("standalone.objects.domains"),"add-item-label":e(t)("standalone.objects.add_domain"),"disable-inputs":b.value.saveDomainSet,"disable-add-button":b.value.saveDomainSet,modelValue:L.value,"onUpdate:modelValue":g[2]||(g[2]=H=>L.value=H),required:""},null,8,["title","add-item-label","disable-inputs","disable-add-button","modelValue"]),V.value.getFirstI18nKeyFor("domain")?(r(),F("p",ht,c(e(t)(V.value.getFirstI18nKeyFor("domain"))),1)):N("",!0),v.value.saveDomainSet?(r(),k(e(ne),{key:1,kind:"error",title:e(t)("error.cannot_save_domain_set"),description:v.value.saveDomainSet},ie({_:2},[v.value.saveDomainSetDetails?{name:"details",fn:s(()=>[u(c(v.value.saveDomainSetDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):N("",!0)]),g[4]||(g[4]=I("hr",{class:"my-8 border-gray-200 dark:border-gray-700"},null,-1)),I("div",jt,[a(e(R),{kind:"tertiary",size:"lg",onClick:Q(j,["prevent"]),disabled:b.value.saveDomainSet,class:"mr-3"},{default:s(()=>[u(c(e(t)("common.cancel")),1)]),_:1},8,["disabled"]),a(e(R),{kind:"primary",size:"lg",onClick:Q(Y,["prevent"]),disabled:b.value.saveDomainSet,loading:b.value.saveDomainSet},{default:s(()=>[u(c(i.currentDomainSet?e(t)("standalone.objects.save_domain_set"):e(t)("standalone.objects.add_domain_set")),1)]),_:1},8,["disabled","loading"])])],32)]),_:1},8,["isShown","title","closeAriaLabel"]))}}),kt={class:"flex items-center gap-2"},Dt={class:"-ml-2.5 flex items-center gap-2 xl:ml-0 xl:justify-end"},xt=W({__name:"DomainSetsTable",props:{filteredDomainSets:{type:Array},loading:{type:Boolean,required:!0}},emits:["editDomainSet","deleteDomainSet","showUsagesDomainSet"],setup(D,{emit:o}){const i=D,f=o,{t}=J(),n=d(10),{currentPage:h,paginatedItems:B}=ye(()=>i.filteredDomainSets,{itemsPerPage:n});X.add(qe);function L(x){return[{id:"showUsagesDomainSet",label:t("standalone.objects.show_usages"),icon:"magnifying-glass-plus",iconStyle:"fas",action:()=>f("showUsagesDomainSet",x),disabled:!x.used},{id:"deleteDomainSet",label:t("common.delete"),icon:"trash",iconStyle:"fas",danger:!0,action:()=>f("deleteDomainSet",x)}]}return(x,V)=>{const y=te("font-awesome-icon");return r(),k(e(He),{ariaLabel:e(t)("standalone.objects.domain_sets"),cardBreakpoint:"xl",loading:D.loading,skeletonRows:6},{paginator:s(()=>{var b;return[a(e(he),{"current-page":e(h),"total-rows":(b=i.filteredDomainSets)==null?void 0:b.length,"page-size":n.value,"nav-pagination-label":e(t)("ne_table.pagination"),"next-label":e(t)("ne_table.go_to_next_page"),"previous-label":e(t)("ne_table.go_to_previous_page"),"range-of-total-label":e(t)("ne_table.of"),"page-size-label":e(t)("ne_table.show"),onSelectPage:V[0]||(V[0]=v=>{h.value=v}),onSelectPageSize:V[1]||(V[1]=v=>{n.value=v})},null,8,["current-page","total-rows","page-size","nav-pagination-label","next-label","previous-label","range-of-total-label","page-size-label"])]}),default:s(()=>[a(e(je),null,{default:s(()=>[a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.name")),1)]),_:1}),a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.ip_version")),1)]),_:1}),a(e(K),null,{default:s(()=>[u(c(e(t)("standalone.objects.domains")),1)]),_:1}),a(e(K))]),_:1}),a(e(we),null,{default:s(()=>[(r(!0),F(E,null,le(e(B),b=>(r(),k(e(ke),{key:b.id},{default:s(()=>[a(e(G),{"data-label":e(t)("standalone.objects.name")},{default:s(()=>[I("div",kt,[a(y,{icon:["fas","cloud"],class:"h-4 w-4","aria-hidden":"true"}),u(" "+c(b.name)+" ",1),b.used?N("",!0):(r(),k(e(De),{key:0,kind:"secondary",text:e(t)("standalone.objects.not_used"),size:"xs",class:"shrink-0"},null,8,["text"]))])]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("standalone.objects.ip_version")},{default:s(()=>[b.family==="ipv4"?(r(),F(E,{key:0},[u(" IPv4 ")],64)):b.family==="ipv6"?(r(),F(E,{key:1},[u(" IPv6 ")],64)):(r(),F(E,{key:2},[u(" - ")],64))]),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("standalone.objects.domains")},{default:s(()=>{var v;return[u(c((v=b.domain)==null?void 0:v.join(", ")),1)]}),_:2},1032,["data-label"]),a(e(G),{"data-label":e(t)("common.actions")},{default:s(()=>[I("div",Dt,[a(e(R),{kind:"tertiary",size:"lg",onClick:v=>f("editDomainSet",b)},{prefix:s(()=>[a(y,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(t)("common.edit")),1)]),_:2},1032,["onClick"]),a(e(xe),{items:L(b),alignToRight:!0},null,8,["items"])])]),_:2},1032,["data-label"])]),_:2},1024))),128))]),_:1})]),_:1},8,["ariaLabel","loading"])}}}),Ht={class:"text-sm"},Vt={class:"mb-8 flex flex-col items-start justify-between gap-6 xl:flex-row"},Ct={class:"max-w-2xl text-gray-500 dark:text-gray-400"},It={class:"space-y-6"},Lt={class:"flex items-center gap-4"},Ot=W({__name:"DomainSets",setup(D){const{t:o}=J(),i=Ve(),{domainSets:f,listDomainSets:t,loadingListDomainSets:n,errorListDomainSets:h,errorListDomainSetsDetails:B,searchStringInDomainSet:L}=Xe(),x=Oe(),V=d(void 0),y=d(""),b=d([]),v=d(!1),O=d(!1),C=d(!1),j=d(!1),U=d(""),p=d(["any"]),A=d([{id:"any",label:o("common.any")},{id:"ipv4",label:"IPv4"},{id:"ipv6",label:"IPv6"}]),z=Z(()=>f.value.filter(T=>{const P=!U.value||L(T,U.value),_=p.value[0]=="any"||p.value.includes(T.family);return P&&_}));Ce(()=>{q()});function q(){t(),x.load(),i.getChanges()}function Y(){V.value=void 0,v.value=!0}function $(T){V.value=T,v.value=!0}function g(T){V.value=T,T.used?(b.value=T.matches||[],y.value=T.name,j.value=!0):O.value=!0}function H(T){b.value=T.matches||[],y.value=T.name,C.value=!0}function M(){U.value="",p.value=["any"]}return(T,P)=>{const _=te("FontAwesomeIcon");return r(),F("div",Ht,[I("div",Vt,[I("div",Ct,c(e(o)("standalone.objects.domain_sets_page_description")),1),e(n)||e(f).length?(r(),k(e(R),{key:0,kind:"secondary",size:"lg",onClick:Y,disabled:e(n),class:"shrink-0"},{prefix:s(()=>[a(_,{icon:["fas","circle-plus"],"aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(o)("standalone.objects.add_domain_set")),1)]),_:1},8,["disabled"])):N("",!0)]),I("div",It,[e(h)?(r(),k(e(ne),{key:0,kind:"error",title:e(o)("error.cannot_retrieve_domain_sets"),description:e(h),class:"mb-5"},ie({_:2},[e(B)?{name:"details",fn:s(()=>[u(c(e(B)),1)]),key:"0"}:void 0]),1032,["title","description"])):N("",!0),I("div",Lt,[a(e(oe),{placeholder:e(o)("standalone.objects.filter_domain_sets"),modelValue:U.value,"onUpdate:modelValue":P[0]||(P[0]=l=>U.value=l),modelModifiers:{trim:!0},disabled:e(n),class:"max-w-xs"},null,8,["placeholder","modelValue","disabled"]),a(e(ce),{modelValue:p.value,"onUpdate:modelValue":P[1]||(P[1]=l=>p.value=l),kind:"radio",label:e(o)("standalone.objects.ip_version"),options:A.value,clearFilterLabel:e(o)("ne_dropdown_filter.clear_filter"),openMenuAriaLabel:e(o)("ne_dropdown_filter.open_filter")},null,8,["modelValue","label","options","clearFilterLabel","openMenuAriaLabel"]),a(e(R),{kind:"tertiary",onClick:M,disabled:e(n)},{default:s(()=>[u(c(e(o)("common.clear_filters")),1)]),_:1},8,["disabled"])]),!e(f).length&&!e(n)?(r(),k(e(se),{key:1,title:e(o)("standalone.objects.no_domain_sets"),icon:["fas","circle-info"],class:"mt-4"},{default:s(()=>[a(e(R),{kind:"secondary",size:"lg",onClick:Y,class:"shrink-0",disabled:e(n)},{prefix:s(()=>[a(_,{icon:["fas","circle-plus"],"aria-hidden":"true"})]),default:s(()=>[u(" "+c(e(o)("standalone.objects.add_domain_set")),1)]),_:1},8,["disabled"])]),_:1},8,["title"])):!z.value.length&&!e(n)?(r(),k(e(se),{key:2,title:e(o)("standalone.objects.no_domain_sets_found"),description:e(o)("common.try_changing_search_filters"),icon:["fas","circle-info"],class:"mt-4"},{default:s(()=>[a(e(R),{kind:"tertiary",onClick:M},{default:s(()=>[u(c(e(o)("common.clear_filters")),1)]),_:1})]),_:1},8,["title","description"])):(r(),k(xt,{key:3,loading:e(n),filteredDomainSets:z.value,onEditDomainSet:$,onDeleteDomainSet:g,onShowUsagesDomainSet:H},null,8,["loading","filteredDomainSets"]))]),a(wt,{isShown:v.value,currentDomainSet:V.value,allDomainSets:e(f),onClose:P[2]||(P[2]=l=>v.value=!1),onReloadData:q},null,8,["isShown","currentDomainSet","allDomainSets"]),a(Ie,{visible:O.value,title:e(o)("standalone.objects.delete_domain_set"),deleteButtonLabel:e(o)("standalone.objects.delete_domain_set"),errorNotificationTitle:e(o)("error.cannot_delete_domain_set"),deleteFunction:()=>{var l;return e(ee)("ns.objects","delete-domain-set",{id:(l=V.value)==null?void 0:l.id})},onClose:P[3]||(P[3]=l=>O.value=!1),onReloadData:q},{default:s(()=>{var l;return[u(c(e(o)("standalone.objects.confirm_delete_domain_set",{name:(l=V.value)==null?void 0:l.name})),1)]}),_:1},8,["visible","title","deleteButtonLabel","errorNotificationTitle","deleteFunction"]),a(Le,{visible:j.value,objectName:y.value,usageIds:b.value,showGoToObjectsButton:!1,onClose:P[4]||(P[4]=l=>j.value=!1)},null,8,["visible","objectName","usageIds"]),a($e,{visible:C.value,objectName:y.value,usageIds:b.value,showGoToObjectsButton:!1,onClose:P[5]||(P[5]=l=>C.value=!1)},null,8,["visible","objectName","usageIds"])])}}}),$t={class:"mb-4 max-w-2xl text-gray-500 dark:text-gray-400"},qt=W({__name:"ObjectsView",setup(D){const{t:o}=J(),{tabs:i,selectedTab:f}=We([{name:"hostSets",label:o("standalone.objects.host_sets")},{name:"domainSets",label:o("standalone.objects.domain_sets")}]);return(t,n)=>(r(),F("div",null,[a(e(Ke),{tag:"h3",class:"mb-7"},{default:s(()=>[u(c(e(o)("standalone.objects.title")),1)]),_:1}),I("div",$t,c(e(o)("standalone.objects.page_description")),1),a(e(Ge),{tabs:e(i),selected:e(f),srTabsLabel:e(o)("ne_tabs.tabs"),srSelectTabLabel:e(o)("ne_tabs.select_a_tab"),onSelectTab:n[0]||(n[0]=h=>f.value=h),class:"mb-8"},null,8,["tabs","selected","srTabsLabel","srSelectTabLabel"]),e(f)==="hostSets"?(r(),k(St,{key:0})):e(f)==="domainSets"?(r(),k(Ot,{key:1})):N("",!0)]))}});export{qt as default};

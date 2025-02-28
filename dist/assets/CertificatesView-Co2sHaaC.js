import{aC as _e,aD as oe,aE as ge,aF as be,aG as ye,d as W,u as J,r as u,aH as De,aI as we,g as Q,h as D,q as E,k as s,l as e,aJ as ke,w as o,aK as xe,ak as he,al as j,m as x,t as f,am as Ce,z as N,ad as Ve,aq as Le,i as $,an as $e,ao as R,j as b,_ as I,s as O,B as ae,n as B,ap as Fe,L as Y,M as G,Y as se,e as P,V as U,aa as re,J as ce,Q as de,as as H,a1 as ie,ai as ue,ag as fe,S as ee,at as ne,y as ve,ar as Se,I as Te,a0 as Be,aL as Ke,aM as ze,ac as Ae,U as Ee,o as Ie,W as Me}from"./index-BlEQ5104.js";import{u as X,g as Z}from"./fileUpload-2kJDzwnA.js";import{_ as le}from"./NeMultiTextInput.vue_vue_type_script_setup_true_lang-DwfeP71-.js";import{b as Ue}from"./_baseFor-B-rOowS4.js";import"./isArrayLikeObject-CpCvCe5A.js";function qe(C,_){return C&&Ue(C,_,_e)}function Oe(C,_){return function(t,l){if(t==null)return t;if(!oe(t))return C(t,l);for(var c=t.length,a=-1,p=Object(t);++a<c&&l(p[a],a,p)!==!1;);return t}}var Ne=Oe(qe);function Pe(C,_){var t=-1,l=oe(C)?Array(C.length):[];return Ne(C,function(c,a,p){l[++t]=_(c,a,p)}),l}function je(C,_){var t=be(C)?ye:Pe;return t(C,ge(_))}const Re={class:"flex flex-row items-center gap-6"},We={class:"flex flex-col gap-1"},Je={class:"text-center"},Qe={key:0},Ye={key:1,class:"flex flex-col gap-1"},Ge={class:"flex flex-row items-center"},He={class:"mr-6"},Xe={class:"text-center"},Ze={class:"flex flex-row gap-x-2"},et={class:"text-center"},tt={class:"-ml-4 flex items-center lg:ml-0 lg:justify-end"},at=W({__name:"CertificatesTable",props:{certificates:{}},emits:["delete","edit","setAsDefault","showCertificate"],setup(C,{emit:_}){const{t}=J(),l=C,c=u("name"),a=u(!1),p={domains:(d,i)=>{var n,r;return d.type==="acme"&&i.type==="acme"?(n=d.requested_domains)!=null&&n.length&&((r=i.requested_domains)!=null&&r.length)?d.requested_domains[0].localeCompare(i.requested_domains[0]):0:d.type==="self-signed"&&i.type==="self-signed"?d.domain.localeCompare(i.domain):d.type==="self-signed"?-1:1}},{sortedItems:m}=De(l.certificates,c,a,p),g=u(10),{currentPage:y,paginatedItems:h}=we(()=>m.value,{itemsPerPage:g}),w=_;function F(d){return d.expiration?new Date(Date.parse(d.expiration)).getTime()<Date.now():!1}function S(d){return d.expiration?new Date(Date.parse(d.expiration)).toLocaleString([],{year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"-"}function K(d){switch(d.type){case"self-signed":return t("standalone.certificates.self_signed");case"custom":return t("standalone.certificates.custom");case"acme":return t("standalone.certificates.lets_encrypt")}}function T(d){return[{id:"set_as_default",label:t("standalone.certificates.set_as_default"),iconStyle:"fas",disabled:F(d)||d.pending,icon:"circle-check",action:()=>{w("setAsDefault",d)}},...d.name!="_lan"?[{id:"delete",label:t("common.delete"),iconStyle:"fas",icon:"trash",danger:!0,action:()=>{w("delete",d)}}]:[]]}const V=d=>{c.value=d.key,a.value=d.descending};return(d,i)=>{const n=Q("font-awesome-icon");return D(),E(N,null,[s(e(ke),{sortKey:c.value,"onUpdate:sortKey":i[0]||(i[0]=r=>c.value=r),sortDescending:a.value,"onUpdate:sortDescending":i[1]||(i[1]=r=>a.value=r),label:e(t)("sort.sort"),options:[{id:"name",label:e(t)("standalone.certificates.name")},{id:"domains",label:e(t)("standalone.certificates.domains")},{id:"type",label:e(t)("standalone.certificates.type")},{id:"expiration",label:e(t)("standalone.certificates.expire")}],openMenuAriaLabel:e(t)("ne_dropdown.open_menu"),sortByLabel:e(t)("sort.sort_by"),sortDirectionLabel:e(t)("sort.direction"),ascendingLabel:e(t)("sort.ascending"),descendingLabel:e(t)("sort.descending"),class:"lg:hidden"},null,8,["sortKey","sortDescending","label","options","openMenuAriaLabel","sortByLabel","sortDirectionLabel","ascendingLabel","descendingLabel"]),s(e(Le),{sortKey:c.value,sortDescending:a.value,ariaLabel:e(t)("standalone.certificates.title"),cardBreakpoint:"lg",class:"z-10"},{paginator:o(()=>[s(e(xe),{"current-page":e(y),"total-rows":e(m).length,"page-size":g.value,"nav-pagination-label":e(t)("ne_table.pagination"),"next-label":e(t)("ne_table.go_to_next_page"),"previous-label":e(t)("ne_table.go_to_previous_page"),"range-of-total-label":e(t)("ne_table.of"),"page-size-label":e(t)("ne_table.show"),onSelectPage:i[2]||(i[2]=r=>{y.value=r}),onSelectPageSize:i[3]||(i[3]=r=>{g.value=r})},null,8,["current-page","total-rows","page-size","nav-pagination-label","next-label","previous-label","range-of-total-label","page-size-label"])]),default:o(()=>[s(e(he),null,{default:o(()=>[s(e(j),{sortable:"",columnKey:"name",onSort:V},{default:o(()=>[x(f(e(t)("standalone.certificates.name")),1)]),_:1}),s(e(j),{sortable:"",columnKey:"domains",onSort:V},{default:o(()=>[x(f(e(t)("standalone.certificates.domains")),1)]),_:1}),s(e(j),{sortable:"",columnKey:"type",onSort:V},{default:o(()=>[x(f(e(t)("standalone.certificates.type")),1)]),_:1}),s(e(j),{sortable:"",columnKey:"expiration",onSort:V},{default:o(()=>[x(f(e(t)("standalone.certificates.expire")),1)]),_:1}),s(e(j))]),_:1}),s(e(Ce),null,{default:o(()=>[(D(!0),E(N,null,Ve(e(h),(r,q)=>(D(),$(e($e),{key:q},{default:o(()=>[s(e(R),{"data-label":e(t)("standalone.certificates.name")},{default:o(()=>[b("div",Re,[b("div",We,[b("p",null,f(r.name),1),s(e(I),{disabled:!r.details,class:"-mx-2",kind:"tertiary",onClick:z=>w("showCertificate",r)},{default:o(()=>[x(f(e(t)("standalone.certificates.more_info")),1)]),_:2},1032,["disabled","onClick"])]),r.default?(D(),$(e(O),{key:0,interactive:""},{trigger:o(()=>[s(e(ae),{kind:"success",class:"-mt-2",text:e(t)("standalone.certificates.default")},null,8,["text"])]),content:o(()=>[b("p",Je,f(e(t)("standalone.certificates.default_certificate_tooltip")),1)]),_:1})):B("",!0)])]),_:2},1032,["data-label"]),s(e(R),{"data-label":e(t)("standalone.certificates.domains")},{default:o(()=>[r.type!="acme"?(D(),E("p",Qe,f(r.domain?r.domain:"-"),1)):(D(),E("div",Ye,[b("p",null,f(r.requested_domains.slice(0,2).join(", ")),1),r.requested_domains.length>2?(D(),$(e(O),{key:0,interactive:"",placement:"bottom"},{trigger:o(()=>[s(e(I),{size:"sm",kind:"tertiary",class:"-mx-2"},{default:o(()=>[x(f(e(t)("standalone.certificates.plus_n_others",{n:r.requested_domains.length-2})),1)]),_:2},1024)]),content:o(()=>[b("p",null,f(r.requested_domains.slice(2).join(", ")),1)]),_:2},1024)):B("",!0)]))]),_:2},1032,["data-label"]),s(e(R),{"data-label":e(t)("standalone.certificates.type")},{default:o(()=>[b("div",Ge,[b("p",He,f(K(r)),1),r.pending?(D(),$(e(O),{key:0,interactive:""},{trigger:o(()=>[s(e(ae),{kind:"warning",text:e(t)("standalone.certificates.pending")},null,8,["text"])]),content:o(()=>[b("p",Xe,f(e(t)("standalone.certificates.pending_tooltip")),1)]),_:1})):B("",!0)])]),_:2},1032,["data-label"]),s(e(R),{"data-label":e(t)("standalone.certificates.expire")},{default:o(()=>[b("div",Ze,[b("p",null,f(S(r)),1),F(r)?(D(),$(e(O),{key:0,interactive:""},{trigger:o(()=>[s(n,{icon:["fas","triangle-exclamation"],class:"h-4 w-4 text-amber-500"})]),content:o(()=>[b("p",et,f(e(t)("standalone.certificates.certificate_expired")),1)]),_:1})):B("",!0)])]),_:2},1032,["data-label"]),s(e(R),{"data-label":e(t)("common.actions")},{default:o(()=>[b("div",tt,[r.default?B("",!0):(D(),$(e(Fe),{key:0,items:T(r),"align-to-right":!0},null,8,["items"]))])]),_:2},1032,["data-label"])]),_:2},1024))),128))]),_:1})]),_:1},8,["sortKey","sortDescending","ariaLabel"])],64)}}}),it=W({__name:"DeleteCertificateModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","certificate-deleted"],setup(C,{emit:_}){const t=C,l=_,{t:c}=J(),a=u({notificationDescription:"",notificationDetails:""}),p=u(!1);async function m(){if(t.itemToDelete){a.value.notificationDescription="",a.value.notificationDetails="",p.value=!0;try{await P("ns.reverseproxy","delete-certificate",{name:t.itemToDelete.name}),l("certificate-deleted"),g()}catch(y){a.value.notificationDescription=c(U(y)),a.value.notificationDetails=y.toString()}finally{p.value=!1}}}function g(){a.value.notificationDescription="",a.value.notificationDetails="",l("close")}return(y,h)=>(D(),$(e(se),{visible:y.visible,kind:"warning",primaryButtonKind:"danger",title:e(c)("standalone.certificates.delete_certificate"),primaryLabel:e(c)("common.delete"),primaryButtonDisabled:p.value,primaryButtonLoading:p.value,"close-aria-label":e(c)("common.close"),onPrimaryClick:h[0]||(h[0]=w=>m()),onClose:h[1]||(h[1]=w=>g())},{default:o(()=>{var w;return[x(f(e(c)("standalone.certificates.delete_certificate_message",{certificate:((w=y.itemToDelete)==null?void 0:w.name)??""}))+" ",1),a.value.notificationDescription?(D(),$(e(Y),{key:0,kind:"error",title:e(c)("error.cannot_delete_certificate"),description:a.value.notificationDescription,class:"my-2"},G({_:2},[a.value.notificationDetails?{name:"details",fn:o(()=>[x(f(a.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):B("",!0)]}),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}}),nt={class:"flex flex-col gap-y-6"},lt={class:"flex flex-row justify-between"},ot={class:"flex justify-end"},st=W({__name:"ImportCertificateDrawer",props:{isShown:{type:Boolean}},emits:["close","certificate-imported"],setup(C,{emit:_}){const t=C,l=_,{t:c}=J(),a=u({notificationTitle:"",notificationDescription:"",notificationDetails:""}),p=u(!1),m=u(new re),g=u(""),y=u(null),h=u(null),w=u(null);function F(){g.value="",y.value=null,h.value=null,w.value=null}function S(){p.value||(a.value.notificationDescription="",a.value.notificationDetails="",l("close"))}function K(d,i){for(let n of d)n.valid||m.value.set(i,[n.errMessage]);return d.every(n=>n.valid)}function T(){return m.value.clear(),[[[ee(g.value)],"name"],[[ne(y.value)],"certificate_path"],[[ne(h.value)],"key_path"]].map(([i,n])=>K(i,n)).every(i=>i)}async function V(){if(a.value.notificationDescription="",a.value.notificationDetails="",!T())return;p.value=!0;let d="",i="",n="";try{d=(await X(y.value)).data.data,i=(await X(h.value)).data.data,w.value&&(n=(await X(w.value)).data.data)}catch(r){a.value.notificationTitle=c("error.cannot_upload_certificate_files"),a.value.notificationDescription=c(U(r)),a.value.notificationDetails=r.toString(),p.value=!1;return}try{await P("ns.reverseproxy","add-certificate",{name:g.value,certificate_path:Z(d),key_path:Z(i),...n?{chain_path:Z(n)}:{}}),p.value=!1,l("certificate-imported"),S()}catch(r){r instanceof fe?m.value=r.errorBag:(a.value.notificationTitle=c("error.cannot_import_certificate"),a.value.notificationDescription=c(U(r)),a.value.notificationDetails=r.toString()),p.value=!1}}return ce(()=>t.isShown,()=>{t.isShown&&(F(),m.value.clear())}),(d,i)=>(D(),$(e(ue),{"is-shown":d.isShown,onClose:i[6]||(i[6]=n=>S()),closeAriaLabel:e(c)("common.shell.close_side_drawer"),title:e(c)("standalone.certificates.import_certificate")},{default:o(()=>[b("div",nt,[a.value.notificationDescription?(D(),$(e(Y),{key:0,kind:"error",title:e(c)("error.cannot_import_certificate"),description:a.value.notificationDescription},G({_:2},[a.value.notificationDetails?{name:"details",fn:o(()=>[x(f(a.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):B("",!0),s(e(de),{label:e(c)("standalone.certificates.certificate_name"),"invalid-message":e(c)(m.value.getFirstI18nKeyFor("name")),modelValue:g.value,"onUpdate:modelValue":i[0]||(i[0]=n=>g.value=n)},null,8,["label","invalid-message","modelValue"]),s(e(H),{label:e(c)("standalone.certificates.certificate"),"invalid-message":e(c)(m.value.getFirstI18nKeyFor("certificate_path")),dropzoneLabel:e(c)("ne_file_input.dropzone_label"),modelValue:y.value,"onUpdate:modelValue":i[1]||(i[1]=n=>y.value=n)},null,8,["label","invalid-message","dropzoneLabel","modelValue"]),s(e(H),{label:e(c)("standalone.certificates.private_key"),"invalid-message":e(c)(m.value.getFirstI18nKeyFor("key_path")),dropzoneLabel:e(c)("ne_file_input.dropzone_label"),modelValue:h.value,"onUpdate:modelValue":i[2]||(i[2]=n=>h.value=n)},null,8,["label","invalid-message","dropzoneLabel","modelValue"]),b("div",null,[b("div",lt,[s(e(ie),null,{default:o(()=>[x(f(e(c)("standalone.certificates.chain_file")),1)]),_:1}),s(e(ie),null,{default:o(()=>[x(f(e(c)("common.optional")),1)]),_:1})]),s(e(H),{dropzoneLabel:e(c)("ne_file_input.dropzone_label"),modelValue:w.value,"onUpdate:modelValue":i[3]||(i[3]=n=>w.value=n)},null,8,["dropzoneLabel","modelValue"])]),i[7]||(i[7]=b("hr",null,null,-1)),b("div",ot,[s(e(I),{kind:"tertiary",class:"mr-4",onClick:i[4]||(i[4]=n=>S())},{default:o(()=>[x(f(e(c)("common.cancel")),1)]),_:1}),s(e(I),{kind:"primary",onClick:i[5]||(i[5]=n=>V()),disabled:p.value,loading:p.value},{default:o(()=>[x(f(e(c)("standalone.certificates.import")),1)]),_:1},8,["disabled","loading"])])])]),_:1},8,["is-shown","closeAriaLabel","title"]))}}),rt={key:2,class:"flex flex-col gap-y-6"},ct={class:"flex justify-end"},dt=W({__name:"CreateLetsEncryptCertificateDrawer",props:{isShown:{type:Boolean}},emits:["close","add-certificate"],setup(C,{emit:_}){const t=C,{t:l}=J(),c=_,a=u(!1),p=u(!1),m=u({notificationTitle:"",notificationDescription:"",notificationDetails:""}),g=u(new re),y=u([]),h=u([]),w=u([]),F=u(!1),S=u(""),K=u([""]),T=u("standalone"),V=u(""),d=u([{key:"",value:""}]),i=u([]),n=[{id:"standalone",label:l("standalone.certificates.standalone")},{id:"dns",label:l("standalone.certificates.dns")}];function r(){p.value||(g.value.clear(),y.value=[],h.value=[],w.value=[],m.value.notificationTitle="",m.value.notificationDescription="",m.value.notificationDetails="",c("close"))}async function q(){try{a.value=!0,i.value=(await P("ns.reverseproxy","list-dns-providers")).data.values.map(k=>({id:k,label:k}))}catch(k){m.value.notificationTitle=l("error.cannot_retrieve_dns_providers"),m.value.notificationDescription=l(U(k)),m.value.notificationDetails=k.toString()}finally{a.value=!1}}function z(){var k,v;F.value=!1,S.value="",K.value=[""],T.value="standalone",V.value=((v=(k=i.value)==null?void 0:k[0])==null?void 0:v.id)??"",d.value=[{key:"",value:""}]}function te(k,v){for(let A of k)A.valid||g.value.set(v,[A.errMessage]);return k.every(A=>A.valid)}function pe(){g.value.clear(),y.value=[],h.value=[],w.value=[],K.value.forEach(()=>{y.value.push("")}),d.value.forEach(()=>{h.value.push(""),w.value.push("")});let k=!0;for(let[A,M]of K.value.entries())if(M){let L=Ke(M,T.value==="dns");if(!L.valid){y.value[A]=l(L.errMessage),k=!1;break}}else y.value[A]=l("error.required"),k=!1;let v=!0;if(T.value==="dns"){v=te([ee(V.value)],"dns_provider");for(let[A,M]of d.value.entries())M.key||(h.value[A]=l("error.required"),v=!1),M.value||(w.value[A]=l("error.required"),v=!1)}return k&&te([ee(S.value),ze(S.value)],"name")&&v}async function me(){if(pe())try{p.value=!0,await P("ns.reverseproxy","request-certificate",{name:S.value,domains:K.value,validation_method:T.value,...T.value==="dns"?{dns_provider:V.value,dns_provider_options:d.value.map(k=>`${k.key}=${k.value}`)}:{}}),p.value=!1,c("add-certificate"),r()}catch(k){k instanceof fe?g.value=k.errorBag:(m.value.notificationTitle=l("error.cannot_create_certificate"),m.value.notificationDescription=l(U(k))),p.value=!1}}return ce(()=>t.isShown,()=>{t.isShown&&q().then(()=>{z()})}),(k,v)=>{const A=Q("font-awesome-icon"),M=Q("i18n-t");return D(),$(e(ue),{"is-shown":k.isShown,onClose:v[8]||(v[8]=L=>r()),closeAriaLabel:e(l)("common.shell.close_side_drawer"),title:e(l)("standalone.certificates.add_lets_encrypt_certificate")},{default:o(()=>[m.value.notificationTitle?(D(),$(e(Y),{key:0,title:m.value.notificationTitle,description:m.value.notificationDescription,class:"mb-6",kind:"error"},G({_:2},[m.value.notificationDetails?{name:"details",fn:o(()=>[x(f(m.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):B("",!0),a.value?(D(),$(e(ve),{key:1,lines:10,size:"lg"})):(D(),E("div",rt,[s(e(de),{modelValue:S.value,"onUpdate:modelValue":v[0]||(v[0]=L=>S.value=L),label:e(l)("standalone.certificates.certificate_name"),"invalid-message":e(l)(g.value.getFirstI18nKeyFor("name"))},null,8,["modelValue","label","invalid-message"]),s(le,{modelValue:K.value,"onUpdate:modelValue":v[1]||(v[1]=L=>K.value=L),"add-item-label":e(l)("standalone.certificates.add_domain"),title:e(l)("standalone.certificates.domain"),"invalid-messages":y.value,"general-invalid-message":e(l)(g.value.getFirstI18nKeyFor("domains")),required:!0},null,8,["modelValue","add-item-label","title","invalid-messages","general-invalid-message"]),b("div",null,[s(e(I),{kind:"tertiary",onClick:v[2]||(v[2]=L=>F.value=!F.value)},{suffix:o(()=>[s(A,{icon:["fas",F.value?"chevron-up":"chevron-down"],class:"h-4 w-4","aria-hidden":"true"},null,8,["icon"])]),default:o(()=>[x(f(e(l)("common.advanced_settings"))+" ",1)]),_:1})]),F.value?(D(),E(N,{key:0},[s(e(Se),{label:e(l)("standalone.certificates.validation_method"),options:n,modelValue:T.value,"onUpdate:modelValue":v[3]||(v[3]=L=>T.value=L)},{tooltip:o(()=>[s(e(O),null,{content:o(()=>[x(f(e(l)("standalone.certificates.validation_method_tooltip")),1)]),_:1})]),_:1},8,["label","modelValue"]),T.value==="dns"?(D(),E(N,{key:0},[s(e(Be),{label:e(l)("standalone.certificates.dns_api"),options:i.value,noResultsLabel:e(l)("ne_combobox.no_results"),limitedOptionsLabel:e(l)("ne_combobox.limited_options_label"),noOptionsLabel:e(l)("ne_combobox.no_options_label"),"selected-label":e(l)("ne_combobox.selected"),"user-input-label":e(l)("ne_combobox.user_input_label"),optionalLabel:e(l)("common.optional"),modelValue:V.value,"onUpdate:modelValue":v[4]||(v[4]=L=>V.value=L),"invalid-message":e(l)(g.value.getFirstI18nKeyFor("dns_provider")),placeholder:e(l)("standalone.certificates.choose_or_type_dns_api")},{tooltip:o(()=>[s(e(O),null,{content:o(()=>[s(M,{keypath:"standalone.certificates.dns_api_tooltip",tag:"span",scope:"global"},{dnsapiurl:o(()=>[s(e(Te),{invertedTheme:"",href:"https://github.com/acmesh-official/acme.sh/wiki/dnsapi",target:"_blank"},{default:o(()=>v[9]||(v[9]=[x("https://github.com/acmesh-official/acme.sh/wiki/dnsapi")])),_:1})]),_:1})]),_:1})]),_:1},8,["label","options","noResultsLabel","limitedOptionsLabel","noOptionsLabel","selected-label","user-input-label","optionalLabel","modelValue","invalid-message","placeholder"]),V.value?(D(),$(le,{key:0,modelValue:d.value,"onUpdate:modelValue":v[5]||(v[5]=L=>d.value=L),"key-input-type":"text",title:e(l)("standalone.certificates.dns_api_options"),"key-input-placeholder":e(l)("standalone.certificates.key"),placeholder:e(l)("standalone.certificates.value"),"use-key-input":!0,"add-item-label":e(l)("standalone.certificates.add_option"),"invalid-key-messages":h.value,"invalid-messages":w.value,required:!0,"general-invalid-message":e(l)(g.value.getFirstI18nKeyFor("dns_provider_options"))},null,8,["modelValue","title","key-input-placeholder","placeholder","add-item-label","invalid-key-messages","invalid-messages","general-invalid-message"])):B("",!0)],64)):B("",!0)],64)):B("",!0),v[10]||(v[10]=b("hr",null,null,-1)),b("div",ct,[s(e(I),{kind:"tertiary",class:"mr-4",onClick:v[6]||(v[6]=L=>r())},{default:o(()=>[x(f(e(l)("common.cancel")),1)]),_:1}),s(e(I),{kind:"primary",onClick:v[7]||(v[7]=L=>me()),disabled:p.value,loading:p.value},{default:o(()=>[x(f(e(l)("standalone.certificates.add_certificate")),1)]),_:1},8,["disabled","loading"])])]))]),_:1},8,["is-shown","closeAriaLabel","title"])}}}),ut={class:"flex flex-col gap-y-6"},ft={class:"flex flex-col items-start justify-between gap-4 xl:flex-row"},vt={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},pt={class:"flex shrink-0 flex-row-reverse gap-4 xl:flex-row"},mt={class:"mb-2 font-semibold"},_t={class:"h-80 w-full min-w-0 resize-y overflow-auto whitespace-pre rounded-md border border-gray-700 p-3 font-mono"},kt=W({__name:"CertificatesView",setup(C){const{t:_}=J(),t=Ae(),l=Ee(),c=u([]),a=u({notificationTitle:"",notificationDescription:"",notificationDetails:""}),p=u(!0),m=u(!1),g=u(),y=u(!1),h=u(!1),w=u(!1),F=u(!1);function S(){a.value.notificationTitle="",a.value.notificationDescription="",a.value.notificationDetails=""}function K(i){g.value=i,y.value=!0}function T(i){g.value=i,F.value=!0}async function V(){S();try{p.value=!0;const i=(await P("ns.reverseproxy","list-certificates")).data.values;c.value=je(i,(n,r)=>({...n,name:r}))}catch(i){a.value.notificationTitle=_("error.cannot_retrieve_certificates"),a.value.notificationDescription=_(U(i)),a.value.notificationDetails=i.toString(),m.value=!0}finally{p.value=!1}}async function d(i){S();try{await P("ns.reverseproxy","set-default-certificate",{name:i.name})}catch(n){a.value.notificationTitle=_("error.cannot_set_default_certificate"),a.value.notificationDescription=_(U(n)),a.value.notificationDetails=n.toString();return}await l.getChanges(),await V()}return Ie(()=>{V()}),(i,n)=>{var q;const r=Q("font-awesome-icon");return D(),E(N,null,[s(e(Me),{tag:"h3",class:"mb-7"},{default:o(()=>[x(f(e(_)("standalone.certificates.title")),1)]),_:1}),b("div",ut,[a.value.notificationDescription?(D(),$(e(Y),{key:0,title:a.value.notificationTitle,description:a.value.notificationDescription,class:"mb-6",kind:"error"},G({_:2},[a.value.notificationDetails?{name:"details",fn:o(()=>[x(f(a.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):B("",!0),p.value?(D(),$(e(ve),{key:1,size:"lg",lines:8})):m.value?B("",!0):(D(),E(N,{key:2},[b("div",ft,[b("p",vt,f(e(_)("standalone.certificates.description")),1),b("div",pt,[s(e(I),{kind:"tertiary",onClick:n[0]||(n[0]=z=>w.value=!0)},{prefix:o(()=>[s(r,{icon:["fas","circle-arrow-up"],class:"h-4 w-4","aria-hidden":"true"})]),default:o(()=>[x(f(e(_)("standalone.certificates.import_certificate")),1)]),_:1}),s(e(I),{kind:"secondary",onClick:n[1]||(n[1]=z=>h.value=!0)},{prefix:o(()=>[s(r,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:o(()=>[x(f(e(_)("standalone.certificates.add_lets_encrypt_certificate")),1)]),_:1})])]),s(at,{certificates:c.value,onDelete:K,onSetAsDefault:d,onShowCertificate:T},null,8,["certificates"])],64))]),s(it,{visible:y.value,"item-to-delete":g.value,onCertificateDeleted:n[2]||(n[2]=()=>{e(t).addNotification({id:"delete_certificate",kind:"success",title:e(_)("standalone.certificates.certificate_deleted")}),V()}),onClose:n[3]||(n[3]=z=>y.value=!1)},null,8,["visible","item-to-delete"]),s(st,{"is-shown":w.value,onClose:n[4]||(n[4]=z=>w.value=!1),onCertificateImported:n[5]||(n[5]=()=>{e(t).addNotification({id:"import_certificate",kind:"success",title:e(_)("standalone.certificates.certificate_imported")}),V()})},null,8,["is-shown"]),s(dt,{"is-shown":h.value,onAddCertificate:n[6]||(n[6]=()=>{e(l).getChanges(),V()}),onClose:n[7]||(n[7]=z=>h.value=!1)},null,8,["is-shown"]),s(e(se),{kind:"info",visible:F.value,onClose:n[8]||(n[8]=z=>F.value=!1),"primary-label":e(_)("common.close"),onPrimaryClick:n[9]||(n[9]=z=>F.value=!1),"close-aria-label":e(_)("common.close"),title:(q=g.value)==null?void 0:q.name,"cancel-label":"",size:"xxl"},{default:o(()=>{var z;return[b("p",mt,f(e(_)("standalone.certificates.certificate")),1),b("p",_t,f((z=g.value)==null?void 0:z.details),1)]}),_:1},8,["visible","primary-label","close-aria-label","title"])],64)}}});export{kt as default};

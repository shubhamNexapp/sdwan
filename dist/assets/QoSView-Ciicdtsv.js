import{d as L,u as Q,g as J,h as w,i as I,w as d,j as h,av as C,l as e,k as f,t as p,m as D,_ as B,ap as G,r as y,L as Z,M as K,n as V,Y as X,e as F,V as $,aa as ee,J as ae,y as R,q as U,a1 as te,a5 as ne,a0 as oe,s as P,Q as W,ai as ie,ag as le,S as j,bk as Y,U as se,o as re,W as ce,z as H,aj as de}from"./index-BlEQ5104.js";import{_ as ue}from"./NeTable.vue_vue_type_script_setup_true_lang-BDPau7Vg.js";/* empty css                                                */import{w as fe,a as ve,x as me}from"./network-qu7sidyZ.js";import{u as pe}from"./firewall-C9mbeSo1.js";const _e={class:"flex flex-row items-center gap-x-4"},be={class:"align-center flex justify-end"},ge=L({__name:"QoSInterfaceTable",props:{qosInterfaces:{},firewallZones:{}},emits:["delete","edit","enableDisable"],setup(x,{emit:_}){const{t:s}=Q(),a=x,o=_,v=[{label:s("standalone.qos.interface"),key:"interface"},{label:`${s("standalone.qos.download_speed")} (Mbps)`,key:"download"},{label:`${s("standalone.qos.upload_speed")} (Mbps)`,key:"upload"},{label:s("standalone.qos.status"),key:"status"},{label:"",key:"menu"}];function m(l){return[{id:"enable_disable",label:l.disabled?s("common.enable"):s("common.disable"),iconStyle:"fas",icon:l.disabled?"circle-check":"circle-xmark",action:()=>{o("enableDisable",l)}},{id:"delete",label:s("common.delete"),iconStyle:"fas",icon:"trash",danger:!0,action:()=>{o("delete",l)}}]}function t(l){return l.disabled?["opacity-50"]:[]}function b(l){var g;return((g=a.firewallZones.find(u=>u.interfaces.includes(l.interface)))==null?void 0:g.name)??""}return(l,g)=>{const u=J("font-awesome-icon");return w(),I(ue,{data:l.qosInterfaces,headers:v,class:"z-10"},{interface:d(({item:n})=>[h("div",_e,[h("div",{class:C(`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${e(fe)(b(n))}`)},[f(u,{icon:["fas",e(ve)(b(n))],"aria-hidden":"true",class:C(`h-5 w-5 ${e(me)(b(n))}`)},null,8,["icon","class"])],2),h("p",{class:C([...t(n)])},p(n.interface)+" ("+p(n.device)+")",3)])]),download:d(({item:n})=>[h("p",{class:C([...t(n)])},p(n.download),3)]),upload:d(({item:n})=>[h("p",{class:C([...t(n)])},p(n.upload),3)]),status:d(({item:n})=>[h("div",{class:C(["flex","flex-row","items-center",...t(n)])},[f(u,{icon:["fas",n.disabled?"circle-xmark":"circle-check"],class:C(["mr-2","h-5","w-5",n.disabled?"":"text-green-600 dark:text-green-400"]),"aria-hidden":"true"},null,8,["icon","class"]),D(" "+p(n.disabled?e(s)("common.disabled"):e(s)("common.enabled")),1)],2)]),menu:d(({item:n})=>[h("div",be,[f(e(B),{kind:"tertiary",onClick:T=>o("edit",n)},{prefix:d(()=>[f(u,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:d(()=>[D(" "+p(e(s)("common.edit")),1)]),_:2},1032,["onClick"]),f(e(G),{items:m(n),"align-to-right":!0},null,8,["items"])])]),_:1},8,["data"])}}}),ye=L({__name:"DeleteQoSInterfaceModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","qos-interface-deleted"],setup(x,{emit:_}){const s=x,a=_,{t:o}=Q(),v=y({notificationDescription:"",notificationDetails:""}),m=y(!1);async function t(){if(s.itemToDelete){v.value.notificationDescription="",v.value.notificationDetails="",m.value=!0;try{await F("ns.qos","delete",{interface:s.itemToDelete.interface}),a("qos-interface-deleted"),b()}catch(l){v.value.notificationDescription=o($(l)),v.value.notificationDetails=l.toString()}finally{m.value=!1}}}function b(){v.value.notificationDescription="",v.value.notificationDetails="",a("close")}return(l,g)=>(w(),I(e(X),{visible:l.visible,kind:"warning",primaryButtonKind:"danger",title:e(o)("standalone.qos.delete_qos_interface"),primaryLabel:e(o)("common.delete"),primaryButtonDisabled:m.value,primaryButtonLoading:m.value,"close-aria-label":e(o)("common.close"),onPrimaryClick:g[0]||(g[0]=u=>t()),onClose:g[1]||(g[1]=u=>b())},{default:d(()=>{var u;return[D(p(e(o)("standalone.qos.delete_qos_interface_message",{interface:((u=l.itemToDelete)==null?void 0:u.interface)??""}))+" ",1),v.value.notificationDescription?(w(),I(e(Z),{key:0,kind:"error",title:e(o)("error.cannot_delete_qos_interface"),description:v.value.notificationDescription,class:"my-2"},K({_:2},[v.value.notificationDetails?{name:"details",fn:d(()=>[D(p(v.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):V("",!0)]}),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}}),we={key:2,class:"flex flex-col gap-y-6"},De={class:"flex justify-end"},ke=L({__name:"CreateOrEditQoSInterfaceDrawer",props:{isShown:{type:Boolean},itemToEdit:{},configuredInterfaces:{}},emits:["close","add-edit-qos-interface"],setup(x,{emit:_}){const s=x,{t:a}=Q(),o=_,v=y(!1),m=y(!1),t=y({notificationTitle:"",notificationDescription:"",notificationDetails:""}),b=y(new ee),l=y(!0),g=y(""),u=y(""),n=y(""),T=y([]);async function z(){try{v.value=!0,T.value=(await F("ns.devices","list-devices")).data.all_devices.filter(r=>r.iface&&r.iface[".type"]==="interface"&&(s.itemToEdit||!s.configuredInterfaces.includes(r.iface[".name"]))).map(r=>({id:r.iface[".name"],label:r.iface[".name"],description:r.iface.device}))}catch(r){t.value.notificationTitle=a("error.cannot_load_network_devices"),t.value.notificationDescription=a($(r)),t.value.notificationDetails=r.toString()}finally{v.value=!1}}async function E(){var r,i,c,O,N,A;l.value=!((r=s.itemToEdit)!=null&&r.disabled),g.value=((i=s.itemToEdit)==null?void 0:i.interface)??((O=(c=T.value)==null?void 0:c[0])==null?void 0:O.id)??"",u.value=((N=s.itemToEdit)==null?void 0:N.download.toString())??"",n.value=((A=s.itemToEdit)==null?void 0:A.upload.toString())??""}function k(r,i){for(let c of r)c.valid||b.value.set(i,[c.errMessage]);return r.every(c=>c.valid)}function q(){return b.value.clear(),[[[j(g.value)],"name"],[[j(u.value),Y(u.value)],"download"],[[j(n.value),Y(n.value)],"upload"]].map(([i,c])=>k(i,c)).every(i=>i)}async function M(){t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="";const r=!!s.itemToEdit,i=r?"edit":"add";if(q()){m.value=!0;try{await F("ns.qos",i,{interface:g.value,disabled:!l.value,upload:parseInt(n.value),download:parseInt(u.value)}),m.value=!1,o("add-edit-qos-interface"),S()}catch(c){c instanceof le?b.value=c.errorBag:(t.value.notificationTitle=a(r?"error.cannot_edit_qos_interface":"error.cannot_create_qos_interace"),t.value.notificationDescription=a($(c)),t.value.notificationDetails=c.toString()),m.value=!1;return}}}function S(){m.value||(b.value.clear(),t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",o("close"))}return ae(()=>s.isShown,()=>{s.isShown&&z().then(()=>{E()})}),(r,i)=>(w(),I(e(ie),{"is-shown":r.isShown,onClose:i[6]||(i[6]=c=>S()),closeAriaLabel:e(a)("common.shell.close_side_drawer"),title:r.itemToEdit?e(a)("standalone.qos.edit_qos_interface"):e(a)("standalone.qos.add_qos_interface")},{default:d(()=>[t.value.notificationTitle?(w(),I(e(Z),{key:0,title:t.value.notificationTitle,description:t.value.notificationDescription,class:"mb-6",kind:"error"},K({_:2},[t.value.notificationDetails?{name:"details",fn:d(()=>[D(p(t.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):V("",!0),v.value?(w(),I(e(R),{key:1,lines:20})):(w(),U("div",we,[h("div",null,[f(e(te),null,{default:d(()=>[D(p(e(a)("standalone.qos.status")),1)]),_:1}),f(e(ne),{modelValue:l.value,"onUpdate:modelValue":i[0]||(i[0]=c=>l.value=c),label:l.value?e(a)("common.enabled"):e(a)("common.disabled")},null,8,["modelValue","label"])]),f(e(oe),{label:e(a)("standalone.qos.interface"),disabled:!!r.itemToEdit,options:T.value,"no-options-label":e(a)("ne_combobox.no_options_label"),"no-results-label":e(a)("ne_combobox.no_results"),optionalLabel:e(a)("common.optional"),placeholder:e(a)("standalone.qos.choose_interface"),modelValue:g.value,"onUpdate:modelValue":i[1]||(i[1]=c=>g.value=c),"invalid-message":e(a)(b.value.getFirstI18nKeyFor("name"))},null,8,["label","disabled","options","no-options-label","no-results-label","optionalLabel","placeholder","modelValue","invalid-message"]),f(e(W),{modelValue:u.value,"onUpdate:modelValue":i[2]||(i[2]=c=>u.value=c),type:"number",label:`${e(a)("standalone.qos.download_speed")} (Mbps)`,"invalid-message":e(a)(b.value.getFirstI18nKeyFor("download"))},{tooltip:d(()=>[f(e(P),null,{content:d(()=>[D(p(e(a)("standalone.qos.download_speed_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),f(e(W),{modelValue:n.value,"onUpdate:modelValue":i[3]||(i[3]=c=>n.value=c),type:"number",label:`${e(a)("standalone.qos.upload_speed")} (Mbps)`,"invalid-message":e(a)(b.value.getFirstI18nKeyFor("upload"))},{tooltip:d(()=>[f(e(P),null,{content:d(()=>[D(p(e(a)("standalone.qos.upload_speed_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),i[7]||(i[7]=h("hr",null,null,-1)),h("div",De,[f(e(B),{kind:"tertiary",class:"mr-4",onClick:i[4]||(i[4]=c=>S())},{default:d(()=>[D(p(e(a)("common.cancel")),1)]),_:1}),f(e(B),{kind:"primary",onClick:i[5]||(i[5]=c=>M()),disabled:m.value,loading:m.value},{default:d(()=>[D(p(r.itemToEdit?e(a)("common.save"):e(a)("standalone.qos.add_interface")),1)]),_:1},8,["disabled","loading"])])]))]),_:1},8,["is-shown","closeAriaLabel","title"]))}}),qe={class:"flex flex-col gap-y-6"},he={class:"flex flex-row items-center justify-between"},Ie={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},Ee=L({__name:"QoSView",setup(x){const{t:_}=Q(),s=se(),a=pe(),o=y({notificationTitle:"",notificationDescription:"",notificationDetails:""}),v=y(!1),m=y([]),t=y(),b=y(!1),l=y(!1),g=y(!1);function u(k){t.value=k,g.value=!0}function n(k){t.value=k,l.value=!0}async function T(){o.value.notificationDescription="",o.value.notificationDetails="",(a.loading||a.error)&&a.fetch();try{b.value=!0,m.value=(await F("ns.qos","list")).data.rules}catch(k){o.value.notificationTitle=_("error.cannot_retrieve_qos_interfaces"),o.value.notificationDescription=_($(k)),o.value.notificationDetails=k.toString(),v.value=!0}finally{b.value=!1}}async function z(k){try{await F("ns.qos","set-status",{interface:k.interface,disabled:!k.disabled}),await E()}catch(q){o.value.notificationTitle=k.disabled?_("error.cannot_enable_qos_interface"):_("error.cannot_disable_qos_interface"),o.value.notificationDescription=_($(q)),o.value.notificationDetails=q.toString()}}async function E(){await s.getChanges(),T()}return re(()=>{T()}),(k,q)=>{const M=J("font-awesome-icon");return w(),U(H,null,[f(e(ce),{tag:"h3",class:"mb-7"},{default:d(()=>[D(p(e(_)("standalone.qos.title")),1)]),_:1}),h("div",qe,[h("div",he,[h("p",Ie,p(e(_)("standalone.qos.description")),1),m.value.length>0?(w(),I(e(B),{key:0,kind:"secondary",onClick:q[0]||(q[0]=S=>u())},{prefix:d(()=>[f(M,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:d(()=>[D(p(e(_)("standalone.qos.add_qos_interface")),1)]),_:1})):V("",!0)]),o.value.notificationDescription||e(a).error?(w(),I(e(Z),{key:0,title:e(a).error?e(_)("error.cannot_load_firewall_config"):o.value.notificationTitle,description:e(a).error?e(_)(e($)(e(a).error)):o.value.notificationDescription,class:"mb-6",kind:"error"},K({_:2},[o.value.notificationDetails?{name:"details",fn:d(()=>[D(p(e(a).error?e(a).error.toString():o.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):V("",!0),b.value?(w(),I(e(R),{key:1,lines:10})):v.value?V("",!0):(w(),U(H,{key:2},[m.value.length==0?(w(),I(e(de),{key:0,title:e(_)("standalone.qos.no_interface_found"),icon:["fas","chart-simple"]},{default:d(()=>[f(e(B),{kind:"secondary",onClick:q[1]||(q[1]=S=>u())},{prefix:d(()=>[f(M,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:d(()=>[D(p(e(_)("standalone.qos.add_qos_interface")),1)]),_:1})]),_:1},8,["title"])):(w(),I(ge,{key:1,"qos-interfaces":m.value,"firewall-zones":e(a).zones,onEdit:u,onDelete:n,onEnableDisable:z},null,8,["qos-interfaces","firewall-zones"]))],64))]),f(ye,{visible:l.value,"item-to-delete":t.value,onClose:q[2]||(q[2]=S=>l.value=!1),onQosInterfaceDeleted:E},null,8,["visible","item-to-delete"]),f(ke,{"is-shown":g.value,"item-to-edit":t.value,"configured-interfaces":m.value.map(S=>S.interface),onClose:q[3]||(q[3]=S=>g.value=!1),onAddEditQosInterface:E},null,8,["is-shown","item-to-edit","configured-interfaces"])],64)}}});export{Ee as default};

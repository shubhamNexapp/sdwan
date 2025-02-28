import{d as ke,ac as Ue,u as Se,r as l,aa as Ie,c as U,J as oe,h as w,i as E,w as i,j as y,l as e,L as Pe,n as De,k as o,a5 as Ke,Q as P,m as c,t as p,R as Re,_ as ue,ai as Ne,bH as Le,T as Be,e as Z,V as H,ay as Ve,az as Ce,S as $e,U as qe,o as ze,b as We,g as Je,q as re,W as Ge,M as Ze,y as He,z as ie,al as T,ak as Qe,ad as Xe,am as Ye,aq as el,aj as ll,an as al,ao as x}from"./index-BlEQ5104.js";/* empty css                                                */import{_ as tl}from"./DeleteTunnelModal.vue_vue_type_script_setup_true_lang-2XdVzv1U.js";import{u as sl}from"./firewall-C9mbeSo1.js";import{u as nl}from"./useObjects-D-lIOcFM.js";const ol={class:"space-y-6"},rl={class:"flex justify-end"},il=ke({__name:"WireGuardDrawer",props:{ruleType:{type:String,required:!0},currentRule:{type:Object},isDuplicatingRule:{type:Boolean,default:!1},isShown:{type:Boolean,default:!1},knownTags:{type:Array,required:!0}},emits:["close","reloadData","save"],setup(Q,{emit:f}){const X=Ue(),n=Q,B=f,{t:s}=Se(),{getObjectIcon:I}=nl(),$=sl(),D=l(""),b=l(),O=l(),q=l(),K=l(),z=l(),N=l(),h=l(),W=l(),m=l(),r=l(!1),R=l(""),_=l(""),S=l(""),V=l(""),C=l(""),M=l(""),j=l(""),A=l(""),J=l("source_address"),G=l("destination_address"),Y=l([""]);l([""]);const ee=l([""]),de=l(""),ce=l("");l(),l();const ve=l("*");l();const fe=l("*");l();const _e=l([]),F=l("*");l();const pe=l([]),me=l("DROP"),L=l([]);l();const Me=l([]),le=l("");l();const ge=l("bottom"),be=l(!1),ae=l([]),te=l(!1),g=l(new Ie);l([]),l([]),l([]),l([{id:"DROP",label:"DROP"},{id:"REJECT",label:"REJECT"},{id:"ACCEPT",label:"ACCEPT"}]),l([{id:"bottom",label:s("standalone.firewall_rules.add_to_the_bottom")},{id:"top",label:s("standalone.firewall_rules.add_to_the_top")}]),l([{id:"source_address",label:s("standalone.firewall_rules.enter_one_or_more_addresses")},{id:"source_object",label:s("standalone.firewall_rules.select_an_object")},{id:"source_any",label:s("standalone.firewall_rules.any_source_address")}]),l([{id:"destination_address",label:s("standalone.firewall_rules.enter_one_or_more_addresses")},{id:"destination_object",label:s("standalone.firewall_rules.select_an_object")},{id:"destination_any",label:s("standalone.firewall_rules.any_destination_address")}]);let v=l({listServiceSuggestions:!1,listObjectSuggestions:!1,listProtocols:!1,saveRule:!1}),k=l({listServiceSuggestions:"",listServiceSuggestionsDetails:"",listObjectSuggestions:"",listObjectSuggestionsDetails:"",listProtocols:"",listProtocolsDetails:"",saveRule:"",saveRuleDetails:""});const we=U(()=>!n.currentRule),se=U(()=>!!n.currentRule&&!n.isDuplicatingRule);U(()=>{if(se.value)return s("standalone.firewall_rules.edit_rule");if(n.isDuplicatingRule)return s("standalone.firewall_rules.duplicate_rule");switch(n.ruleType){case"forward":return s("standalone.firewall_rules.add_forward_rule");case"input":return s("standalone.firewall_rules.add_input_rule");case"output":return s("standalone.firewall_rules.add_output_rule");default:return""}}),U(()=>[...[{id:"*",label:s("common.any")},{id:"custom",label:s("standalone.firewall_rules.custom_service")}],...pe.value]),U(()=>{const a={id:"*",label:s("common.any")},t=$.zones.map(u=>{var d;return{id:u.name,label:u.name.toUpperCase(),description:(d=u.interfaces)==null?void 0:d.join(", ")}});return[a,...t]}),U(()=>_e.value.map(a=>({id:a.id,label:a.name,description:s(`standalone.objects.subtype_${a.subtype}`),icon:I(a.subtype)}))),oe(()=>n.isShown,()=>{var a;n.isShown&&(Te(),g.value.clear(),Le(()=>{Be(b)}),Ee(),xe(),we.value?(r.value=!0,D.value="",J.value="source_address",G.value="destination_address",Y.value=[""],de.value="",ee.value=[""],ce.value="",ve.value="*",fe.value="*",F.value="*",me.value="DROP",L.value=[],le.value="",ge.value="bottom",ae.value=[],te.value=!1,be.value=!1):n.currentRule&&(r.value=n.currentRule.enabled||!1,ve.value=n.currentRule.src||"*",fe.value=n.currentRule.dest||"*",F.value="*",L.value=[],me.value=n.currentRule.target||"DROP",ge.value="bottom",ae.value=((a=n.currentRule.ns_tag)==null?void 0:a.map(t=>({id:t,label:t})))||[],te.value=n.currentRule.log||!1,be.value=ae.value.length>0||te.value,se.value?D.value=n.currentRule.name||"":D.value=s("standalone.firewall_rules.duplicated_rule_name",{name:n.currentRule.name})))}),oe(()=>F.value,()=>{F.value==="custom"&&Oe()});function je(a){if(!a.src_ip)return[];const t=[];if(a.ns_src)J.value="source_object",de.value=a.ns_src;else if(a.src_ip.length){J.value="source_address";for(const u of a.src_ip)t.push(u.value)}else J.value="source_any";t.length?Y.value=t:Y.value=[""]}function Ae(a){if(!a.dest_ip)return[];const t=[];if(a.ns_dst)G.value="destination_object",ce.value=a.ns_dst;else if(a.dest_ip.length){G.value="destination_address";for(const u of a.dest_ip)t.push(u.value)}else G.value="destination_any";t.length?ee.value=t:ee.value=[""]}function ne(){B("close")}function Te(){for(const[a,t]of Object.entries(k.value))typeof t=="string"?k.value[a]="":Array.isArray(t)&&(k.value[a]=[])}async function xe(){v.value.listObjectSuggestions=!0;try{const a=await Z("ns.firewall","list-object-suggestions");_e.value=a.data.objects,n.currentRule&&(je(n.currentRule),Ae(n.currentRule))}catch(a){console.error(a),k.value.listObjectSuggestions=s(H(a)),k.value.listObjectSuggestionsDetails=a.toString()}finally{v.value.listObjectSuggestions=!1}}async function Ee(){v.value.listServiceSuggestions=!0;try{const a=await Z("ns.firewall","list-service-suggestions");pe.value=a.data.services.map(t=>{const u=s("standalone.firewall_rules.service_ports",{protocols:t.proto.join("/").toUpperCase(),ports:t.port},1);return{id:t.id,label:t.id,description:u,protocols:t.proto,port:t.port}}),n.currentRule&&(n.currentRule.ns_service==="custom"?(F.value="custom",le.value=n.currentRule.dest_port.join(", ")||""):(F.value=n.currentRule.ns_service||"*",le.value="",L.value=[]))}catch(a){console.error(a),k.value.listServiceSuggestions=s(H(a)),k.value.listServiceSuggestionsDetails=a.toString()}finally{v.value.listServiceSuggestions=!1}}async function Oe(){v.value.listProtocols=!0;try{const t=(await Z("ns.redirects","list-protocols")).data.protocols.filter(u=>u!=="all");Me.value=t.map(u=>({id:u,label:u.toUpperCase()})),n.currentRule&&(n.currentRule.proto.length&&n.currentRule.ns_service==="custom"?L.value=n.currentRule.proto.map(u=>({id:u,label:u.toUpperCase()})):L.value=[])}catch(a){console.error(a),k.value.listProtocols=s(H(a)),k.value.listProtocolsDetails=a.toString()}finally{v.value.listProtocols=!1}}const he=()=>{g.value.clear();let a=!0;return[{key:"localNetwork",value:R,ref:O},{key:"listenPort",value:_,ref:q},{key:"listenip",value:S,ref:K},{key:"serverPort",value:V,ref:z},{key:"peerPublicKey",value:C,ref:N},{key:"allowedIP",value:M,ref:h},{key:"persistKeepAlive",value:j,ref:W},{key:"mtu",value:A,ref:m}].forEach(u=>{$e(u.value.value).valid||(g.value.set(u.key,s("required")),a=!1)}),a},ye={localNetwork:R,listenPort:_,listenip:S,serverPort:V,peerPublicKey:C,allowedIP:M,persistKeepAlive:j,mtu:A};Object.keys(ye).forEach(a=>{oe(ye[a],t=>{t!==""&&g.value.delete(a)})});const Fe=async()=>{try{if(!he())return;const a={isRuleEnabled:r.value,localNetwork:R.value,listenPort:_.value,listenip:S.value,serverPort:V.value,peerPublicKey:C.value,allowedIP:M.value,persistKeepAlive:j.value,mtu:A.value};if((await Ve.post(`${Ce()}/wirguard`,{method:"set-config",payload:{service:r.value,local_network:R.value,listen_port:_.value,server_port:V.value,peer_public_key:C.value,allowed_ips:M.value,persistent_keepalive:j.value,mtu:A.value}})).data.code===200)X.createNotification({title:"Success",description:"Configuration saved successfully.",kind:"success"}),r.value=!1,R.value="",_.value="",S.value="",V.value="",C.value="",M.value="",j.value="",A.value="",g.value.clear(),B("save",a),ne();else throw new Error("Failed to save configuration.")}catch(a){console.error("Error:====",a)}};return(a,t)=>(w(),E(e(Ne),{isShown:Q.isShown,title:e(s)("standalone.wire_guard.add_client_tunnel"),closeAriaLabel:e(s)("standalone.wire_guard.add_client_tunnel"),onClose:ne},{default:i(()=>{var u;return[y("form",null,[y("div",ol,[se.value&&((u=n.currentRule)!=null&&u.system_rule)?(w(),E(e(Pe),{key:0,kind:"warning",title:e(s)("standalone.firewall_rules.editing_system_rule_warning_title"),description:e(s)("standalone.firewall_rules.editing_system_rule_warning_description")},null,8,["title","description"])):De("",!0),o(e(Ke),{modelValue:r.value,"onUpdate:modelValue":t[0]||(t[0]=d=>r.value=d),label:r.value?e(s)("common.enabled"):e(s)("common.disabled"),topLabel:e(s)("common.status"),disabled:e(v).saveRule},null,8,["modelValue","label","topLabel","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.local_network"),modelValue:R.value,"onUpdate:modelValue":t[1]||(t[1]=d=>R.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("localNetwork"),disabled:e(v).saveRule,ref_key:"localNetworkRef",ref:O},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.listen_port"),modelValue:_.value,"onUpdate:modelValue":t[2]||(t[2]=d=>_.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("listenPort"),disabled:e(v).saveRule,ref_key:"listenPortRef",ref:q},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.listen_ip"),modelValue:S.value,"onUpdate:modelValue":t[3]||(t[3]=d=>S.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("listenip"),disabled:e(v).saveRule,ref_key:"listenipRef",ref:K},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.server_port"),modelValue:V.value,"onUpdate:modelValue":t[4]||(t[4]=d=>V.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("serverPort"),disabled:e(v).saveRule,ref_key:"serverPortRef",ref:z},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.peer_public_key"),modelValue:C.value,"onUpdate:modelValue":t[5]||(t[5]=d=>C.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("peerPublicKey"),disabled:e(v).saveRule,ref_key:"peerPublicKeyRef",ref:N},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.allowed_ip"),modelValue:M.value,"onUpdate:modelValue":t[6]||(t[6]=d=>M.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("allowedIP"),disabled:e(v).saveRule,ref_key:"allowedIPRef",ref:h},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.persist_keep_alive"),modelValue:j.value,"onUpdate:modelValue":t[7]||(t[7]=d=>j.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("persistKeepAlive"),disabled:e(v).saveRule,ref_key:"persistKeepAliveRef",ref:W},null,8,["label","modelValue","invalidMessage","disabled"]),o(e(P),{label:e(s)("standalone.wire_guard.mtu"),modelValue:A.value,"onUpdate:modelValue":t[8]||(t[8]=d=>A.value=d),modelModifiers:{trim:!0},invalidMessage:g.value.getFirstFor("mtu"),disabled:e(v).saveRule,ref_key:"mtuRef",ref:m},null,8,["label","modelValue","invalidMessage","disabled"])]),t[9]||(t[9]=y("hr",{class:"my-8 border-gray-200 dark:border-gray-700"},null,-1)),y("div",rl,[o(e(ue),{kind:"tertiary",size:"lg",onClick:Re(ne,["prevent"]),disabled:e(v).saveRule,class:"mr-3"},{default:i(()=>[c(p(e(s)("common.cancel")),1)]),_:1},8,["disabled"]),o(e(ue),{kind:"primary",size:"lg",onClick:Re(Fe,["prevent"]),disabled:e(v).saveRule,loading:e(v).saveRule},{default:i(()=>[c(p(we.value?e(s)("standalone.wire_guard.save"):e(s)("standalone.wire_guard.save")),1)]),_:1},8,["disabled","loading"])])])]}),_:1},8,["isShown","title","closeAriaLabel"]))}}),ul={class:"flex flex-col"},dl={class:"flex flex-col justify-between md:flex-row md:items-center"},cl={class:"mb-6 text-sm text-gray-500 dark:text-gray-400"},vl={class:"space-y-6"},fl={class:"flex flex-col items-start justify-between gap-6 lg:flex-row"},_l={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},pl=1e4,Rl=ke({__name:"WireGuardView",setup(Q){const{t:f}=Se(),X=qe(),n=l(!0),B=l([]),s=l(null),I=l(!1),$=l(!1),D=l(0),b=l({notificationTitle:"",notificationDescription:"",notificationDetails:""});async function O(m=!0){try{m&&(n.value=!0),B.value=(await Z("ns.ipsectunnel","list-tunnels")).data.tunnels,n.value=!1}catch(r){b.value.notificationTitle=f("error.cannot_retrieve_ipsec_tunnels"),b.value.notificationDescription=f(H(r)),b.value.notificationDetails=r.toString()}finally{m&&(n.value=!1)}}function q(m){s.value=m,I.value=!0}function K(){s.value=null,$.value=!1,I.value=!1}function z(){b.value={notificationTitle:"",notificationDescription:"",notificationDetails:""}}async function N(){z(),await O(),await X.getChanges()}ze(()=>{O(),W(),D.value=setInterval(()=>O(!1),pl)}),We(()=>{D.value&&clearInterval(D.value)});const h=l(),W=async()=>{try{n.value=!0;const m=await Ve.post(`${Ce()}/wireguard`,{method:"get-config",payload:{}});m.data.code===200&&(n.value=!1,h.value=[m.data.data])}catch(m){n.value=!1,console.error("Error:====",m)}n.value=!1};return(m,r)=>{const R=Je("font-awesome-icon");return w(),re(ie,null,[y("div",ul,[y("div",dl,[o(e(Ge),{tag:"h3",class:"mb-7"},{default:i(()=>[c(p(e(f)("standalone.wire_guard.title")),1)]),_:1}),y("div",cl,p(e(f)("common.data_updated_every_seconds",{seconds:10})),1)]),y("div",vl,[y("div",fl,[y("p",_l,p(e(f)("standalone.wire_guard.description")),1)]),b.value.notificationTitle?(w(),E(e(Pe),{key:0,kind:"error",title:b.value.notificationTitle,description:b.value.notificationDescription},Ze({_:2},[b.value.notificationDetails?{name:"details",fn:i(()=>[c(p(b.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):De("",!0),n.value?(w(),E(e(He),{key:1,lines:8,size:"lg"})):(w(),re(ie,{key:2},[h.value.length>0?(w(),E(e(el),{key:0,cardBreakpoint:"md",class:"mt-2"},{default:i(()=>[o(e(Qe),null,{default:i(()=>[o(e(T),null,{default:i(()=>r[1]||(r[1]=[c("Local Public Key")])),_:1}),o(e(T),null,{default:i(()=>r[2]||(r[2]=[c("Local Network")])),_:1}),o(e(T),null,{default:i(()=>r[3]||(r[3]=[c("Listen Port")])),_:1}),o(e(T),null,{default:i(()=>r[4]||(r[4]=[c("Server IP")])),_:1}),o(e(T),null,{default:i(()=>r[5]||(r[5]=[c("Server Port")])),_:1}),o(e(T),null,{default:i(()=>r[6]||(r[6]=[c("Peer Public Key")])),_:1}),o(e(T),null,{default:i(()=>r[7]||(r[7]=[c("Allowed IPs")])),_:1})]),_:1}),o(e(Ye),null,{default:i(()=>[(w(!0),re(ie,null,Xe(h.value,(_,S)=>(w(),E(e(al),{key:S},{default:i(()=>[o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.local_public_key),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.local_network),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.listen_port),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.server_ip),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.server_port),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.peer_public_key),1)]),_:2},1032,["data-label"]),o(e(x),{"data-label":e(f)("standalone.real_time_monitor.interface")},{default:i(()=>[c(p(_.allowed_ips),1)]),_:2},1032,["data-label"])]),_:2},1024))),128))]),_:1})]),_:1})):(w(),E(e(ll),{key:1,title:e(f)("standalone.wire_guard.no_wire_guard_found"),icon:["fas","globe"]},{default:i(()=>[o(e(ue),{kind:"primary",onClick:r[0]||(r[0]=_=>q(null))},{prefix:i(()=>[o(R,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:i(()=>[c(" "+p(e(f)("standalone.wire_guard.add_wire_guard_tunnel")),1)]),_:1})]),_:1},8,["title"]))],64))])]),o(tl,{visible:$.value,"item-to-delete":s.value,onClose:K,onTunnelDeleted:N},null,8,["visible","item-to-delete"]),o(il,{"item-to-edit":s.value,"rule-type":"forward","known-tags":[],onClose:K,onAddEditTunnel:N,"is-shown":I.value},null,8,["item-to-edit","is-shown"])],64)}}});export{Rl as default};

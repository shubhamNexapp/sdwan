import{d as k,u as B,O as C,r as c,h as u,i as d,w as m,m as p,t as f,l as e,L,M as T,n as w,Y as x,e as V,V as S}from"./index-BlEQ5104.js";const N=k({__name:"DeleteTunnelModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","tunnel-deleted"],setup(v,{emit:D}){const{t:i}=B(),y=v,l=D,{visible:_,itemToDelete:s}=C(y),t=c({notificationDescription:"",notificationDetails:""}),n=c(!1);async function b(){if(s.value)try{t.value={notificationDescription:"",notificationDetails:""},n.value=!0,await V("ns.ipsectunnel","delete-tunnel",{id:s.value.id}),l("tunnel-deleted"),l("close")}catch(r){t.value.notificationDescription=i(S(r)),t.value.notificationDetails=r.toString()}finally{n.value=!1}}function g(){t.value={notificationDescription:"",notificationDetails:""},l("close")}return(r,a)=>(u(),d(e(x),{visible:e(_),kind:"warning",title:e(i)("standalone.ipsec_tunnel.delete_tunnel"),primaryLabel:e(i)("common.delete"),primaryButtonDisabled:n.value,primaryButtonLoading:n.value,"close-aria-label":e(i)("common.close"),onPrimaryClick:a[0]||(a[0]=o=>b()),onClose:a[1]||(a[1]=o=>g())},{default:m(()=>{var o;return[p(f(e(i)("standalone.ipsec_tunnel.delete_tunnel_message",{name:((o=e(s))==null?void 0:o.name)??""}))+" ",1),t.value.notificationDescription?(u(),d(e(L),{key:0,kind:"error",title:e(i)("error.cannot_delete_tunnel"),description:t.value.notificationDescription,class:"my-2"},T({_:2},[t.value.notificationDetails?{name:"details",fn:m(()=>[p(f(t.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):w("",!0)]}),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}});export{N as _};

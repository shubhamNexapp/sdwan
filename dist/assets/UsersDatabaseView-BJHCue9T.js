import{u as ke}from"./useTabs-BeLQ169O.js";import{d as J,u as Q,r as o,aa as re,J as ne,h as p,i as $,w as s,l as e,L as O,M as Y,m,t as i,n as h,j as D,k as n,Q as B,ar as Ve,s as q,a1 as oe,a5 as te,_ as z,ai as de,e as A,V as N,ag as ue,S as R,aM as Se,cu as Te,c as Ce,q as P,ad as ve,z as W,Y as se,aI as xe,g as Z,aK as $e,al as H,ak as Ue,am as Ie,aq as Ee,an as Fe,ao as X,cv as he,ap as ce,av as ee,cw as Le,cx as Be,U as me,b as Ae,o as be,W as le,y as pe,aj as Me,cy as Pe,ac as Ke,a9 as qe}from"./index-BlEQ5104.js";const ze={class:"flex flex-col gap-y-6"},je={class:"flex justify-end"},fe=J({__name:"CreateOrEditDatabaseDrawer",props:{isShown:{type:Boolean},itemToEdit:{}},emits:["close","add-edit-database"],setup(M,{emit:U}){const C=M,{t:a}=Q(),l=U,c=o(!1),t=o({notificationTitle:"",notificationDescription:"",notificationDetails:""}),r=o(new re),w=o(!1),g=o(!1),d=o(null),f=o(!1),T=o(""),k=o("rfc2307"),I=o(""),_=o(""),F=o(""),E=o(""),L=o(""),y=o(""),V=o(!1),u=o(!1),x=o(""),K=o(""),j=[{id:"rfc2307",label:a("standalone.users_database.remote_ldap")},{id:"ad",label:a("standalone.users_database.remote_active_directory")}];async function _e(){if(d.value=null,C.itemToEdit){f.value=!0;try{w.value=!0;const S=(await A("ns.users","get-database",{name:C.itemToEdit.name})).data.database;T.value=S.name,k.value=S.schema,I.value=S.uri,_.value=S.base_dn,F.value=S.user_dn,E.value=S.user_display_attr,L.value=S.user_bind_dn,y.value=S.user_attr,V.value=S.start_tls==="1",u.value=S.tls_reqcert==="always",x.value=S.bind_dn,K.value=S.bind_password,w.value=!1}catch(S){t.value.notificationTitle=a("error.cannot_retrieve_database_details"),t.value.notificationDescription=a(N(S)),t.value.notificationDetails=S.toString()}}else f.value=!1,T.value="",k.value="rfc2307",I.value="",_.value="",F.value="",E.value="",L.value="",y.value="",V.value=!1,u.value=!1,x.value="",K.value=""}function ae(){g.value||(r.value.clear(),t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",l("close"))}function ge(S,v){for(let b of S)b.valid||r.value.set(v,[b.errMessage]);return S.every(b=>b.valid)}function ye(S){let v=!0;const b=R(I.value);if(!b.valid)r.value.set("uri",[b.errMessage]),v=!1;else{const G=Te(I.value);G.valid||(r.value.set("uri",[G.errMessage]),v=!1)}return v}function ie(){r.value.clear();const S=[[[R(T.value),Se(T.value)],"name"],[[R(_.value)],"base_dn"],[[R(F.value)],"user_dn"],[[R(y.value)],"user_attr"],[[R(E.value)],"user_display_attr"]],v=ye();return S.map(([b,G])=>ge(b,G)).every(b=>b)&&v}async function De(){t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",r.value.clear();try{if(ie()){g.value=!0;const S={uri:I.value,schema:k.value,base_dn:_.value,user_dn:F.value,user_attr:y.value,start_tls:V.value,user_display_attr:E.value,description:"",tls_reqcert:u.value?"always":"never",bind_dn:x.value,bind_password:K.value};d.value=(await A("ns.users","test-ldap",S)).data.users}}catch(S){t.value.notificationTitle=a("error.database_test_failed"),t.value.notificationDescription=a(N(S)),t.value.notificationDetails=S.toString()}finally{g.value=!1}}async function we(){t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",r.value.clear();try{c.value=!0;const S=f.value?"edit-ldap-database":"add-ldap-database";if(ie()){let v={name:T.value,uri:I.value,schema:k.value,base_dn:_.value,user_dn:F.value,user_attr:y.value,start_tls:V.value,user_display_attr:E.value,description:"",tls_reqcert:u.value?"always":"never",bind_dn:x.value,bind_password:K.value,user_bind_dn:L.value};await A("ns.users",S,v),l("add-edit-database",T.value),ae()}}catch(S){S instanceof ue?r.value=S.errorBag:(t.value.notificationTitle=f.value?a("error.cannot_edit_database"):a("error.cannot_create_database"),t.value.notificationDescription=a(N(S)),t.value.notificationDetails=S.toString())}finally{c.value=!1}}return ne(()=>C.isShown,()=>{C.isShown&&_e()}),(S,v)=>(p(),$(e(de),{"is-shown":S.isShown,onClose:v[15]||(v[15]=b=>ae()),closeAriaLabel:e(a)("common.shell.close_side_drawer"),title:f.value?e(a)("standalone.users_database.edit_remote_database"):e(a)("standalone.users_database.add_remote_database")},{default:s(()=>[t.value.notificationTitle?(p(),$(e(O),{key:0,title:t.value.notificationTitle,description:t.value.notificationDescription,class:"mb-6",kind:"error"},Y({_:2},[t.value.notificationDetails?{name:"details",fn:s(()=>[m(i(t.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0),D("div",ze,[n(e(B),{modelValue:T.value,"onUpdate:modelValue":v[0]||(v[0]=b=>T.value=b),disabled:f.value,label:e(a)("standalone.users_database.database_name"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("name"))},null,8,["modelValue","disabled","label","invalid-message"]),n(e(Ve),{label:e(a)("standalone.users_database.type"),options:j,modelValue:k.value,"onUpdate:modelValue":v[1]||(v[1]=b=>k.value=b)},null,8,["label","modelValue"]),n(e(B),{modelValue:I.value,"onUpdate:modelValue":v[2]||(v[2]=b=>I.value=b),label:e(a)("standalone.users_database.ldap_uri"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("uri")),placeholder:"ldaps://192.168.100.234"},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.ldap_uri_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),n(e(B),{modelValue:_.value,"onUpdate:modelValue":v[3]||(v[3]=b=>_.value=b),label:e(a)("standalone.users_database.base_dn"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("base_dn"))},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.base_dn_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),n(e(B),{modelValue:F.value,"onUpdate:modelValue":v[4]||(v[4]=b=>F.value=b),label:e(a)("standalone.users_database.user_dn"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("user_dn"))},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.user_dn_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),n(e(B),{modelValue:y.value,"onUpdate:modelValue":v[5]||(v[5]=b=>y.value=b),label:e(a)("standalone.users_database.user_attribute"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("user_attr"))},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.user_attribute_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),n(e(B),{modelValue:E.value,"onUpdate:modelValue":v[6]||(v[6]=b=>E.value=b),label:e(a)("standalone.users_database.user_display_attribute"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("user_display_attr"))},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.user_display_attribute_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message"]),n(e(B),{modelValue:L.value,"onUpdate:modelValue":v[7]||(v[7]=b=>L.value=b),label:e(a)("standalone.users_database.user_bind_dn"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("user_bind_dn")),optional:!0,"optional-label":e(a)("common.optional")},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.user_bind_dn_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message","optional-label"]),n(e(B),{modelValue:x.value,"onUpdate:modelValue":v[8]||(v[8]=b=>x.value=b),label:e(a)("standalone.users_database.bind_dn"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("bind_dn")),optional:!0,"optional-label":e(a)("common.optional")},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.bind_dn_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message","optional-label"]),n(e(B),{modelValue:K.value,"onUpdate:modelValue":v[9]||(v[9]=b=>K.value=b),label:e(a)("standalone.users_database.bind_password"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("bind_password")),optional:!0,"optional-label":e(a)("common.optional")},{tooltip:s(()=>[n(e(q),null,{content:s(()=>[m(i(e(a)("standalone.users_database.bind_password_tooltip")),1)]),_:1})]),_:1},8,["modelValue","label","invalid-message","optional-label"]),D("div",null,[n(e(oe),null,{default:s(()=>[m(i(e(a)("standalone.users_database.starttls")),1)]),_:1}),n(e(te),{modelValue:V.value,"onUpdate:modelValue":v[10]||(v[10]=b=>V.value=b),label:V.value?e(a)("common.enabled"):e(a)("common.disabled")},null,8,["modelValue","label"])]),D("div",null,[n(e(oe),null,{default:s(()=>[m(i(e(a)("standalone.users_database.verify_tls_certificate")),1)]),_:1}),n(e(te),{modelValue:u.value,"onUpdate:modelValue":v[11]||(v[11]=b=>u.value=b),label:u.value?e(a)("common.enabled"):e(a)("common.disabled")},null,8,["modelValue","label"])]),d.value?(p(),$(e(O),{key:0,title:e(a)("standalone.users_database.connection_verified"),description:e(a)("standalone.users_database.n_users_found",{n:d.value.length}),class:"mb-6",kind:"info"},null,8,["title","description"])):h("",!0),v[16]||(v[16]=D("hr",null,null,-1)),D("div",je,[n(e(z),{kind:"tertiary",class:"mr-4",onClick:v[12]||(v[12]=b=>ae())},{default:s(()=>[m(i(e(a)("common.cancel")),1)]),_:1}),n(e(z),{kind:"secondary",class:"mr-4",disabled:g.value,loading:g.value,onClick:v[13]||(v[13]=b=>De())},{default:s(()=>[m(i(e(a)("standalone.users_database.test")),1)]),_:1},8,["disabled","loading"]),n(e(z),{kind:"primary",onClick:v[14]||(v[14]=b=>we()),disabled:c.value||g.value,loading:c.value},{default:s(()=>[m(i(f.value?e(a)("common.save"):e(a)("standalone.users_database.add_database")),1)]),_:1},8,["disabled","loading"])])])]),_:1},8,["is-shown","closeAriaLabel","title"]))}}),Ne={class:"space-y-2"},Oe={class:"list-inside list-disc"},Re=J({__name:"DeleteDatabaseModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","database-deleted"],setup(M,{emit:U}){const C=M,a=U,{t:l}=Q(),c=o({notificationDescription:"",notificationDetails:""}),t=o(!1);async function r(){try{c.value.notificationDescription="",c.value.notificationDetails="",t.value=!0,await A("ns.users","delete-ldap-database",{name:C.itemToDelete.name}),a("database-deleted"),a("close")}catch(d){c.value.notificationDescription=l(N(d)),c.value.notificationDetails=d.toString()}finally{t.value=!1}}function w(){c.value.notificationDescription="",c.value.notificationDetails="",a("close")}const g=Ce(()=>{var d;return(((d=C.itemToDelete.used)==null?void 0:d.length)??0)>0});return(d,f)=>g.value?(p(),$(e(se),{key:0,"close-aria-label":e(l)("common.close"),"primary-label":e(l)("common.close"),title:e(l)("standalone.users_database.cannot_delete_database",{name:d.itemToDelete.name}),visible:d.visible,kind:"warning",onClose:f[0]||(f[0]=T=>w()),onPrimaryClick:f[1]||(f[1]=T=>w())},{default:s(()=>[D("div",Ne,[D("p",null,i(e(l)("standalone.users_database.cannot_delete_database_description",{name:d.itemToDelete.name})),1),D("ul",Oe,[(p(!0),P(W,null,ve(d.itemToDelete.used,T=>(p(),P("li",{key:T},i(e(l)("standalone.users_database."+T)),1))),128))])])]),_:1},8,["close-aria-label","primary-label","title","visible"])):(p(),$(e(se),{key:1,visible:d.visible,kind:"warning",title:e(l)("standalone.users_database.delete_database"),primaryLabel:e(l)("common.delete"),primaryButtonDisabled:t.value,primaryButtonLoading:t.value,"close-aria-label":e(l)("common.close"),onPrimaryClick:f[2]||(f[2]=T=>r()),onClose:f[3]||(f[3]=T=>w())},{default:s(()=>[m(i(e(l)("standalone.users_database.delete_database_message",{name:d.itemToDelete.name}))+" ",1),c.value.notificationDescription?(p(),$(e(O),{key:0,kind:"error",title:e(l)("error.cannot_delete_database"),description:c.value.notificationDescription,class:"my-2"},Y({_:2},[c.value.notificationDetails?{name:"details",fn:s(()=>[m(i(c.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0)]),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}}),We={class:ee(["flex","flex-row","items-center"])},Ye={class:"text-center"},Je={class:ee(["flex","flex-row","items-center"])},Qe={class:"align-center -ml-2.5 flex gap-2 xl:ml-0 xl:justify-end"},Ge=J({__name:"UsersTable",props:{users:{},isLdapDatabase:{type:Boolean}},emits:["delete","edit","setAdmin","removeAdmin"],setup(M,{emit:U}){const C=M,a=U,{t:l}=Q(),c=o(10),{currentPage:t,paginatedItems:r}=xe(()=>C.users,{itemsPerPage:c});function w(g){return[{id:"delete",label:l("common.delete"),iconStyle:"fas",icon:"trash",danger:!0,action:()=>{a("delete",g)}},g.admin?{id:"remove_admin",label:l("standalone.users_database.remove_admin"),iconStyle:"fas",icon:"circle-minus",action:()=>{a("removeAdmin",g)}}:{id:"set_admin",label:l("standalone.users_database.set_admin"),iconStyle:"fas",icon:"crown",action:()=>{a("setAdmin",g)}}]}return(g,d)=>{const f=Z("FontAwesomeIcon"),T=Z("font-awesome-icon");return p(),$(e(Ee),{ariaLabel:e(l)("standalone.users_database.users"),cardBreakpoint:"xl"},{paginator:s(()=>[n(e($e),{"current-page":e(t),"total-rows":g.users.length,"page-size":c.value,"nav-pagination-label":e(l)("ne_table.pagination"),"next-label":e(l)("ne_table.go_to_next_page"),"previous-label":e(l)("ne_table.go_to_previous_page"),"range-of-total-label":e(l)("ne_table.of"),"page-size-label":e(l)("ne_table.show"),onSelectPage:d[0]||(d[0]=k=>{t.value=k}),onSelectPageSize:d[1]||(d[1]=k=>{c.value=k})},null,8,["current-page","total-rows","page-size","nav-pagination-label","next-label","previous-label","range-of-total-label","page-size-label"])]),default:s(()=>[n(e(Ue),null,{default:s(()=>[n(e(H),null,{default:s(()=>[m(i(e(l)("standalone.users_database.username")),1)]),_:1}),n(e(H),null,{default:s(()=>[m(i(e(l)("standalone.users_database.display_name")),1)]),_:1}),C.isLdapDatabase?h("",!0):(p(),P(W,{key:0},[n(e(H),null,{default:s(()=>[m(i(e(l)("standalone.users_database.password")),1)]),_:1}),n(e(H))],64))]),_:1}),n(e(Ie),null,{default:s(()=>[(p(!0),P(W,null,ve(e(r),k=>(p(),$(e(Fe),{key:k.name},{default:s(()=>[n(e(X),{"data-label":e(l)("standalone.users_database.username")},{default:s(()=>[D("div",We,[m(i(k.name)+" ",1),k.admin?(p(),$(e(q),{key:0,interactive:""},{trigger:s(()=>[k.admin?(p(),$(f,{key:0,icon:e(he),class:"ml-2 text-indigo-700 dark:text-indigo-500","aria-hidden":"true"},null,8,["icon"])):h("",!0)]),content:s(()=>[D("p",Ye,i(e(l)("standalone.users_database.administrator_table_tooltip")),1)]),_:2},1024)):h("",!0)])]),_:2},1032,["data-label"]),n(e(X),{"data-label":e(l)("standalone.users_database.display_name")},{default:s(()=>[m(i(k.description||"-"),1)]),_:2},1032,["data-label"]),C.isLdapDatabase?h("",!0):(p(),P(W,{key:0},[n(e(X),{"data-label":e(l)("standalone.users_database.password")},{default:s(()=>[D("div",Je,[n(T,{icon:["fas",k.password?"circle-check":"circle-xmark"],class:"mr-2 h-5 w-5","aria-hidden":"true"},null,8,["icon"]),D("p",null,i(k.password?e(l)("standalone.users_database.set"):e(l)("standalone.users_database.not_set")),1)])]),_:2},1032,["data-label"]),n(e(X),{"data-label":e(l)("common.actions")},{default:s(()=>[D("div",Qe,[n(e(z),{kind:"tertiary",onClick:I=>a("edit",k)},{prefix:s(()=>[n(T,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(" "+i(e(l)("common.edit")),1)]),_:2},1032,["onClick"]),n(e(ce),{items:w(k),"align-to-right":!0},null,8,["items"])])]),_:2},1032,["data-label"])],64))]),_:2},1024))),128))]),_:1})]),_:1},8,["ariaLabel"])}}}),He=J({__name:"DeleteUserModal",props:{visible:{type:Boolean},itemToDelete:{}},emits:["close","user-deleted"],setup(M,{emit:U}){const C=M,a=U,{t:l}=Q(),c=o({notificationDescription:"",notificationDetails:""}),t=o(!1);async function r(){if(C.itemToDelete)try{c.value.notificationDescription="",c.value.notificationDetails="",t.value=!0,await A("ns.users","delete-local-user",{name:C.itemToDelete.name,database:"main"}),a("user-deleted"),a("close")}catch(g){c.value.notificationDescription=l(N(g)),c.value.notificationDetails=g.toString()}finally{t.value=!1}}function w(){c.value.notificationDescription="",c.value.notificationDetails="",a("close")}return(g,d)=>(p(),$(e(se),{visible:g.visible,kind:"warning",title:e(l)("standalone.users_database.delete_user"),primaryLabel:e(l)("common.delete"),primaryButtonDisabled:t.value,primaryButtonLoading:t.value,"close-aria-label":e(l)("common.close"),onPrimaryClick:d[0]||(d[0]=f=>r()),onClose:d[1]||(d[1]=f=>w())},{default:s(()=>{var f;return[m(i(e(l)("standalone.users_database.delete_user_message",{name:((f=g.itemToDelete)==null?void 0:f.name)??""}))+" ",1),c.value.notificationDescription?(p(),$(e(O),{key:0,kind:"error",title:e(l)("error.cannot_delete_user"),description:c.value.notificationDescription,class:"my-2"},Y({_:2},[c.value.notificationDetails?{name:"details",fn:s(()=>[m(i(c.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0)]}),_:1},8,["visible","title","primaryLabel","primaryButtonDisabled","primaryButtonLoading","close-aria-label"]))}}),Xe={class:"flex flex-col gap-y-6"},Ze={class:"list-inside list-disc text-sm font-normal text-gray-500 dark:text-gray-400"},ea={class:"flex justify-end"},aa=J({__name:"CreateOrEditUserDrawer",props:{isShown:{type:Boolean},itemToEdit:{}},emits:["close","add-edit-user"],setup(M,{emit:U}){const C=M,{t:a}=Q(),l=U,c=o(!1),t=o({notificationTitle:"",notificationDescription:"",notificationDetails:""}),r=o(new re),w=o(""),g=o(""),d=o(""),f=o(""),T=o(""),k=o(!1);async function I(){C.itemToEdit?(w.value=C.itemToEdit.id,g.value=C.itemToEdit.name,d.value=C.itemToEdit.description,k.value=C.itemToEdit.admin):(w.value="",g.value="",d.value="",k.value=!1),f.value="",T.value=""}function _(){r.value.clear(),t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",l("close")}function F(){r.value.clear();let L=!0;const y=R(g.value);if(y.valid||(r.value.set("name",[y.errMessage]),L=!1),f.value!=""||T.value!=""){const V=Le(f.value);if(!V.valid)r.value.set("password",[V.errMessage]),L=!1;else{const u=Be(f.value,T.value);u.valid||(r.value.set("confirmPassword",[u.errMessage]),L=!1)}}return L}async function E(){var L,y;t.value.notificationTitle="",t.value.notificationDescription="",t.value.notificationDetails="",r.value.clear();try{c.value=!0;const V=w.value?"edit-local-user":"add-local-user",u={name:g.value,description:d.value,password:f.value,database:"main",extra:{}};w.value&&(u.id=w.value),F()&&(await A("ns.users",V,u),k.value&&!((L=C.itemToEdit)!=null&&L.admin)?await A("ns.users","set-admin",{name:u.name,database:"main"}):!k.value&&((y=C.itemToEdit)!=null&&y.admin)&&await A("ns.users","remove-admin",{name:u.name,database:"main"}),l("add-edit-user"),_())}catch(V){V instanceof ue?r.value=V.errorBag:(t.value.notificationTitle=w.value?a("error.cannot_edit_user"):a("error.cannot_create_user"),t.value.notificationDescription=a(N(V)),t.value.notificationDetails=V.toString())}finally{c.value=!1}}return ne(()=>C.isShown,()=>{C.isShown&&I()}),(L,y)=>(p(),$(e(de),{"is-shown":L.isShown,onClose:y[7]||(y[7]=V=>_()),closeAriaLabel:e(a)("common.shell.close_side_drawer"),title:w.value?e(a)("standalone.users_database.edit_user"):e(a)("standalone.users_database.add_user")},{default:s(()=>[t.value.notificationTitle?(p(),$(e(O),{key:0,title:t.value.notificationTitle,description:t.value.notificationDescription,class:"mb-6",kind:"error"},Y({_:2},[t.value.notificationDetails?{name:"details",fn:s(()=>[m(i(t.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0),D("div",Xe,[n(e(B),{modelValue:g.value,"onUpdate:modelValue":y[0]||(y[0]=V=>g.value=V),modelModifiers:{trim:!0},disabled:!!w.value,label:e(a)("standalone.users_database.username"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("name"))},null,8,["modelValue","disabled","label","invalid-message"]),n(e(B),{modelValue:d.value,"onUpdate:modelValue":y[1]||(y[1]=V=>d.value=V),modelModifiers:{trim:!0},label:e(a)("standalone.users_database.display_name"),optional:!0,"optional-label":e(a)("common.optional"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("description"))},null,8,["modelValue","label","optional-label","invalid-message"]),n(e(B),{modelValue:f.value,"onUpdate:modelValue":y[2]||(y[2]=V=>f.value=V),label:e(a)("standalone.users_database.user_password"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("password")),optional:!0,"optional-label":e(a)("common.optional"),"is-password":!0,placeholder:w.value?e(a)("standalone.users_database.unchanged"):""},null,8,["modelValue","label","invalid-message","optional-label","placeholder"]),D("ul",Ze,[D("li",null,i(e(a)("standalone.users_database.password_suggestion_1")),1),D("li",null,i(e(a)("standalone.users_database.password_suggestion_2")),1),D("li",null,i(e(a)("standalone.users_database.password_suggestion_3")),1),D("li",null,i(e(a)("standalone.users_database.password_suggestion_4")),1),D("li",null,i(e(a)("standalone.users_database.password_suggestion_5")),1)]),n(e(B),{modelValue:T.value,"onUpdate:modelValue":y[3]||(y[3]=V=>T.value=V),label:e(a)("standalone.users_database.confirm_user_password"),"invalid-message":e(a)(r.value.getFirstI18nKeyFor("confirmPassword")),optional:!0,"optional-label":e(a)("common.optional"),"is-password":!0,placeholder:w.value?e(a)("standalone.users_database.unchanged"):""},null,8,["modelValue","label","invalid-message","optional-label","placeholder"]),n(e(te),{modelValue:k.value,"onUpdate:modelValue":y[4]||(y[4]=V=>k.value=V),topLabel:e(a)("standalone.users_database.administrator"),label:k.value?e(a)("common.enabled"):e(a)("common.disabled")},{topTooltip:s(()=>[n(e(q),{placement:"top-start"},{content:s(()=>[m(i(e(a)("standalone.users_database.administrator_tooltip")),1)]),_:1})]),_:1},8,["modelValue","topLabel","label"]),y[8]||(y[8]=D("hr",null,null,-1)),D("div",ea,[n(e(z),{kind:"tertiary",class:"mr-4",onClick:y[5]||(y[5]=V=>_())},{default:s(()=>[m(i(e(a)("common.cancel")),1)]),_:1}),n(e(z),{kind:"primary",onClick:y[6]||(y[6]=V=>E()),disabled:c.value,loading:c.value},{default:s(()=>[m(i(w.value?e(a)("common.save"):e(a)("standalone.users_database.add_user")),1)]),_:1},8,["disabled","loading"])])])]),_:1},8,["is-shown","closeAriaLabel","title"]))}}),ta={class:"flex flex-col gap-y-6"},sa={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},la={class:"flex max-w-2xl flex-row items-center justify-between rounded-md border-l-4 border-indigo-400 p-5 text-gray-700 dark:border-indigo-500 dark:bg-gray-800 dark:text-gray-200 sm:rounded-lg sm:shadow"},na={class:"flex flex-row items-center"},ia={key:0,class:"text-sm"},oa={key:1,class:"text-sm"},ra={key:0,class:"ml-4 border-l border-gray-800 py-3 pl-4 dark:border-gray-600 md:ml-8 md:pl-8"},da={class:"ml-2 text-sm"},ua={class:"flex flex-row items-center"},va={class:"flex flex-row items-center justify-between"},ca={class:"max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"},ma=J({__name:"UsersDatabaseManager",props:{database:{}},emits:["database-changed","database-deleted"],setup(M,{emit:U}){const C=M,a=U,{t:l}=Q(),c=me(),t=o(!1),r=o([]),w=o({notificationDescription:"",notificationDetails:""}),g=o(!1),d=o(!1),f=o(!1),T=o(!1),k=o(),I=o(new AbortController);function _(u){k.value=u,f.value=!0}function F(u){k.value=u,T.value=!0}async function E(u){await A("ns.users","set-admin",{name:u.name,database:"main"}),V()}async function L(u){await A("ns.users","remove-admin",{name:u.name,database:"main"}),V()}async function y(){w.value.notificationDescription="",w.value.notificationDetails="";try{t.value=!0,r.value=(await A("ns.users","list-users",{database:C.database.name},{signal:I.value.signal})).data.users}catch(u){u instanceof Pe||(w.value.notificationDescription=l(N(u)),w.value.notificationDetails=u.toString())}finally{t.value=!1}}async function V(){await c.getChanges(),y()}return ne(()=>C.database,()=>{I.value.abort(),I.value=new AbortController,y()}),Ae(()=>{I.value.abort()}),be(()=>{y()}),(u,x)=>{const K=Z("font-awesome-icon");return p(),P(W,null,[D("div",ta,[D("div",null,[n(e(le),{tag:"h5",class:"mb-2"},{default:s(()=>[m(i(e(l)("standalone.users_database.database_configuration")),1)]),_:1}),D("p",sa,i(e(l)("standalone.users_database.database_configuration_description")),1)]),D("div",la,[D("div",na,[n(K,{icon:["fas","database"],"aria-hidden":"true",class:ee("mr-5 h-4 w-4 rounded-full bg-gray-900 p-2 text-gray-300 dark:bg-gray-50 dark:text-gray-600")}),D("div",null,[D("p",null,i(u.database.type==="local"?e(l)("standalone.users_database.local_database"):u.database.name),1),u.database.type==="ldap"&&u.database.schema==="rfc2307"?(p(),P("p",ia,i(e(l)("standalone.users_database.remote_ldap")),1)):u.database.type==="ldap"&&u.database.schema==="ad"?(p(),P("p",oa,i(e(l)("standalone.users_database.remote_active_directory")),1)):h("",!0)]),u.database.type==="ldap"?(p(),P("p",ra,[x[9]||(x[9]=D("strong",{class:"text-sm"},"URI:",-1)),D("span",da,i(u.database.uri),1)])):h("",!0)]),D("div",ua,[u.database.type==="ldap"?(p(),$(e(z),{key:0,kind:"tertiary",onClick:x[0]||(x[0]=j=>g.value=!0),class:"mr-2"},{prefix:s(()=>[n(K,{icon:["fas","pen-to-square"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(" "+i(e(l)("common.edit")),1)]),_:1})):h("",!0),u.database.type==="ldap"?(p(),$(e(ce),{key:1,items:[{id:"delete",label:e(l)("common.delete"),iconStyle:"fas",icon:"trash",danger:!0,action:()=>{d.value=!0}}],"align-to-right":!0},null,8,["items"])):h("",!0)])]),D("div",va,[D("div",null,[n(e(le),{tag:"h5",class:"mb-2"},{default:s(()=>[m(i(e(l)("standalone.users_database.users")),1)]),_:1}),D("p",ca,i(e(l)("standalone.users_database.users_description")),1)]),u.database.type==="local"&&r.value.length>0?(p(),$(e(z),{key:0,kind:"secondary",onClick:x[1]||(x[1]=j=>_())},{prefix:s(()=>[n(K,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(i(e(l)("standalone.users_database.add_user")),1)]),_:1})):h("",!0)]),w.value.notificationDescription?(p(),$(e(O),{key:0,title:e(l)("error.cannot_retrieve_users"),description:w.value.notificationDescription,class:"mb-6",kind:"error"},Y({_:2},[w.value.notificationDetails?{name:"details",fn:s(()=>[m(i(w.value.notificationDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0),t.value?(p(),$(e(pe),{key:1,lines:10})):w.value.notificationDescription?h("",!0):(p(),P(W,{key:2},[r.value.length==0?(p(),$(e(Me),{key:0,title:e(l)("standalone.users_database.no_users_found"),icon:["fas","user-group"],class:ee([u.database.type=="local"?"":"pb-3"])},{default:s(()=>[u.database.type==="local"?(p(),$(e(z),{key:0,kind:"secondary",onClick:x[2]||(x[2]=j=>_())},{prefix:s(()=>[n(K,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(i(e(l)("standalone.users_database.add_user")),1)]),_:1})):h("",!0)]),_:1},8,["title","class"])):(p(),$(Ge,{key:1,"is-ldap-database":u.database.type==="ldap",users:r.value,onDelete:F,onEdit:_,onSetAdmin:E,onRemoveAdmin:L},null,8,["is-ldap-database","users"]))],64))]),n(fe,{"item-to-edit":u.database,"is-shown":g.value,onClose:x[3]||(x[3]=j=>g.value=!1),onAddEditDatabase:x[4]||(x[4]=j=>a("database-changed"))},null,8,["item-to-edit","is-shown"]),n(aa,{"item-to-edit":k.value,"is-shown":f.value,onClose:x[5]||(x[5]=j=>f.value=!1),onAddEditUser:V},null,8,["item-to-edit","is-shown"]),n(Re,{visible:d.value,"item-to-delete":u.database,onClose:x[6]||(x[6]=j=>d.value=!1),onDatabaseDeleted:x[7]||(x[7]=j=>a("database-deleted"))},null,8,["visible","item-to-delete"]),n(He,{visible:T.value,"item-to-delete":k.value,onClose:x[8]||(x[8]=j=>T.value=!1),onUserDeleted:V},null,8,["visible","item-to-delete"])],64)}}}),ba={class:"mb-6 flex flex-row items-center justify-between"},pa={key:3},ga=J({__name:"UsersDatabaseView",setup(M){const{t:U}=Q(),C=me(),a=Ke(),l=o({listDatabases:!0,getSubscriptionInfo:!0}),c=o([]),t=o({listDatabases:"",listDatabasesDetails:"",getSubscriptionInfo:"",getSubscriptionInfoDetails:""}),r=o(!1),w=o(!1),{tabs:g,selectedTab:d}=ke([]);async function f(I=!1){try{l.value.listDatabases=!0,I&&(d.value=""),c.value=(await A("ns.users","list-databases")).data.databases,g.value=c.value.map(_=>({name:_.name,label:_.type==="local"?U("standalone.users_database.local_database"):_.name})),d.value||(d.value=g.value[0].name)}catch(_){t.value.listDatabases=U(N(_)),t.value.listDatabasesDetails=_.toString()}finally{l.value.listDatabases=!1}}async function T(I=!1){await C.getChanges(),await f(I)}be(()=>{f(),k()});async function k(){var I,_;l.value.getSubscriptionInfo=!0;try{const F=await A("ns.subscription","info");w.value=((I=F.data)==null?void 0:I.systemd_id)&&((_=F.data)==null?void 0:_.active)||!1}catch(F){t.value.getSubscriptionInfo=U(N(F)),t.value.getSubscriptionInfoDetails=F.toString()}finally{l.value.getSubscriptionInfo=!1}}return(I,_)=>{const F=Z("font-awesome-icon");return p(),P(W,null,[D("div",ba,[n(e(le),{tag:"h3"},{default:s(()=>[m(i(e(U)("standalone.users_database.title")),1)]),_:1}),w.value?(p(),$(e(z),{key:0,kind:"secondary",onClick:_[0]||(_[0]=E=>r.value=!0)},{prefix:s(()=>[n(F,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(i(e(U)("standalone.users_database.add_remote_database")),1)]),_:1})):(p(),$(e(q),{key:1,triggerEvent:"mouseenter focus",placement:"bottom"},{trigger:s(()=>[n(e(z),{kind:"secondary",disabled:""},{prefix:s(()=>[n(F,{icon:["fas","circle-plus"],class:"h-4 w-4","aria-hidden":"true"})]),default:s(()=>[m(" "+i(e(U)("standalone.users_database.add_remote_database")),1)]),_:1})]),content:s(()=>[m(i(e(U)("standalone.users_database.add_remote_database_tooltip")),1)]),_:1}))]),t.value.listDatabases?(p(),$(e(O),{key:0,title:e(U)("error.cannot_retrieve_databases"),description:t.value.listDatabases,class:"mb-6",kind:"error"},Y({_:2},[t.value.listDatabasesDetails?{name:"details",fn:s(()=>[m(i(t.value.listDatabasesDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0),t.value.getSubscriptionInfo?(p(),$(e(O),{key:1,title:e(U)("error.cannot_retrieve_subscription_info"),description:t.value.getSubscriptionInfo,class:"mb-6",kind:"error"},Y({_:2},[t.value.listDatabasesDetails?{name:"details",fn:s(()=>[m(i(t.value.listDatabasesDetails),1)]),key:"0"}:void 0]),1032,["title","description"])):h("",!0),l.value.listDatabases||l.value.getSubscriptionInfo?(p(),$(e(pe),{key:2,lines:10,size:"lg"})):!t.value.listDatabases&&!t.value.getSubscriptionInfo?(p(),P("div",pa,[n(e(qe),{selected:e(d),srSelectTabLabel:e(U)("ne_tabs.select_a_tab"),srTabsLabel:e(U)("ne_tabs.tabs"),tabs:e(g),class:"mb-8",onSelectTab:_[1]||(_[1]=E=>d.value=E)},null,8,["selected","srSelectTabLabel","srTabsLabel","tabs"]),n(ma,{database:c.value.find(E=>E.name===e(d)),onDatabaseChanged:_[2]||(_[2]=E=>T()),onDatabaseDeleted:_[3]||(_[3]=E=>T(!0))},null,8,["database"])])):h("",!0),n(fe,{"is-shown":r.value,onClose:_[4]||(_[4]=E=>r.value=!1),onAddEditDatabase:_[5]||(_[5]=E=>{e(a).addNotification({id:`add_db_${E}`,kind:"success",title:e(U)("standalone.users_database.remote_database_added"),description:e(U)("standalone.users_database.remote_database_added_description",{name:E})}),T()})},null,8,["is-shown"])],64)}}});export{ga as default};

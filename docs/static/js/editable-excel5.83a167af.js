(window["webpackJsonpVueElementExtends"]=window["webpackJsonpVueElementExtends"]||[]).push([["editable-excel5"],{"1ed0":function(e,t,n){"use strict";var o=n("8cf2"),s=n.n(o);s.a},"32a6":function(e,t,n){var o=n("241e"),s=n("c3a1");n("ce7e")("keys",function(){return function(e){return s(o(e))}})},"8aae":function(e,t,n){n("32a6"),e.exports=n("584a").Object.keys},"8cf2":function(e,t,n){},a21f:function(e,t,n){var o=n("584a"),s=o.JSON||(o.JSON={stringify:JSON.stringify});e.exports=function(e){return s.stringify.apply(s,arguments)}},a4bb:function(e,t,n){e.exports=n("8aae")},ce7e:function(e,t,n){var o=n("63b6"),s=n("584a"),c=n("294c");e.exports=function(e,t){var n=(s.Object||{})[e]||Object[e],i={};i[e]=t(n),o(o.S+o.F*c(function(){n(1)}),"Object",i)}},f11d:function(e,t,n){"use strict";var o=window.document;function s(){var e=o.getElementById("$XECopy");return e||(e=o.createElement("input"),e.id="$XECopy",e.style["width"]="48px",e.style["height"]="12px",e.style["position"]="absolute",e.style["z-index"]="0",e.style["left"]="-500px",e.style["top"]="-500px",o.body.appendChild(e)),e}function c(e){var t=s(),n=null===e||void 0===e?"":""+e;try{return t.value=n,t.focus(),t.setSelectionRange(0,n.length),o.execCommand("copy",!0)}catch(c){}return!1}c.copy=c,e.exports=c,e.exports.default=c},f499:function(e,t,n){e.exports=n("a21f")},f94c:function(e,t,n){"use strict";n.r(t);var o=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("p",{staticStyle:{color:"red","font-size":"12px"}},[e._v("通过参数 context-menu-config 配置右键菜单；通过 custom-menu-link 事件处理自定义菜单")]),n("p",{staticStyle:{color:"red","font-size":"12px"}},[e._v("A字段（校验数值）B字段（校验汉字）C字段（校验字母）D字段（校验整数）E字段（校验小数）")]),n("p",[n("el-button",{attrs:{size:"mini"},on:{click:e.getAllEvent}},[e._v("获取所有")]),n("el-button",{attrs:{size:"mini"},on:{click:e.getUpdateEvent}},[e._v("获取改动")]),n("el-button",{attrs:{size:"mini"},on:{click:e.getResultEvent}},[e._v("获取有值数据")])],1),n("elx-editable",{ref:"elxEditable",staticClass:"excel-table5",staticStyle:{width:"100%"},attrs:{border:"",size:"customSize",data:e.list,"custom-columns":e.customColumns,"cell-class-name":e.cellClassName,"edit-rules":e.validRules,"edit-config":{trigger:"dblclick",showIcon:!1,showStatus:!1,isTabKey:!0,isArrowKey:!0,isCheckedEdit:!0},"context-menu-config":{headerMenus:e.headerMenus,bodyMenus:e.bodyMenus}},on:{"update:data":function(t){e.list=t},"update:customColumns":function(t){e.customColumns=t},"update:custom-columns":function(t){e.customColumns=t},"edit-active":e.editActiveEvent,"custom-menu-link":e.customMenuLinkEvent}},[n("elx-editable-column",{attrs:{type:"index",align:"center",width:"50"},scopedSlots:e._u([{key:"header",fn:function(){return[n("i",{staticClass:"el-icon-setting",on:{click:function(t){e.dialogVisible=!0}}})]},proxy:!0}])}),e._l(e.columnConfigs,function(t,o){return[n("elx-editable-column",e._b({key:o,attrs:{"header-align":"center","min-width":"60","show-overflow-tooltip":"","edit-render":{name:"ElInput"}},scopedSlots:e._u([{key:"default",fn:function(t){return[n("span",{staticClass:"content"},[e._v(e._s(t.row[t.column.property]))])]}}],null,!0)},"elx-editable-column",t,!1))]})],2),n("el-dialog",{attrs:{title:"自定义列",visible:e.dialogVisible,width:"540px","append-to-body":""},on:{"update:visible":function(t){e.dialogVisible=t},open:e.openCustomEvent}},[n("el-transfer",{attrs:{data:e.allCustomColumnList,titles:["隐藏列","显示列"],props:{key:"prop",label:"label"}},model:{value:e.selectColumns,callback:function(t){e.selectColumns=t},expression:"selectColumns"}}),n("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[n("el-button",{on:{click:e.resetCustomEvent}},[e._v("重 置")]),n("el-button",{on:{click:function(t){e.dialogVisible=!1}}},[e._v("取 消")]),n("el-button",{attrs:{type:"primary"},on:{click:e.saveCustomEvent}},[e._v("保 存")])],1)],1)],1)},s=[],c=(n("6762"),n("2fdb"),n("ac6a"),n("a4bb")),i=n.n(c),l=n("f499"),a=n.n(l),r=n("774e"),u=n.n(r),f=(n("c5f6"),n("c695")),p=n.n(f),d=n("f11d"),m=n.n(d),b=n("5c96"),v={data:function(){var e=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],t=function(e,t,n){!t||p.a.isInteger(Number(t))?n():n(new Error("请输入整数"))},n=function(e,t,n){!t||p.a.isFloat(Number(t))?n():n(new Error("请输入小数"))};return{dialogVisible:!1,list:u()(new Array(20),function(t,n){var o={};return e.forEach(function(e,t){switch(e){case"A":o[e.toLowerCase()]="".concat(100+n);break;case"B":o[e.toLowerCase()]="值";break;case"C":o[e.toLowerCase()]="ABC";break;case"D":o[e.toLowerCase()]="".concat(200+n);break;case"E":o[e.toLowerCase()]="".concat(300.33+n);break;default:o[e.toLowerCase()]="".concat(e,"-").concat(n<10?"0"+n:n)}}),o}),customColumns:[],selectColumns:[],columnConfigs:e.map(function(e,t){var n={prop:e.toLowerCase(),label:e};switch(e){case"A":n.filters=[{text:"大于10",value:10},{text:"大于50",value:50},{text:"大于100",value:100}],n.filterMethod=function(e,t,n){return Number(t[n.property]||0)>e};break;case"C":n.filters=[{text:"a开头",value:"a"},{text:"b开头",value:"b"},{text:"c开头",value:"c"}],n.filterMethod=function(e,t,n){return(t[n.property]||"").substring(0,1)===e};break;case"D":n.filters=[{text:"大于0",value:0},{text:"大于20",value:20},{text:"大于200",value:200}],n.filterMethod=function(e,t,n){return Number(t[n.property]||0)>e};break;case"E":n.filters=[{text:"大于2.5",value:2.5},{text:"大于7.8",value:7.8},{text:"大于9.5",value:9.5}],n.filterMethod=function(e,t,n){return Number(t[n.property]||0)>e};break}return n}),validRules:{a:[{type:"number",message:"必须输入数字",trigger:"change"}],b:[{pattern:/^[\u4e00-\u9fa5]{1,5}$/,message:"校验1-5个汉字",trigger:"change"}],c:[{pattern:/^[a-zA-Z]{1,5}$/,message:"校验1-5个字母",trigger:"blur"}],d:[{validator:t,trigger:"blur"}],e:[{validator:n,trigger:"change"}]},lastCopy:{content:null},headerMenus:[[{code:"ALL_RESET",name:"重置所有数据",prefixIcon:"el-icon-close"},{code:"ALL_REVERT",name:"还原所有数据"},{code:"ALL_EXPORT",name:"导出全部.cvs",prefixIcon:"el-icon-download"}]],bodyMenus:[[{code:"copy",name:"复制",prefixIcon:"el-icon-document"},{code:"paste",name:"粘贴",prefixIcon:"el-icon-news"},{code:"ROW_INSERT",name:"插入新行",prefixIcon:"el-icon-plus"},{code:"ROW_REMOVE",name:"删除行",prefixIcon:"el-icon-minus"}],[{code:"CELL_RESET",name:"清除内容",prefixIcon:"el-icon-close"},{code:"ROW_RESET",name:"清除行数据"},{code:"CELL_REVERT",name:"还原数据"},{code:"ROW_REVERT",name:"还原行数据"}],[{code:"ROW_EXPORT",name:"导出行.cvs",prefixIcon:"el-icon-download"},{code:"ALL_EXPORT",name:"导出全部.cvs"},{code:"printer",name:"打印",prefixIcon:"el-icon-printer"},{code:"test",name:"更多功能",prefixIcon:"el-icon-view",disabled:!0}]]}},computed:{allCustomColumnList:function(){return this.customColumns.filter(function(e){return e.prop})}},methods:{cellClassName:function(e){var t=e.row,n=e.column;return this.lastCopy&&this.lastCopy.row===t&&this.lastCopy.column===n?"to-copy":""},editActiveEvent:function(){this.lastCopy={row:null,column:null,content:null}},customMenuLinkEvent:function(e,t,n,o){switch(e){case"copy":this.lastCopy={row:t,column:n,content:t[n.property]},m.a.copy(this.lastCopy.content);break;case"paste":t[n.property]=this.lastCopy.content||null;break;case"printer":print();break}},getAllEvent:function(){var e=this.$refs.elxEditable.getRecords();Object(b["MessageBox"])({message:a()(e),title:"获取所有数据(".concat(e.length,"条)")}).catch(function(e){return e})},getUpdateEvent:function(){var e=this.$refs.elxEditable.getUpdateRecords();Object(b["MessageBox"])({message:a()(e),title:"获取已修改数据(".concat(e.length,"条)")}).catch(function(e){return e})},getResultEvent:function(){var e=this.$refs.elxEditable.getRecords().filter(function(e){return i()(e).some(function(t){return e[t]})});Object(b["MessageBox"])({message:a()(e),title:"获取有值数据(".concat(e.length,"条)")}).catch(function(e){return e})},openCustomEvent:function(){this.selectColumns=this.allCustomColumnList.filter(function(e){return e.visible}).map(function(e){return e.prop})},resetCustomEvent:function(){this.selectColumns=this.allCustomColumnList.map(function(e){return e.prop})},saveCustomEvent:function(){var e=this;if(!this.selectColumns.length)return Object(b["Message"])({type:"error",message:"请至少选择一列！"});this.dialogVisible=!1,this.allCustomColumnList.forEach(function(t){t.visible=e.selectColumns.includes(t.prop)})}}},C=v,g=(n("1ed0"),n("2877")),h=Object(g["a"])(C,o,s,!1,null,null,null);t["default"]=h.exports}}]);
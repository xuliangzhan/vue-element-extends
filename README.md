# vue-element-extends

[![npm version](https://img.shields.io/npm/v/vue-element-extends.svg?style=flat-square)](https://www.npmjs.org/package/vue-element-extends)
[![npm downloads](https://img.shields.io/npm/dm/vue-element-extends.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vue-element-extends)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vue-element-extends/blob/master/LICENSE)

基于 ElementUI 2.x 的扩展组件：Editable.vue、EditableColumn.vue

* 功能点：
  * 支持只读、单元格编辑、整行编辑
  * 支持手动、单击、双击编辑模式
  * 支持渲染简化的 ElementUI 组件
  * 支持自定义渲染任意 Vue 组件
  * 支持动态列渲染
  * 支持（同步、异步）校验
  * 支持显示单元格值的修改状态
  * 支持增/删/改/查/还原
  * 支持导出 .csv 文件
  * 支持方向键和 Tab 键切换单元格
  * 支持表格右键菜单
  * 支持原 ElTable 的所有功能、参数、方法、插槽

## Docs

[https://xuliangzhan.github.io/vue-element-extends/](https://xuliangzhan.github.io/vue-element-extends/)

## Installing

```shell
npm install xe-utils vue-element-extends
```

在 [unpkg](https://unpkg.com/vue-element-extends/) 和 [cdnjs](https://cdn.jsdelivr.net/npm/vue-element-extends/) 上获取

```HTML
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<link rel="stylesheet" href="https://unpkg.com/vue-element-extends/lib/index.css">
<!-- 引入脚本 -->
<script src="https://unpkg.com/xe-utils"></script>
<script src="https://unpkg.com/vue-element-extends"></script>
```

Case 1:

```javascript
import Vue from 'vue'
import { Editable, EditableColumn } from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(Editable)
Vue.use(EditableColumn)
```

Case 2:

```javascript
import Vue from 'vue'
import VueElementExtends from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(VueElementExtends)
```

## API

### Editable Attributes

```html
<elx-editable
  ref="editable"
  :edit-config="{trigger: 'click', mode: 'cell'}"
  :edit-rules="{name: [{required: true, message: 'Please enter a name.', trigger: 'blur'}]}">
  <elx-editable-column
    prop="name"
    label="Name"
    :edit-render="{name: 'ElInput'}"></elx-editable-column>
  <elx-editable-column
    prop="age"
    label="Age"
    :edit-render="{name: 'ElInputNumber'}"></elx-editable-column>
</elx-editable>
```

edit-rules 校验规则配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| required | 是否必填 | Boolean | — | — |
| min  | 校验值最小长度（如果 type=number 则比较值大小） | Number | — | — |
| max  | 校验值最大长度（如果 type=number 则比较值大小） | Number | — | — |
| type | 类型校验 | String | number / string | string |
| pattern | 正则校验 | RegExp | — | — |
| validator  | 自定义校验方法 | Function(rule, value, callback) | — | — |
| trigger  | 触发校验方式 | String | blur / change | blur |

edit-config 编辑参数配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| trigger | 触发方式 | String | manual（手动触发方式，只能用于 mode=row） / click（点击触发编辑） / dblclick（双击触发编辑） | click |
| mode  | 编辑模式 | String | cell（单元格编辑模式） / row（行编辑模式） | cell |
| props | 配置节点对应属性值 | Object | — | {children: 'children'} |
| showIcon | 是否显示列头编辑图标 | Boolean | — | true |
| showStatus | 是否显示单元格值的修改状态 | Boolean | — | true |
| activeMethod | 只对 type=default 的列有效，该函数 Function({row, rowIndex, column?, columnIndex?}) 的返回值用来决定这一行或列是否允许编辑 | Function | — | — |
| autoClearActive | 当点击其它地方后，是否自动清除最后活动行或列 | Boolean | — | true |
| clearActiveMethod | 该函数 Function({type, row, rowIndex, column?, columnIndex?}) 的返回值用来决定是否允许清除当前活动行或单元格 | Function | — | — |
| useDefaultValidTip | 如果同时使用了数据校验和 fixed 列，请设置为 true 使用默认提示  | Boolean | — | false |
| validTooltip | 只对 useDefaultValidTip=false 有效，设置校验 tooltip 提示消息的参数 | Object | — | { offset: 10, placement: 'bottom-start' } |
| disabledValidTip | 关闭校验提示 | Boolean | — | false |
| autoScrollIntoView | 当单元格被激活时，自动将单元格滚动到可视区域内 | Boolean | — | false |
| isTabKey | 只对 trigger!=manual 有效，是否启用 Tab 键切换到下一个单元格 | Boolean | — | false |
| isArrowKey | 只对 trigger!=manual 有效，是否启用箭头键切换行和单元格 | Boolean | — | false |
| isCheckedEdit | 只对 trigger!=manual 有效，是否启用选中状态允许值覆盖式编辑 | Boolean | — | false |
| checkedEditMethod | 只对 isCheckedEdit=true 有效，可以通过重写该函数 Function({row, rowIndex, column, columnIndex, cell}) 返回 false 来阻止默认值的覆盖行为 | Function | — | — |

context-menu-config 表格右键菜单参数

| 属性 | 描述 | 类型 | 参数 |
|------|------|-----|-----|
| headerMenus | 表格头部菜单配置 | Array | { code, name, prefixIcon, suffixIcon, visible, disabled } |
| bodyMenus | 表格内容菜单配置 | Array | { code, name, prefixIcon, suffixIcon, visible, disabled } |
| headerVisibleMethod | 该函数 Function({row, rowIndex, column, columnIndex, cell}) 的返回值用来决定是否显示头部右键菜单 | Function | — |
| bodyVisibleMethod | 该函数 Function({row, rowIndex, column, columnIndex, cell}) 的返回值用来决定是否显示内容右键菜单 | Function | — |

内置的 code 可选值:

| 属性 | 描述 |
|------|------|
| cell_reset | 重置单元格数据 |
| cell_revert  | 还原单元格数据 |
| select_remove  | 删除选中的行 |
| select_reset  | 重置选中的数据 |
| select_revert  | 还原选中的数据 |
| select_export  | 导出选中的数据 |
| row_insert  | 在当前位置插入新行 |
| row_remove | 删除当前行 |
| row_reset | 重置当前行数据 |
| row_revert | 还原当前行数据 |
| row_export  | 导出当前行数据 |
| all_remove | 删除表格所有行 |
| all_reset | 重置表格所有数据 |
| all_revert | 还原表格所有数据 |
| all_export  | 导出表格所有数据 |

### Editable Events

| 事件名 | 说明 | 参数 |
|------|------|-----|
| valid-error | 校验不通过时会触发该事件 | rule,row,column,cell |
| edit-disabled | 当点击后行或单元格如果是禁用状态时会触发该事件 | row[,column,cell]?,event |
| edit-active | 当点击后改变为编辑状态之后会触发该事件 | row[,column,cell]?,event |
| clear-active | 只对 autoClearActive=true 有效，当点击其它地方后，自动清除最后活动行或列之后会触发该事件 | row[,column,cell]?,event |
| blur-active | 当行或者单元格失焦之后会触发该事件 | row[,column,cell]?,event |
| custom-menu-link | 自定义的菜单点击后触发该函数 | code,row,column,cell,event |

### Editable Methods

| 方法名 | 描述 | 参数 |
|------|------|-----|
| refresh | 手动刷新表格 |  |
| reload | 初始化完整表格数据 | datas |
| reloadRow | 初始化指定行数据 | row |
| revert | 放弃更改，还原指定行 row 或者整个表格的数据 | row?rows? |
| insert | 从第一行新增一行新数据 | data |
| insertAt | 第二个参数 row 从指定位置新增一条数据； null 从第一行新增一行新数据；-1 从最后新增一条数据 | data,row |
| remove | 数据删除，指定 row 或 [row, ...] 删除多条数据 | row?rows? |
|  (v1.1.3+废弃) removes | 根据多条数据删除 | rows |
| removeSelecteds | 删除选中行数据 | — |
| clear | 清空表格，删除表格所有行 | — |
| reset | 重置数据，重置指定行 row 或者 [row, ...] 或者整个表格的数据 | row?rows? |
| clearActive | 清除所有活动行或列为不可编辑状态 | — |
| hasActiveRow | 判断当前是否活动行 | row |
| getActiveRow | 获取当前活动行或列的信息 | — |
| setActiveRow | 只对 mode=row 有效，激活指定行为可编辑状态 | row |
| setActiveCell | 激活指定某一行的某个单元格为可编辑状态 | row,prop? |
| hasRowInsert | 检查是否为新增的行数据 | row |
| hasRowChange | 检查行或列数据是否发生改变 | row, prop? |
| updateStatus | 更新单元格编辑状态（只对 showStatus=true 并且使用自定义渲染时，当值发生改变时才需要调用） | scope |
| getAllRecords | 获取表格数据集合 | — |
| getRecords | 获取表格数据，也可以指定索引获取某条数据 | index |
| getInsertRecords | 获取新增数据 | — |
| getRemoveRecords | 获取已删除数据 | — |
| getUpdateRecords| 获取已修改数据 | — |
| checkValid | 检测是否有校验不通过的列信息 | — |
| validateRow | 对表格某一行进行校验的方法，参数为行数据和一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | row,callback |
| validate | 对整个表格进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | callback |
| exportCsv| 将表格数据导出为 .csv 文件，说明：支持IE9+、Edge、Chrome、Firefox 等常用浏览器。IE11以下可能存在中文乱码问题，部分浏览器需要手动修改后缀名为 .csv | options |

### Editable-Column Attributes

```html
<elx-editable-column
  prop="name"
  label="Name"
  :edit-render="{name: 'ElInput'}"></elx-editable-column>
```

edit-render 渲染参数配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 渲染内置的组件名称 | String | ElAutocomplete / ElInput / ElSelect / ElCascader / ElTimeSelect / ElTimePicker / ElDatePicker / ElInputNumber / ElSwitch / ElRate / ElColorPicker / ElSlider | ElInput |
| type | 渲染类型 | String | default（组件触发后可视） / visible（组件一直可视） | default |
| autofocus | 该单元格在激活后自动获取焦点（如果是渲染自定义组件，需要指定 class=editable-custom_input 才会自动获得焦点） | Boolean | — | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| events | 渲染组件附加事件，参数为 ( { rule, row, column, $index }, ...Component arguments ) | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |
| optionGroups | 只对 name=ElSelect 有效，下拉组件分组选项列表 | Array | — | [] |
| optionGroupProps | 只对 name=ElSelect 有效，下拉组件分组选项属性参数配置 | Object | — | { options: 'options', label: 'label' } |

### Editable-Column Scoped Slot

| name | 说明 |
|------|------|
| — | 自定义渲染显示内容，参数为 { row, column, $index, $render } |
| edit | 自定义渲染组件，参数为 { row, column, $index, $render } |
| header | 自定义表头的内容，参数为 { column, $index, $render } |
| valid | 自定义校验提示信息，参数为 { rule, row, column, $index, $render } |

## Example

Run 1.1.x demo on [jsfiddle.net](https://jsfiddle.net/0u86zwbv/) or [runjs](https://jsrun.net/zTXKp/edit)  
Run 1.0.x demo on [jsfiddle.net](https://jsfiddle.net/3vo8qhtk/) or [runjs](https://jsrun.net/HFXKp/edit)

😱**编辑表格响应属性及渲染开销较大，不适用于一页显示海量数据的表格；适用于使用分页加载的数据表格**😱  
也可以把 packages 中的 editable.vue 和 editable-column.vue 组件复制到自己项目中注册，再根据项目需求去做修改  
如果有更好优化建议或遇到问题欢迎提 [Issues](https://github.com/xuliangzhan/vue-element-extends/issues?q=is%3Aissue+is%3Aclosed)

```html
<template>
  <div>
    <el-button @click="$refs.editable.insert({name: 'new1'})">新增</el-button>
    <el-button @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button @click="$refs.editable.clear()">清空表格</el-button>

    <elx-editable
      ref="editable"
      :data.sync="tableData">
      <elx-editable-column
        type="selection"
        width="55"></elx-editable-column>
      <elx-editable-column
        type="index"
        width="55"></elx-editable-column>
      <elx-editable-column
        prop="name"
        label="只读"></elx-editable-column>
      <elx-editable-column
        prop="sex"
        label="下拉"
        :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column
        prop="num"
        label="数值"
        :edit-render="{name: 'ElInputNumber'}"></elx-editable-column>
      <elx-editable-column
        prop="date"
        label="日期"
        :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></elx-editable-column>
      <elx-editable-column
        prop="flag"
        label="开关"
        :edit-render="{name: 'ElSwitch', type: 'visible'}"></elx-editable-column>
      <elx-editable-column
        prop="remark"
        label="文本"
        :edit-render="{name: 'ElInput'}"></elx-editable-column>
    </elx-editable>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tableData: [{
        date: 1551322088449,
        name: '小徐',
        sex: '1',
        num: '26',
        flag: false,
        remark: '备注'
      }],
      sexList: [
        {
          'label': '男',
          'value': '1'
        },
        {
          'label': '女',
          'value': '0'
        }
      ]
    }
  }
}
</script>
```

## License

Copyright (c) 2017-present, Xu Liangzhan
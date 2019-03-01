# vue-element-extends

[![npm version](https://img.shields.io/npm/v/vue-element-extends.svg?style=flat-square)](https://www.npmjs.org/package/vue-element-extends)
[![npm downloads](https://img.shields.io/npm/dm/vue-element-extends.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vue-element-extends)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vue-element-extends/blob/master/LICENSE)

* 功能点：
  * 支持只读、单元格编辑、整行编辑
  * 支持手动、单击、双击编辑模式
  * 支持渲染简化的 ElementUI 组件
  * 支持自定义渲染任意 Vue 组件
  * 支持动态列渲染
  * 支持（同步、异步）数据校验
  * 支持显示单元格值的修改状态
  * 支持增/删/改/查/还原
  * 支持数据导出 .csv 文件
  * 支持原 ElTable 所有参数及功能

![editable1](https://github.com/xuliangzhan/vue-element-extends/blob/master/docs/img/editable1.gif?raw=true)
![editable2](https://github.com/xuliangzhan/vue-element-extends/blob/master/docs/img/editable2.gif?raw=true)
![editable3](https://github.com/xuliangzhan/vue-element-extends/blob/master/docs/img/editable3.gif?raw=true)
![editable4](https://github.com/xuliangzhan/vue-element-extends/blob/master/docs/img/editable4.gif?raw=true)
![editable5](https://github.com/xuliangzhan/vue-element-extends/blob/master/docs/img/editable5.gif?raw=true)

## Docs

[https://xuliangzhan.github.io/vue-element-extends/](https://xuliangzhan.github.io/vue-element-extends/)

## Installing

```shell
npm install xe-utils vue-element-extends --save
```

在 [unpkg](https://unpkg.com/vue-element-extends/) 和 [cdnjs](https://cdn.jsdelivr.net/npm/vue-element-extends/) 上获取

```HTML
<link rel="stylesheet" href="https://unpkg.com/vue-element-extends/lib/index.css">
<script src="https://unpkg.com/vue-element-extends/lib/index.umd.min.js"></script>
```

```javascript
import Vue from 'vue'
import VueElementExtends from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(VueElementExtends)
```

## API

### Editable Attributes

```html
<el-editable
  ref="editable"
  :edit-config="{trigger: 'click', mode: 'cell'}"
  :edit-rules="{name: [{required: true, message: 'Please enter a name.', trigger: 'blur'}]}">
  <el-editable-column prop="name" label="Name" :edit-render="{name: 'ElInput'}"></el-editable-column>
  <el-editable-column prop="age" label="Age" :edit-render="{name: 'ElInputNumber'}"></el-editable-column>
</el-editable>
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
| showIcon | 是否显示列头编辑图标 | Boolean | — | true |
| showStatus | 是否显示单元格值的修改状态 | Boolean | — | true |
| activeMethod | 只对 type=default 的列有效，该函数 Function({row, rowIndex, column?, columnIndex?}) 的返回值用来决定这一行或列是否允许编辑 | Function | — | — |
| clearActiveMethod | 该函数 Function({row, rowIndex, column?, columnIndex?}) 的返回值用来决定是否允许清除活动编辑 | Function | — | — |
| useDefaultValidTip | 如果使用了数据校验和 fixed 列（因为 fixed 列也会被渲染，所以会导致同时出现多个校验提示），请设置为 true 使用默认提示  | Boolean | — | false |
| validTooltip | 只对 useDefaultValidTip=false 有效，设置校验 tooltip 提示消息的参数 | Object | — | { offset: 10, placement: 'bottom-start' } |
| autoClearActive | 当点击其它地方后，自动清除最后活动行或列 | Boolean | — | true |
| autoScrollIntoView | 当单元格被激活时，自动将单元格滚动到可视区域内 | Boolean | — | false |

### Editable Events

| 事件名 | 说明 | 参数 |
|------|------|-----|
| valid-error | 校验不通过时会触发该事件 | rule, row, column, cell |
| edit-active | 激活编辑状态之后会触发该事件 | row, column, cell, event |
| clear-active | 只对 autoClearActive=true 有效，当点击其它地方后，自动清除最后活动行或列之后会触发该事件 | row[, column, cell]?, event |

### Editable Methods

| 方法名 | 描述 | 参数 |
|------|------|-----|
| reload | 初始化完整表格数据 | datas |
| reloadRow | 初始化指定行数据 | row |
| revert | 放弃更改，还原指定行 row 或者整个表格的数据 | row? |
| insert | 新增一行新数据 | data |
| insertAt | 第二个参数如果是 row 或 $index 则在指定位置新增一条数据，如果是 -1 则从最后新增一条数据 | data, rowOrIndex |
| remove | 根据数据删除 | row |
| removes | 根据多条数据删除 | rows |
| removeByIndex | 根据行号删除某一行数据 | $index |
| removeByIndexs | 根据多个行号删除多行数据 | $indexs |
| removeSelecteds | 删除选中行数据 | — |
| clear | 清空所有数据 | — |
| clearActive | 清除所有活动行或列为不可编辑状态 | — |
| hasActiveRow | 判断当前是否活动行 | row |
| getActiveRow | 获取当前活动行或列的信息 | — |
| setActiveRow | 只对 mode=row 有效，激活指定行行为可编辑状态 | row, preventDefault? |
| setActiveCell | 只对 mode=cell 有效，激活指定某一行的单元格为可编辑状态 | row, prop?, preventDefault? |
| hasRowChange | 检查行或列数据是否有改变 | row, prop? |
| updateStatus | 更新单元格编辑状态（只对 showStatus=true 并且使用自定义渲染时，当值发生改变时才需要调用） | scope |
| getAllRecords | 获取表格数据集合 | — |
| getRecords | 获取表格数据，也可以指定索引获取某条数据 | index |
| getInsertRecords | 获取新增数据 | — |
| getRemoveRecords | 获取已删除数据 | — |
| getUpdateRecords| 获取已修改数据 | — |
| checkValid | 检测是否有校验不通过的列信息 | — |
| validateRow | 对表格某一行进行校验的方法，参数为行数据和一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | row, callback |
| validate | 对整个表格进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | callback |
| exportCsv| 将表格数据导出为 .csv 文件，说明：支持IE9+、Edge、Chrome、Firefox 等常用浏览器。IE11以下可能存在中文乱码问题，部分浏览器需要手动修改后缀名为 .csv | options |
| ***clearSelection** | 用于多选表格，清空用户的选择 | — |
| ***toggleRowSelection** | 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中） | row, selected |
| ***toggleAllSelection** | 用于多选表格，切换所有行的选中状态 | — |
| ***toggleRowExpansion** | 用于可展开表格，切换某一行的展开状态，如果使用了第二个参数，则是设置这一行展开与否（expanded 为 true 则展开） | row, expanded |
| ***clearSort** | 用于清空排序条件，数据会恢复成未排序的状态 | — |
| ***clearFilter** | 不传入参数时用于清空所有过滤条件，数据会恢复成未过滤的状态，也可传入由columnKey组成的数组以清除指定列的过滤条件 | — |
| ***doLayout** | 对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法 | — |

### Editable-Column Attributes

```html
<el-editable-column prop="name" label="Name" :edit-render="{name: 'ElInput'}"></el-editable-column>
```

edit-render 渲染参数配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 渲染内置的组件名称（如果是自定义渲染不需要传） | String | ElAutocomplete / ElInput / ElSelect / ElCascader / ElTimeSelect / ElTimePicker / ElDatePicker / ElInputNumber / ElSwitch / ElRate / ElColorPicker / ElSlider | ElInput |
| type | 渲染类型 | String | default（组件触发后可视） / visible（组件一直可视） | default |
| autofocus | 该单元格在激活后自动获取焦点（如果是渲染自定义组件，需要指定 class=editable-custom_input 才会自动获得焦点） | Boolean | — | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| events | 渲染组件附加事件，参数为 ( { rule, row, column, $index }, ...Component arguments ) | Object | — | {} |
| options | 只对 name=ElSelect 有效，下拉组件选项列表 | Array | — | [] |
| optionProps | 只对 name=ElSelect 有效，下拉组件选项属性参数配置 | Object | — | { value: 'value', label: 'label' } |

### Editable-Column Scoped Slot

| name | 说明 |
|------|------|
| — | 自定义渲染显示内容，参数为 { row, column, $index, editRender } |
| edit | 自定义渲染组件，参数为 { row, column, $index, editRender } |
| head | 自定义表头的内容，参数为 { column, $index, editRender } |
| valid | 自定义校验提示信息，参数为 { rule, row, column, $index, editRender } |

## Example

[Run this demo on jsfiddle.net](https://jsfiddle.net/1yu8e37L/)

😱编辑表格组件中涉及双向绑定的属性较多，渲染性能开销大，建议数据不要超过 200 行，使用分页加载😱  
也可以把 packages/* 中的 editable.vue 和 editable-column.vue 组件复制到自己项目中注册，再根据自己项目需求去做修改  
如果有更好优化建议或遇到问题欢迎提 [Issues](https://github.com/xuliangzhan/vue-element-extends/issues?q=is%3Aissue+is%3Aclosed)

```html
<template>
  <div>
    <el-button @click="$refs.editable.insert({name: 'new1'})">新增</el-button>
    <el-button @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button @click="$refs.editable.clear()">清空</el-button>
    <el-editable ref="editable" :data.sync="tableData">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="只读"></el-editable-column>
      <el-editable-column prop="sex" label="下拉" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="数值" :edit-render="{name: 'ElInputNumber'}"></el-editable-column>
      <el-editable-column prop="date" label="日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="flag" label="开关" :edit-render="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="remark" label="文本" :edit-render="{name: 'ElInput'}"></el-editable-column>
    </el-editable>
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
        age: '26',
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
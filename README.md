# vue-element-extends

[![npm version](https://img.shields.io/npm/v/vue-element-extends.svg?style=flat-square)](https://www.npmjs.org/package/vue-element-extends)
[![npm downloads](https://img.shields.io/npm/dm/vue-element-extends.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vue-element-extends)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.umd.min.js?compression=gzip&label=gzip%20size:%20JS)
[![gzip size: CSS](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)](http://img.badgesize.io/https://unpkg.com/vue-element-extends/lib/index.css?compression=gzip&label=gzip%20size:%20CSS)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vue-element-extends/blob/master/LICENSE)

基于 ElementUI 2.x 的扩展组件

* elx-table 功能点：
  * 支持自定义显示、隐藏列
  * 支持滚动渲染、海量数据
  * 支持导出 .csv 文件
  * 支持原 ElTable 的所有功能、参数、方法、插槽

* elx-editable 功能点：
  * 支持只读、单元格编辑、整行编辑
  * 支持手动、单击、双击编辑模式
  * 支持渲染简化的 ElementUI 组件
  * 支持自定义渲染任意 Vue 组件
  * 支持动态列渲染
  * 支持（同步、异步）校验
  * 支持显示单元格值的修改状态
  * 支持增/删/改/查/还原
  * 支持方向键和 Tab 键切换单元格
  * 支持表格右键菜单
  * 支持自定义显示、隐藏列
  * 支持滚动渲染、海量数据
  * 支持导出 .csv 文件
  * 支持原 ElTable 的所有功能、参数、方法、插槽

![editable1](https://raw.githubusercontent.com/xuliangzhan/vue-element-extends/1.0/public/static/img/editable1.gif)
![editable2](https://raw.githubusercontent.com/xuliangzhan/vue-element-extends/1.0/public/static/img/editable2.gif)
![editable3](https://raw.githubusercontent.com/xuliangzhan/vue-element-extends/1.0/public/static/img/editable3.gif)
![editable4](https://raw.githubusercontent.com/xuliangzhan/vue-element-extends/1.0/public/static/img/editable4.gif)
![editable5](https://raw.githubusercontent.com/xuliangzhan/vue-element-extends/1.0/public/static/img/editable5.gif)

## Installing

```shell
npm install xe-utils vue-element-extends --save
```

Get on [unpkg](https://unpkg.com/vue-element-extends/) and [cdnjs](https://cdn.jsdelivr.net/npm/vue-element-extends/)

```HTML
<!-- import CSS -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<link rel="stylesheet" href="https://unpkg.com/vue-element-extends/lib/index.css">
<!-- import JavaScript -->
<script src="https://unpkg.com/xe-utils"></script>
<script src="https://unpkg.com/vue-element-extends"></script>
```

```javascript
import Vue from 'vue'
import {
  Editable,
  EditableColumn
} from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(Editable)
Vue.use(EditableColumn)
```

## Example

```html
<template>
  <div>
    <el-button @click="$refs.elxEditable.insert()">New</el-button>
    <el-button @click="$refs.elxEditable.removeSelecteds()">Delete selecteds</el-button>

    <elx-editable ref="editable" :data.sync="tableData">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="name" label="Readonly"></elx-editable-column>
      <elx-editable-column prop="select" label="Select" :edit-render="{name: 'ElSelect', options}"></elx-editable-column>
      <elx-editable-column prop="num" label="Number" :edit-render="{name: 'ElInputNumber'}"></elx-editable-column>
      <elx-editable-column prop="date" label="DatePicker" :edit-render="{name: 'ElDatePicker', props: {type: 'date', format: 'yyyy/MM/dd'}}"></elx-editable-column>
      <elx-editable-column prop="flag" label="Switch" :edit-render="{name: 'ElSwitch', type: 'visible'}"></elx-editable-column>
      <elx-editable-column prop="text" label="Input" :edit-render="{name: 'ElInput'}"></elx-editable-column>
    </elx-editable>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tableData: [{
        date: 1551322088449,
        name: 'Name1',
        select: 1,
        num: '26',
        flag: false,
        text: 'Content1'
      },{
        date: 1552460833946,
        name: 'Name2',
        select: 0,
        num: '28',
        flag: true,
        text: 'Content2'
      }],
      options: [
        {
          label: 'Label1',
          value: 1
        },
        {
          label: 'Label2',
          value: 0
        }
      ]
    }
  }
}
</script>
```

## License

Copyright (c) 2017-present, Xu Liangzhan
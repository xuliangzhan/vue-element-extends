# vue-element-extends

[![npm version](https://img.shields.io/npm/v/vue-element-extends.svg?style=flat-square)](https://www.npmjs.org/package/vue-element-extends)
[![npm build](https://travis-ci.org/xuliangzhan/vue-element-extends.svg?branch=master)](https://travis-ci.org/xuliangzhan/vue-element-extends)
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

### Import

```javascript
import Vue from 'vue'
import VueElementExtends from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(VueElementExtends)

// 或者直接将 packages/editable/src 中的 editable.vue 和 editable-column.vue 组件复制到自己项目中注册
```

## Example

[Run this demo on jsfiddle.net](https://jsfiddle.net/1yu8e37L/)

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
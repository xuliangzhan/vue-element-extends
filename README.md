# vue-element-extends

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

```javascript
npm install xe-utils vue-element-extends --save
```

[Using unpkg](https://unpkg.com/vue-element-extends/)

```HTML
<script src="https://unpkg.com/vue-element-extends/lib/index.umd.min.js"></script>
```

Using requirejs

```javascript
// require 配置
require.config({
  paths: {
    // ...,
    'vue-element-extends': './vue-element-extends/lib/index.umd.min'
  }
})
define(['vue', 'vue-element-extends'], function (Vue, VueElementExtends) {
  Vue.use(VueElementExtends)
})
```

### ES6 Module import

```javascript
import Vue from 'vue'
import VueElementExtends from 'vue-element-extends'
import 'vue-element-extends/lib/index.css'

Vue.use(VueElementExtends)

```

## [Example](https://jsfiddle.net/xjq29w3d/1/)

```html
<template>
  <div>
    <el-button @click="$refs.editable.insert({name: 'new1'})">新增</el-button>
    <el-button @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button @click="$refs.editable.clear()">清空</el-button>
    <el-editable ref="editable" :data.sync="list">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字（只读）"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否生效" :edit-render="{name: 'ElSwitch'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :edit-render="{name: 'ElInput'}"></el-editable-column>
    </el-editable>
  </div>
</template>

<script>
export default {
  data () {
    return {
      sexList: [
        {
          label: '男',
          value: '1'
        },
        {
          label: '女',
          value: '0'
        }
      ],
      regionList: [
        {
          value: 'gds',
          label: '广东省',
          children: [
            {
              value: 'szs',
              label: '深圳市',
              children: [
                {
                  value: 'lgq',
                  label: '龙岗区'
                },
                {
                  value: 'nsq',
                  label: '南山区'
                }
              ]
            }
          ]
        }
      ],
      list: [
        {
          name: 'test11',
          height: 176,
          age: 26,
          sex: '1',
          region: null,
          birthdate: new Date(1994, 0, 1),
          date1: new Date(2019, 0, 1, 20, 0, 30),
          remark: '备注1',
          flag: false
        }
      ]
    }
  }
}
</script>

```
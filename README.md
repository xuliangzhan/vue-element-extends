# vue-element-extends

* 功能点：
  * 支持（只读、单元格编辑、整行编辑）方式
  * 支持手动、单击、双击编辑模式
  * 支持渲染简化的 ElementUI 组件
  * 支持自定义渲染任意 Vue 组件
  * 支持动态列渲染
  * 支持（同步、异步）数据校验
  * 支持显示列数据 change 状态
  * 支持增/删/改/查/还原
  * 支持原 ElTable 所有参数及功能

![editable1](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable1.gif?raw=true)
![editable2](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable2.gif?raw=true)
![editable3](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable3.gif?raw=true)
![editable4](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable4.gif?raw=true)
![editable5](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable5.gif?raw=true)

## Docs

[https://xuliangzhan.github.io/vue-element-extends/](https://xuliangzhan.github.io/vue-element-extends/)

## API

### Editable Attributes

```html
<el-editable
  ref="editable"
  edit-config="{trigger: 'click', mode: 'cell'}"
  :edit-rules="{name: [{required: true, message: '请输入名称', trigger: 'blur'}]}">
  <el-editable-column prop="name" label="名字" edit-render="{name: 'ElInput'}"></el-editable-column>
  <el-editable-column prop="age" label="年龄" edit-render="{name: 'ElInputNumber'}"></el-editable-column>
</el-editable>
```

edit-rules 校验规则配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| required | 是否必填 | Boolean | — | — |
| min  | 校验值最小长度（如果 type=number 则比较值大小） | Number | — | — |
| max  | 校验值最大长度（如果 type=number 则比较值大小） | Number | — | — |
| type | 类型校验 | String | number / string | — | string |
| pattern | 正则校验 | RegExp | — | — |
| validator  | 自定义校验方法 | Function(rule, value, callback) | — | — |
| trigger  | 触发校验方式 | String | blur / change | blur |

edit-config 编辑参数配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| trigger | 触发方式 | String | manual（手动触发方式，只能用于 mode=row） / click（点击触发编辑） / dblclick（双击触发编辑） | click |
| mode  | 编辑方式 | String | cell（列编辑模式） / row（行编辑模式） | cell |
| showIcon | 是否显示列头编辑图标 | Boolean | — | true |
| showStatus | 是否显示列的 change 状态 | Boolean | — | true |
| activeMethod | 仅对 type=default 的列有效，Function((row, column, index) 的返回值用来决定这一行或列是否允许编辑 | Function | — | — |

### Editable Events

| 事件名 | 说明 | 参数 |
|------|------|-----|
| edit-active | 激活编辑状态之后会触发该事件 | row, column, cell, event |
| clear-active | 当点击其它地方后，自动清除最后活动列之后会触发该事件 | activeRow, activeColumn, activeCell, event |

### Editable Methods

| 方法名 | 描述 | 参数 |
|------|------|-----|
| reload | 初始化加载数据 | datas |
| revert | 放弃更改，还原修改之前数据 | — |
| insert | 新增一行新数据 | data |
| insertAt | 第二个参数如果是 row 或 $index 则在指定位置新增一条数据，如果是 -1 则从最后新增一条数据 | data, rowOrIndex |
| remove | 根据数据删除 | row |
| removes | 根据多条数据删除 | rows |
| removeByIndex | 根据行号删除一行数据 | $index |
| removeByIndexs | 根据多个行号删除多行数据 | $indexs |
| removeSelecteds | 删除选中行数据 | — |
| clear | 清空所有数据 | — |
| clearActive | 清除所有活动行或列为不可编辑状态 | — |
| setActiveRow | 设置活动行为可编辑状态（只对 mode=row 有效） | row |
| isActiveRow | 判断当前是否活动行 | row |
| updateStatus | 更新列状态（当使用自定义组件时，值发生改变时需要调用来更新列状态），如果不传参数则更新整个表格 | scope |
| getAllRecords | 获取表格数据集合 | — |
| getRecords | 获取表格数据，也可以指定索引获取某条数据 | index |
| getInsertRecords | 获取新增数据 | — |
| getRemoveRecords | 获取已删除数据 | — |
| getUpdateRecords| 获取已修改数据 | — |
| checkValid | 检测是否有校验不通过的列信息 | — |
| validateRow | 对表格某一行进行校验的方法，参数为行数据和一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | row, callback |
| validate | 对整个表格进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：（是否校验成功，最近一列未通过校验的字段）。若不传入回调函数，则会返回一个 promise | callback |
| clearSelection | 用于多选表格，清空用户的选择 | — |
| toggleRowSelection | 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中） | row, selected |
| toggleAllSelection | 用于多选表格，切换所有行的选中状态 | — |
| toggleRowExpansion | 用于可展开表格，切换某一行的展开状态，如果使用了第二个参数，则是设置这一行展开与否（expanded 为 true 则展开） | row, expanded |
| clearSort | 用于清空排序条件，数据会恢复成未排序的状态 | — |
| clearFilter | 不传入参数时用于清空所有过滤条件，数据会恢复成未过滤的状态，也可传入由columnKey组成的数组以清除指定列的过滤条件 | — |
| doLayout | 对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法 | — |

### Editable-Column Attributes

```html
<el-editable-column prop="name" label="名字" edit-render="{name: 'ElInput'}"></el-editable-column>
```

edit-render 渲染参数配置

| 属性 | 描述 | 类型 | 可选值 | 默认值 |
|------|------|-----|-----|-----|
| name | 渲染内置的组件名称（如果是自定义渲染不需要传） | String | ElInput / ElSelect / ElCascader / ElDatePicker / ElInputNumber / ElSwitch / ElRate / ElColorPicker / ElSlider | ElInput |
| type | 渲染类型 | String | default（组件触发后可视） / visible（组件一直可视，如果设置为类型则不支持自动校验） | default |
| autofocus  | 该列在激活后自动获取焦点（如果是渲染自定义组件，需要指定 class=editable-custom_input 才会自动获得焦点） | Boolean | — | — |
| attrs | 渲染组件附加属性，参数请查看被渲染的 Component attrs | Object | — | {} |
| events | 渲染组件附加事件，参数为 ( { rule, row, column, $index }, ...Component arguments ) | Object | — | {} |
| options | 下拉组件选项列表（只对 name=ElSelect 有效） | Array | — | [] |

### Editable-Column Scoped Slot

| name | 说明 |
|------|------|
| — | 自定义渲染显示内容，参数为 { row, column, $index } |
| edit | 自定义渲染组件，参数为 { row, column, $index } |
| head | 自定义表头的内容，参数为 { column, $index } |
| valid | 自定义校验提示信息，参数为 { rule, row, column, $index } |

## Example

步骤：

1. 基于 ElementUI 2.x，依赖库 npm install vue vuex element-ui xe-utils
2. 需要依赖 vuex 中的 globalClick 属性，该属性值为响应全局 click  事件 (具体实现方式可以参考 store/modules/event.js)
3. 将 Editable.vue 和 EditableColumn.vue 复制到项目中，（例：components 目录下），然后注册组件（全局或局部）

该组件不做发布，有需要都可以自行获取，也可以根据自身项目需求去做修改  
如果有更好优化建议或遇到问题欢迎提 Issues 和讨论

```JavaScript
import Editable from '@/components/Editable.vue'
import EditableColumn from '@/components/EditableColumn.vue'

Vue.component(Editable.name, Editable)
Vue.component(EditableColumn.name, EditableColumn)
```

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
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否生效" :editRender="{name: 'ElSwitch'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :editRender="{name: 'ElInput'}"></el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui'

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
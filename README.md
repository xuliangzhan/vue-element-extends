# vue-element-extends

![editable](https://github.com/xuliangzhan/vue-element-extends/blob/master/src/assets/editable1.gif?raw=true)

## API

* 基于 ElementUI 可编辑表格 Editable
  * reload(datas) 初始化数据
  * reset() 还原修改之前数据
  * insert(record) 插入一行
  * insertAt(record, rowIndex) 指定位置插入一行
  * remove(record) 删除行
  * removes(records) 删除多行
  * removeRow(rowIndex) 删除行
  * removeRows(rowIndexs) 删除多行
  * removeSelecteds() 删除选中行
  * getRecords() 获取表格数据
  * getAllRecords() 获取表格所有数据
  * getInsertRecords() 获取插入数据
  * getRemoveRecords() 获取删除数据
  * getUpdateRecords() 获取修改数据

## Example

```html
<template>
  <div>
    <h1>基于 ElementUI 可编辑表格</h1>
    <el-button type="primary" @click="$refs.editable.insert({name: 'new1'})">插入一行</el-button>
    <el-button type="primary" @click="$refs.editable.insertAt({name: 'new1'}, -1)">在最后插入一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeRows([0, 2])">删除指定行[0, 2]</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="danger" @click="$refs.editable.reset()">还原更改</el-button>
    <el-editable ref="editable" :data.sync="list">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :editRender="{name: 'ElSwitch'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="$refs.editable.removeRow(scope.$index)">删除</el-button>
        </template>
      </el-editable-column>
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
          value: 'bj',
          label: '北京',
          children: [
            {
              value: 'bjs',
              label: '北京市',
              children: [
                {
                  value: 'dcq',
                  label: '东城区'
                }
              ]
            }
          ]
        },
        {
          value: 'gds',
          label: '广东省',
          children: [
            {
              value: 'szs',
              label: '深圳市',
              children: [
                {
                  value: 'lhq',
                  label: '罗湖区'
                }
              ]
            },
            {
              value: 'gzs',
              label: '广州市',
              children: [
                {
                  value: 'thq',
                  label: '天河区'
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
        },
        {
          name: 'test22',
          height: 166,
          age: 24,
          sex: '0',
          region: ['gds', 'szs', 'lhq'],
          birthdate: new Date(1992, 0, 1),
          date1: new Date(2019, 0, 1, 12, 10, 30),
          remark: '备注2',
          flag: true
        },
        {
          name: 'test33',
          height: 172,
          age: 22,
          sex: '1',
          region: ['bj', 'bjs', 'dcq'],
          birthdate: new Date(1990, 0, 1),
          date1: new Date(2019, 0, 1, 0, 30, 50),
          remark: null,
          flag: false
        }
      ]
    }
  }
}
</script>
```
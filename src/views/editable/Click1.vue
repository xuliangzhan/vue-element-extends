<template>
  <div>
    <el-button type="success" size="mini" @click="$refs.editable.insert({name: '默认名字1'})">新增一行</el-button>
    <el-button type="success" size="mini" @click="$refs.editable.insertAt({name: '默认名字1'}, -1)">在最后新增一行</el-button>
    <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
    <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>

    <p style="color: red;">单击模式，点击后自动触发编辑</p>

    <el-editable ref="editable" :data.sync="list" border size="mini" style="width: 100%">
      <el-editable-column prop="name" label="名字（只读）" show-overflow-tooltip></el-editable-column>
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期（只读）" :formatter="formatterBirthdate"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :editRender="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      sexList: XEUtils.clone(sexData, true),
      regionList: XEUtils.clone(regionData, true),
      list: XEUtils.clone(listData, true)
    }
  },
  methods: {
    formatterBirthdate (row, column, cellValue, index) {
      return XEUtils.toDateString(row.birthdate, 'yyyy-MM-dd')
    },
    removeEvent (row) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(row)
      }).catch(e => e)
    }
  }
}
</script>

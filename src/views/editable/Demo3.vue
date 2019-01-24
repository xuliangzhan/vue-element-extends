<template>
  <div>
    <el-button type="success" @click="$refs.editable.insert({name: '默认名字1'})">新增一行</el-button>
    <el-button type="success" @click="$refs.editable.insertAt({name: '默认名字1'}, -1)">在最后新增一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeRows([0, 2])">删除指定行[0, 2]</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="info" @click="$refs.editable.revert()">放弃更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空数据</el-button>
    <el-editable ref="editable" :data.sync="list" size="mini" style="width: 100%" :editConfig="{trigger: 'manual', mode: 'row'}">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字（只读）" show-overflow-tooltip></el-editable-column>
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :editRender="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <template v-if="$refs.editable.getActiveRowIndex() === scope.$index">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row, scope.$index)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row, scope.$index)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="$refs.editable.setActiveRow(scope.$index)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row, scope.$index)">删除</el-button>
          </template>
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
    removeEvent (row, index) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.removeRow(index)
      }).catch(e => e)
    },
    saveRowEvent (row, index) {
      this.$refs.editable.validateRow(index, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
          console.log('success row submit!!')
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (row, index) {
      this.$refs.editable.validateRow(index, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
        } else {
          // 当前行有不通过校验的列，强制取消
          this.$refs.editable.clearActive(true)
        }
      })
    }
  }
}
</script>

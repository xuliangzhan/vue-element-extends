<template>
  <div>
    <el-button type="success" @click="$refs.editable.insert({name: '默认名字1'})">新增一行</el-button>
    <el-button type="success" @click="$refs.editable.insertAt({name: '默认名字1'}, -1)">在最后新增一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="info" @click="$refs.editable.revert()">放弃更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空数据</el-button>
    <el-button type="info" @click="$refs.editable.clearSelection()">清空用户的选择</el-button>
    <el-button type="info" @click="$refs.editable.toggleRowSelection($refs.editable.getRecords(1), true)">设置第二行为选中</el-button>
    <el-button type="info" @click="$refs.editable.toggleAllSelection()">选中所有</el-button>
    <el-editable ref="editable" :data.sync="list" size="mini" style="width: 100%" :editRules="validRules" :editConfig="{trigger: 'manual', mode: 'row'}">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="name" label="名字" show-overflow-tooltip :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :editRender="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <template v-if="$refs.editable.isActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="$refs.editable.setActiveRow(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { Message, MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      sexList: XEUtils.clone(sexData, true),
      regionList: XEUtils.clone(regionData, true),
      list: XEUtils.clone(listData, true),
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 10, message: '名称长度 3-10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    removeEvent (row) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(row)
      }).catch(e => e)
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
          Message({ message: '保存成功', type: 'success' })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (row) {
      this.$refs.editable.validateRow(row, (valid, validErrs) => {
        if (valid) {
          this.$refs.editable.clearActive()
        } else {
          let message = <p>
            <p>请正确填写以下信息！</p>
            {
              Object.keys(validErrs).map(name => {
                let errors = validErrs[name]
                let msg = `${name}：${errors.map(e => e.message).join(';')}`
                return <p>{msg}</p>
              })
            }
          </p>
          Message({ message, dangerouslyUseHTMLString: true, type: 'error' })
        }
      })
    }
  }
}
</script>

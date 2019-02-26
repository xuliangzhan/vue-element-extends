<template>
  <div>
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验3-10个字符</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent">新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSelection()">清空用户的选择</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.toggleAllSelection()">选中所有</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent({filename: '显示数据.csv'})">导出显示数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent({filename: '实际数据.csv', original: true})">导出实际数据</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出指定行和列数据</el-button>
    </p>

    <el-editable
      ref="editable"
      size="mini"
      border
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row'}"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" :index="indexMethod" width="55"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList, optionProps: { value: 'value', label: 'label' }, attrs: {clearable: true}}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput', attrs: {clearable: true}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" :edit-render="{name: 'ElCascader', attrs: {options: regionList, clearable: true}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :edit-render="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" :edit-render="{name: 'ElInput', attrs: {clearable: true}}"></el-editable-column>
      <el-editable-column label="操作" width="220">
        <template slot-scope="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
            <el-button size="mini" type="warning" @click="$refs.editable.revert(scope.row)">还原</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
            <el-button size="mini" type="warning" @click="revertEvent(scope.row)">还原</el-button>
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
    indexMethod (index) {
      return index * 2
    },
    insertEvent () {
      let row = this.$refs.editable.insert({ name: '默认名字1', age: 26 })
      this.$nextTick(() => this.$refs.editable.setActiveRow(row))
    },
    customExportCsvEvent (opts) {
      this.$refs.editable.exportCsv(opts)
    },
    exportCsvEvent () {
      this.$refs.editable.exportCsv({
        filename: '导出前5行指定列(sex,age,name,region)数据.csv',
        columnMethod: (column, columnIndex) => ['sex', 'age', 'name', 'region'].includes(column.property),
        dataMethod: (row, rowIndex) => rowIndex < 5
      })
    },
    isRowOperate (row) {
      let activeInfo = this.$refs.editable.getActiveInfo()
      return activeInfo ? activeInfo.row === row : true
    },
    openActiveRowEvent (row) {
      let activeInfo = this.$refs.editable.getActiveInfo()
      // 如果当前行正在编辑中，禁止编辑其他行
      if (activeInfo) {
        if (activeInfo.row === row || !this.$refs.editable.checkValid().error) {
          if (activeInfo.isUpdate) {
            MessageBox.confirm('检测到未保存的内容，是否在离开前保存修改?', '温馨提示', {
              distinguishCancelAndClose: true,
              confirmButtonText: '保存',
              cancelButtonText: '放弃修改',
              type: 'warning'
            }).then(() => {
              this.$refs.editable.setActiveRow(row)
              this.updateRowEvent(activeInfo.row)
            }).catch(action => {
              if (action === 'cancel') {
                this.$refs.editable.revert(activeInfo.row)
                this.$refs.editable.setActiveRow(row)
                Message({ message: '放弃修改并离开当前行', type: 'warning' })
              } else {
                Message({ message: '停留在当前行编辑', type: 'info' })
              }
            })
          } else {
            this.$refs.editable.setActiveRow(row)
          }
        }
      } else {
        this.$refs.editable.setActiveRow(row)
      }
    },
    removeEvent (row) {
      if (this.isRowOperate(row)) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.editable.remove(row)
        }).catch(e => e)
      }
    },
    revertEvent (row) {
      if (this.isRowOperate(row)) {
        if (this.$refs.editable.hasRowChange(row)) {
          MessageBox.confirm('确定还原该行数据?', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$refs.editable.revert(row)
            Message({ message: '数据还原成功！', type: 'success' })
          }).catch(e => e)
        } else {
          Message({ message: '数据未改动！', type: 'info' })
        }
      }
    },
    updateRowEvent (row) {
      this.$refs.editable.reloadRow(row)
      Message({ message: '保存成功', type: 'success' })
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
          this.$refs.editable.reloadRow(row)
          Message({ message: '保存成功', type: 'success' })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (row) {
      let activeInfo = this.$refs.editable.getActiveInfo()
      if (activeInfo && activeInfo.isUpdate) {
        MessageBox.confirm('检测到未保存的内容，确定放弃修改?', '温馨提示', {
          confirmButtonText: '放弃更改',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.editable.clearActive()
            this.$refs.editable.revert(row)
          } else {
            this.$refs.editable.setActiveRow(row)
          }
        }).catch(e => e)
      } else {
        this.$refs.editable.clearActive()
      }
    }
  }
}
</script>

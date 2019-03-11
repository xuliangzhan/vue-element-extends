<template>
  <div>
    <p>
      <el-button type="success" size="mini" @click="insertEvent('editable1')">新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable1.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable1.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable1.clearSelection()">清空用户的选择</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable1', {filename: '显示数据.csv'})">导出显示数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable1', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
    </p>

    <el-editable
      ref="editable1"
      class="manual-table7"
      size="mini"
      border
      height="260px"
      :data.sync="list1"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod1}"
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
      <el-editable-column label="操作" width="160">
        <template slot-scope="scope">
          <template v-if="$refs.editable1.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent('editable1', scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent('editable1', scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent('editable1', scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent('editable1', scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
    </el-editable>

    <p>
      <el-button type="success" size="mini" @click="insertEvent('editable2')">新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable2.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable2.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable2.clearSelection()">清空用户的选择</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable2', {filename: '显示数据.csv'})">导出显示数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable2', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
    </p>

    <el-editable
      ref="editable2"
      size="mini"
      border
      height="260px"
      :data.sync="list2"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod2}"
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
      <el-editable-column label="操作" width="160">
        <template slot-scope="scope">
          <template v-if="$refs.editable2.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent('editable2', scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent('editable2', scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent('editable2', scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent('editable2', scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
    </el-editable>

    <p>
      <el-button type="success" size="mini" @click="insertEvent('editable3')">新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable3.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable3.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable3.clearSelection()">清空用户的选择</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable3', {filename: '显示数据.csv'})">导出显示数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent('editable3', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
    </p>

    <el-editable
      ref="editable3"
      size="mini"
      border
      height="260px"
      :data.sync="list3"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod3}"
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
      <el-editable-column label="操作" width="160">
        <template slot-scope="scope">
          <template v-if="$refs.editable3.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent('editable3', scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent('editable3', scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent('editable3', scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent('editable3', scope.row)">删除</el-button>
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

export default {
  data () {
    return {
      sexList: [
        {
          label: '男',
          spell: 'nan',
          value: '1',
          val: 'x'
        },
        {
          label: '女',
          spell: 'nv',
          value: '0',
          val: 'o'
        }
      ],
      regionList: regionData,
      list1: XEUtils.clone(listData, true),
      list2: XEUtils.clone(listData, true),
      list3: XEUtils.clone(listData, true),
      isClearActiveFlag: true
    }
  },
  methods: {
    indexMethod (index) {
      return index * 2
    },
    insertEvent (name) {
      let row = this.$refs[name].insert({ name: '默认名字1', age: 26 })
      this.$nextTick(() => this.$refs[name].setActiveRow(row))
    },
    customExportCsvEvent (name, opts) {
      this.$refs[name].exportCsv(opts)
    },
    isRowOperate (name, row) {
      let activeInfo = this.$refs[name].getActiveRow()
      return activeInfo ? activeInfo.row === row : true
    },
    clearActiveMethod1 ({ type, row, rowIndex }) {
      console.log('clear 1')
      if (this.isClearActiveFlag && type === 'out') {
        return this.checkSaveData('editable1', row)
      }
      return this.isClearActiveFlag
    },
    clearActiveMethod2 ({ type, row, rowIndex }) {
      console.log('clear 2')
      if (this.isClearActiveFlag && type === 'out') {
        return this.checkSaveData('editable2', row)
      }
      return this.isClearActiveFlag
    },
    clearActiveMethod3 ({ type, row, rowIndex }) {
      console.log('clear 3')
      if (this.isClearActiveFlag && type === 'out') {
        return this.checkSaveData('editable3', row)
      }
      return this.isClearActiveFlag
    },
    // 判断多表格切换时是否有数据没有保存
    checkSaveData (name, row) {
      if (this.$refs[name].hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('您离开了表格，检测未保存的内容，是否在离开前保存修改?', '温馨提示', {
          closeOnClickModal: false,
          distinguishCancelAndClose: true,
          confirmButtonText: '保存',
          cancelButtonText: '放弃修改',
          type: 'warning'
        }).then(() => {
          this.$refs[name].clearActive()
          this.updateRowEvent(name, row)
        }).catch(action => {
          if (action === 'cancel') {
            this.$refs[name].revert(row)
            this.$refs[name].clearActive()
            Message({ message: '放弃修改并离开当前行', type: 'warning' })
          } else {
            this.$refs[name].setActiveRow(row)
            Message({ message: '停留在当前行编辑', type: 'info' })
          }
        }).then(() => {
          this.isClearActiveFlag = true
        })
        return false
      }
      return this.isClearActiveFlag
    },
    openActiveRowEvent (name, row) {
      let activeInfo = this.$refs[name].getActiveRow()
      // 如果当前行正在编辑中，禁止编辑其他行
      if (activeInfo) {
        if (activeInfo.row === row || !this.$refs[name].checkValid().error) {
          if (activeInfo.isUpdate) {
            MessageBox.confirm('检测到未保存的内容，是否在离开前保存修改?', '温馨提示', {
              closeOnClickModal: false,
              distinguishCancelAndClose: true,
              confirmButtonText: '保存',
              cancelButtonText: '放弃修改',
              type: 'warning'
            }).then(() => {
              this.$refs[name].setActiveRow(row)
              this.updateRowEvent(name, activeInfo.row)
            }).catch(action => {
              if (action === 'cancel') {
                this.$refs[name].revert(activeInfo.row)
                this.$refs[name].setActiveRow(row)
                Message({ message: '放弃修改并离开当前行', type: 'warning' })
              } else {
                Message({ message: '停留在当前行编辑', type: 'info' })
              }
            })
          } else {
            this.$refs[name].setActiveRow(row)
          }
        }
      } else {
        this.$refs[name].setActiveRow(row)
      }
    },
    removeEvent (name, row) {
      if (this.isRowOperate(name, row)) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs[name].remove(row)
        }).catch(e => e)
      }
    },
    updateRowEvent (name, row) {
      this.$refs[name].reloadRow(row)
      Message({ message: '保存成功', type: 'success' })
    },
    saveRowEvent (name, row) {
      this.$refs[name].validateRow(row, valid => {
        if (valid) {
          this.$refs[name].clearActive()
          this.$refs[name].reloadRow(row)
          Message({ message: '保存成功', type: 'success' })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (name, row) {
      let activeInfo = this.$refs[name].getActiveRow()
      if (activeInfo && activeInfo.isUpdate) {
        MessageBox.confirm('检测到未保存的内容，确定放弃修改?', '温馨提示', {
          closeOnClickModal: false,
          confirmButtonText: '放弃更改',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs[name].clearActive()
            this.$refs[name].revert(row)
          } else {
            this.$refs[name].setActiveRow(row)
          }
        }).catch(e => e)
      } else {
        this.$refs[name].clearActive()
      }
    }
  }
}
</script>

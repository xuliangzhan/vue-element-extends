<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">自定义设置动态列</p>
    <p style="color: red;font-size: 12px;">表尾合计行</p>

    <p>
      <el-button type="success" size="mini" @click="$refs.editable.insert({flag3: false})">新增一行</el-button>
      <el-button type="success" size="mini" @click="$refs.editable.insertAt({flag3: false}, -1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="click-table7"
      stripe
      border
      show-summary
      size="medium"
      :summary-method="getSummaries"
      :span-method="objectSpanMethod"
      style="width: 100%">
      <el-editable-column type="index" width="55">
        <template slot="header">
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </el-editable-column>
      <template v-for="(item, index) in columnConfigs">
        <el-editable-column v-if="item.customShow" :key="index" v-bind="item"></el-editable-column>
      </template>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-popover placement="top" width="160" v-model="scope.row.flag3">
            <p>确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.flag3 = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeEvent(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popover>
        </template>
      </el-editable-column>
    </el-editable>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="300px" @open="openCustomEvent">
      <ul class="custom-wrapper">
        <li v-for="(item, index) in columnConfigs" :key="index">
          <el-checkbox v-model="item.customChecked">{{ item.label }}</el-checkbox>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetCustomEvent">重 置</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCustomEvent">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'
import columnsData from '@/common/json/editable/columns.json'

export default {
  data () {
    return {
      loading: false,
      dialogVisible: false,
      columnConfigs: [],
      sexList: [],
      regionList: []
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      let sexPromise = this.getSexJSON()
      let regionPromise = this.getRegionJSON()
      this.loading = true
      Promise.all([
        this.loadList(),
        this.getColumnConfigs().then(data => {
          this.columnConfigs = data.map(column => {
            let defaultShow = ['name', 'sex', 'age', 'rate'].includes(column.prop)
            column.customDefault = defaultShow
            column.customChecked = defaultShow
            column.customShow = defaultShow
            column.minWidth = '150'
            switch (column.prop) {
              case 'sex':
                column.editRender.options = []
                sexPromise.then(rest => {
                  column.editRender.options = rest
                })
                break
              case 'region':
                column.editRender.attrs = { options: [] }
                regionPromise.then(rest => {
                  column.editRender.attrs.options = rest
                })
                break
              case 'birthdate':
                column.editRender.attrs = {
                  type: 'date',
                  format: 'yyyy-MM-dd'
                }
                break
              case 'rate':
                column.editRender.type = 'visible'
                break
            }
            return column
          })
        })
      ]).then(datas => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    findList () {
      this.loading = true
      return this.loadList().then(data => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    loadList () {
      return this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
      })
    },
    getSummaries (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '汇总'
          return
        }
        switch (column.property) {
          case 'sex':
            let rest = XEUtils.groupBy(data, column.property)
            sums[index] = `男：${rest[1] ? rest[1].length : 0}，女：${rest[0] ? rest[0].length : 0}`
            break
          case 'age':
            sums[index] = `平均：${XEUtils.mean(data, column.property)}岁`
            break
          case 'birthdate':
            sums[index] = `平均年份：${XEUtils.toInteger(XEUtils.mean(data.map(item => XEUtils.toDateString(item[column.property], 'yyyy'))))}`
            break
          case 'rate':
            sums[index] = `总分：${XEUtils.sum(data, column.property)}`
            break
          default:
            sums[index] = ''
            break
        }
      })
      return sums
    },
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    removeEvent (row) {
      row.flag3 = false
      this.$refs.editable.remove(row)
    },
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
    },
    openCustomEvent () {
      this.columnConfigs.forEach(column => {
        column.customChecked = column.customShow
      })
    },
    resetCustomEvent () {
      this.columnConfigs.forEach(column => {
        column.customChecked = column.customDefault
      })
    },
    saveCustomEvent () {
      this.dialogVisible = false
      this.columnConfigs.forEach(column => {
        column.customShow = column.customChecked
      })
    },
    getInsertEvent () {
      let rest = this.$refs.editable.getInsertRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取新增数据(${rest.length}条)` }).catch(e => e)
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` }).catch(e => e)
    },
    getRemoveEvent () {
      let rest = this.$refs.editable.getRemoveRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已删除数据(${rest.length}条)` }).catch(e => e)
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    postJSON (data) {
      // 提交请求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getColumnConfigs () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(columnsData, true)), 900)
      })
    },
    getDataJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(listData, true)), 400)
      })
    },
    getRegionJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
      })
    }
  }
}
</script>

<style>
.custom-wrapper {
  height: 200px;
  overflow: auto;
  list-style: decimal;
}
</style>

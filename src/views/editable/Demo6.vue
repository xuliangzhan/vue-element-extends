<template>
  <div v-loading="loading">
    <el-button icon="el-icon-plus" @click="$refs.editable.insert()">新增一行</el-button>
    <el-button type="success" icon="el-icon-plus" @click="$refs.editable.insertAt(null, -1)">在最后新增一行</el-button>
    <el-button type="danger" icon="el-icon-delete" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="warning" @click="$refs.editable.revert()">放弃更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空数据</el-button>
    <el-button type="success" icon="el-icon-check" @click="submitEvent">保存</el-button>
    <el-button type="primary" @click="getInsertEvent">获取新增数据</el-button>
    <el-button type="primary" @click="getUpdateEvent">获取已修改数据</el-button>
    <el-button type="primary" @click="getRemoveEvent">获取已删除数据</el-button>
    <el-editable ref="editable" stripe border size="medium" style="width: 100%">
      <el-editable-column type="index" width="55">
        <template slot="head">
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </el-editable-column>
      <template v-for="(item, index) in columnConfigs">
        <el-editable-column v-if="item.show" :key="index" v-bind="item"></el-editable-column>
      </template>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-popover placement="top" width="160" v-model="scope.row.flag3">
            <p>这是一段内容这是一段内容确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.flag3 = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeEvent(scope.row, scope.$index)">确定</el-button>
            </div>
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popover>
        </template>
      </el-editable-column>
    </el-editable>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="300px" @open="openCustomEvent">
      <ul>
        <li v-for="(item, index) in columnConfigs" :key="index">
          <el-checkbox v-model="item.checked">{{ item.label }}</el-checkbox>
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
      this.findList()
      this.getColumnConfigs().then(data => {
        this.columnConfigs = data.map(column => {
          column.checked = true
          column.show = true
          switch (column.prop) {
            case 'sex':
              column.editRender.options = []
              sexPromise.then(rest => {
                column.editRender.options = rest
              })
              break
            case 'region':
              column.editRender.attrs = {options: []}
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
    },
    findList () {
      this.loading = true
      this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    removeEvent (row, index) {
      row.flag3 = false
      this.$refs.editable.removeRow(index)
    },
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
    },
    openCustomEvent () {
      this.columnConfigs.forEach(column => {
        column.checked = column.show
      })
    },
    resetCustomEvent () {
      this.columnConfigs.forEach(column => {
        column.checked = true
      })
    },
    saveCustomEvent () {
      this.dialogVisible = false
      this.columnConfigs.forEach(column => {
        column.show = column.checked
      })
    },
    getInsertEvent () {
      let rest = this.$refs.editable.getInsertRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取新增数据(${rest.length}条)` })
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` })
    },
    getRemoveEvent () {
      let rest = this.$refs.editable.getRemoveRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已删除数据(${rest.length}条)` })
    },
    postJSON (data) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getColumnConfigs () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(columnsData, true)), 100)
      })
    },
    getDataJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(listData, true)), 350)
      })
    },
    getRegionJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
      })
    }
  }
}
</script>

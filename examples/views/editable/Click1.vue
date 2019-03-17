<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">如果是单击模式会在点击后激活列编辑</p>

    <div class="click-table1-oper">
      <el-button type="success" size="small" @click="insertEvent">新增</el-button>
      <el-button type="warning" size="small" @click="submitEvent">保存</el-button>
      <el-button type="success" size="small" @click="exportCsvEvent">导出</el-button>
    </div>

    <el-editable
      ref="editable"
      class="click-table1"
      border
      size="small"
      :data.sync="list"
      style="width: 100%">
      <el-editable-column prop="id" label="ID" width="80"></el-editable-column>
      <el-editable-column prop="name" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="describe" label="描述" :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></el-editable-column>
      <el-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column label="操作" width="160">
        <template v-slot="scope">
          <el-button size="small" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </el-editable-column>
      <template v-slot:append>
        <div>-- append 插槽 --</div>
      </template>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { MessageBox, Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      list: []
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      XEAjax.doGet('/api/role/list').then(({ data }) => {
        this.list = data
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
    },
    insertEvent () {
      let row = this.$refs.editable.insert({
        name: `New ${Date.now()}`,
        age: 26,
        flag: false
      })
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
    },
    removeEvent (row) {
      if (row.id) {
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          XEAjax.doDelete(`/api/role/delete/${row.id}`).then(({ data }) => {
            this.findList()
          }).catch(e => {
            this.loading = false
          })
        }).catch(e => e)
      } else {
        this.$refs.editable.remove(row)
      }
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          let { insertRecords, updateRecords } = this.$refs.editable.getAllRecords()
          if (insertRecords.length || updateRecords.length) {
            insertRecords.forEach(item => {
              if (XEUtils.isDate(item.date)) {
                item.date = item.date.getTime()
              }
            })
            updateRecords.forEach(item => {
              if (XEUtils.isDate(item.date)) {
                item.date = item.date.getTime()
              }
            })
            this.loading = true
            XEAjax.doPost('/api/role/save', { insertRecords, updateRecords }).then(({ data }) => {
              Message({
                type: 'success',
                message: '保存成功!'
              })
              this.findList()
            }).catch(e => {
              this.loading = false
            })
          } else {
            Message({
              type: 'info',
              message: '数据未改动！'
            })
          }
        }
      })
    },
    exportCsvEvent () {
      this.$refs.editable.exportCsv()
    }
  }
}
</script>

<style>
.click-table1-oper {
  margin-bottom: 18px;
}
.click-table1.editable .editable-row.new-insert,
.click-table1.editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>

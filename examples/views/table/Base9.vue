<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">树形</p>

    <div class="base-table9-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-table
      ref="elxTable"
      border
      row-key="id"
      :data.sync="list"
      style="width: 100%">
      <elx-table-column prop="id" label="ID" width="180"></elx-table-column>
      <elx-table-column prop="name" label="名称" min-width="220" show-overflow-tooltip></elx-table-column>
      <elx-table-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></elx-table-column>
      <elx-table-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-table-column>
    </elx-table>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'

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
      return XEAjax.doGet('/api/file/list').then(({ data }) => {
        this.list = XEUtils.toArrayTree(data, { key: 'id', parentKey: 'parentId', children: 'children' })
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    formatColumnSize (row, column, cellValue, index) {
      if (XEUtils.isNumber(cellValue)) {
        let units = ['B', 'KB', 'MB', 'GB', 'TB']
        let unit = ''
        let size = XEUtils.toNumber(cellValue)
        for (let index = 0; index < units.length; index++) {
          unit = units[index]
          if (size >= 1024) {
            size = XEUtils.toFixedNumber(size / 1024, 2)
          } else {
            break
          }
        }
        return `${size} ${unit}`
      }
      return ''
    },
    exportCsvEvent () {
      this.$refs.elxTable.exportCsv()
    }
  }
}
</script>

<style>
.base-table9-oper {
  margin-bottom: 18px;
}
</style>

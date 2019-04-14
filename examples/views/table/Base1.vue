<template>
  <div v-loading="loading">

    <div class="base-table1-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-table
      ref="elxTable"
      border
      size="small"
      :data.sync="list"
      style="width: 100%">
      <elx-table-column type="index" width="55"></elx-table-column>
      <elx-table-column prop="id" label="ID" width="80"></elx-table-column>
      <elx-table-column prop="name" label="名字" show-overflow-tooltip></elx-table-column>
      <elx-table-column prop="age" label="年龄"></elx-table-column>
      <elx-table-column prop="role" label="角色" show-overflow-tooltip></elx-table-column>
      <elx-table-column prop="describe" label="文本域" show-overflow-tooltip></elx-table-column>
      <elx-table-column prop="date" label="日期" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="flag" label="是否启用"></elx-table-column>
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
      XEAjax.doGet('/api/user/list').then(({ data }) => {
        this.list = data
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    exportCsvEvent () {
      this.$refs.elxTable.exportCsv()
    }
  }
}
</script>

<style>
.base-table1-oper {
  margin-bottom: 18px;
}
</style>

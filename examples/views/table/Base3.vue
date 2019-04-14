<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">多级表头</p>

    <el-form ref="tableform" class="base-table3-form" size="mini" :inline="true" :model="formData">
      <el-form-item label="名字" prop="name">
        <el-input v-model="formData.name" placeholder="名字"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-input v-model="formData.role" placeholder="请输入角色"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchEvent">查询</el-button>
        <el-button @click="$refs.tableform.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="base-table3-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-table
      ref="elxTable"
      border
      height="482"
      :data.sync="list"
      style="width: 100%">
      <elx-table-column type="selection" width="55"></elx-table-column>
      <elx-table-column prop="id" label="ID" width="80"></elx-table-column>
      <elx-table-column label="重要信息">
        <elx-table-column prop="name" label="名字" show-overflow-tooltip></elx-table-column>
        <elx-table-column prop="age" label="年龄"></elx-table-column>
      </elx-table-column>
      <elx-table-column label="基本信息">
        <elx-table-column prop="role" label="角色" show-overflow-tooltip></elx-table-column>
        <elx-table-column prop="describe" label="文本域" show-overflow-tooltip></elx-table-column>
        <elx-table-column label="其他信息">
          <elx-table-column prop="date" label="日期" :formatter="formatterDate"></elx-table-column>
          <elx-table-column prop="flag" label="是否启用"></elx-table-column>
        </elx-table-column>
      </elx-table-column>
      <elx-table-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-table-column>
    </elx-table>

    <el-pagination
      class="click-table2-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageVO.currentPage"
      :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
      :page-size="pageVO.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageVO.totalResult">
    </el-pagination>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'

export default {
  data () {
    return {
      loading: false,
      list: [],
      formData: {
        name: null,
        sex: null,
        role: null
      },
      pageVO: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      }
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      XEAjax.doGet(`/api/user/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`, this.formData).then(response => {
        let { page, result } = response.data
        this.list = result
        this.pageVO.totalResult = page.totalResult
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    searchEvent () {
      this.pageVO.currentPage = 1
      this.findList()
    },
    handleSizeChange (pageSize) {
      this.pageVO.pageSize = pageSize
      this.findList()
    },
    handleCurrentChange (currentPage) {
      this.pageVO.currentPage = currentPage
      this.findList()
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
.base-table3-oper {
  margin-bottom: 18px;
}
</style>

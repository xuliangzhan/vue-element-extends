<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">启用滚动渲染，设置 render='scroll' 可以流畅的支撑海量数据</p>
    <p style="color: red;font-size: 12px;">影响性能的参数：data、rowKey、fixed</p>
    <p style="color: red;font-size: 12px;">兼容性：不兼容动态行高；不支持树结构；不支持多选</p>

    <div class="scroll0w-table-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-table
      ref="elxTable"
      border
      height="460"
      :data="list"
      :config="{render: 'scroll'}"
      style="width: 100%">
      <elx-table-column type="index" width="100" fixed="left"></elx-table-column>
      <elx-table-column prop="name" label="名字" min-width="400" show-overflow-tooltip>
        <template v-slot:header="scope">
          <i class="el-icon-question"></i>名字
        </template>
      </elx-table-column>
      <elx-table-column prop="age" label="年龄" min-width="400"></elx-table-column>
      <elx-table-column prop="updateTime" label="更新时间" width="400" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="createTime" label="创建时间" width="400" :formatter="formatterDate"></elx-table-column>
      <el-table-column label="浮动列" width="200" fixed="right">
        <template v-slot="scope">
          <el-button type="text" size="small">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
    </elx-table>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      list: [], // 使用 data 方式双向绑定大数据，性能耗损大
      formData: {
        name: null,
        sex: null,
        role: null
      }
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      let size = Number(this.$route.params.number)
      let list = window.CACHE_DATA_LIST.slice(0, size)
      let startTime = Date.now()
      this.list = list
      this.loading = false
      this.$nextTick(() => {
        Message({ message: `渲染 ${list.length} 条耗时 ${Date.now() - startTime} ms`, type: 'info', duration: 8000, showClose: true })
      })
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    exportCsvEvent () {
      this.$refs.elxTable.exportCsv({ original: true })
    }
  },
  beforeRouteUpdate (to, from, next) {
    Message.closeAll()
    next()
    this.findList()
  }
}
</script>

<style>
.scroll0w-table-oper {
  margin-bottom: 18px;
}
.scroll0w-table-pagination {
  margin-top: 18px;
  text-align: right;
}
</style>

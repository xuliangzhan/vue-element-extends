<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">启用滚动渲染，可以非常流畅的支撑大量数据</p>
    <p style="color: red;font-size: 12px;">出于性能考虑：不建议使用 data 绑定大数据，vue 监听会消耗大量性能，应该使用 reload 函数加载</p>
    <p style="color: red;font-size: 12px;">出于性能考虑：不支持滚动动画；不支持显示默认的索引列；只支持固定行高的表格</p>

    <!-- <div class="scroll0w-table-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div> -->

    <elx-table
      ref="elxTable"
      border
      :config="{render: 'scroll'}"
      style="width: 100%">
      <elx-table-column type="selection" width="55"></elx-table-column>
      <elx-table-column prop="_index" label="#" align="center" width="100"></elx-table-column>
      <elx-table-column prop="name" label="名字" show-overflow-tooltip>
        <template v-slot:header="scope">
          <i class="el-icon-question"></i>名字
        </template>
      </elx-table-column>
      <elx-table-column prop="date" label="日期" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="rate" label="评分">
        <template v-slot="scope">
          <el-rate
            v-model="scope.row.rate"
            disabled
            show-score
            text-color="#ff9900">
          </el-rate>
        </template>
      </elx-table-column>
      <elx-table-column prop="updateTime" label="更新时间" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="createTime" label="创建时间" :formatter="formatterDate"></elx-table-column>
    </elx-table>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'

export default {
  data () {
    return {
      loading: false,
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
      setTimeout(() => {
        this.$refs.elxTable.reload(window.CACHE_DATA_LIST.slice(0, size))
        this.loading = false
      }, 300)
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    exportCsvEvent () {
      this.$refs.elxTable.exportCsv()
    }
  },
  beforeRouteUpdate (to, from, next) {
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

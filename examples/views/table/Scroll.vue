<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">启用滚动渲染，可以流畅的支撑海量数据</p>
    <p style="color: red;font-size: 12px;">出于性能考虑：避免使用 data 双向绑定大数据，vue 监听会消耗大量性能，应该使用 reload 函数加载；不支持滚动动画；不支持动态行高；不支持树结构</p>

    <div class="scroll0w-table-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-table
      ref="elxTable"
      border
      :config="{render: 'scroll'}"
      style="width: 100%">
      <elx-table-column type="selection" width="55"></elx-table-column>
      <elx-table-column type="index" width="100" fixed="left"></elx-table-column>
      <elx-table-column prop="name" label="名字" min-width="100" show-overflow-tooltip>
        <template v-slot:header="scope">
          <i class="el-icon-question"></i>名字
        </template>
      </elx-table-column>
      <elx-table-column prop="sex" label="性别" min-width="140" :formatter="formatterSex"></elx-table-column>
      <elx-table-column prop="age" label="年龄" min-width="140"></elx-table-column>
      <elx-table-column prop="region" label="地区" width="200" :formatter="formatterRegion"></elx-table-column>
      <elx-table-column prop="date" width="220" label="日期" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="rate" width="220" label="评分">
        <template v-slot="scope">
          <el-rate
            v-model="scope.row.rate"
            disabled
            show-score
            text-color="#ff9900">
          </el-rate>
        </template>
      </elx-table-column>
      <elx-table-column prop="updateTime" label="更新时间" width="200" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="createTime" label="创建时间" width="200" :formatter="formatterDate"></elx-table-column>
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
      sexList: [],
      regionList: [],
      formData: {
        name: null,
        sex: null,
        role: null
      }
    }
  },
  created () {
    this.findList()
    this.findSexList()
    this.findRegionList()
  },
  methods: {
    findList () {
      this.loading = true
      let size = Number(this.$route.params.number)
      this.$nextTick(() => {
        this.$refs.elxTable.reload([])
        setTimeout(() => {
          this.$refs.elxTable.reload(window.CACHE_DATA_LIST.slice(0, size))
          this.loading = false
        }, 300)
      })
    },
    findSexList () {
      XEAjax.doGet('/api/conf/sex/list').then(({ data }) => {
        this.sexList = data
      })
    },
    findRegionList () {
      XEAjax.doGet('/api/conf/region/list').then(({ data }) => {
        this.regionList = data
      })
    },
    formatterSex (row, column, cellValue, index) {
      let item = this.sexList.find(item => item.value === cellValue)
      return item ? item.label : null
    },
    formatterRegion (row, column, cellValue, index) {
      let values = cellValue || []
      let labels = []
      let matchCascaderData = function (index, list) {
        let val = values[index]
        if (list && values.length > index) {
          list.forEach(item => {
            if (item.value === val) {
              labels.push(item.label)
              matchCascaderData(++index, item.children)
            }
          })
        }
      }
      matchCascaderData(0, this.regionList || [])
      return labels.join(' / ')
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    exportCsvEvent () {
      this.$refs.elxTable.exportCsv({ original: true })
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

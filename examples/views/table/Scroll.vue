<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">启用滚动渲染，可以非常流畅的支撑大量数据</p>
    <p style="color: red;font-size: 12px;">出于性能考虑：不支持滚动动画；不支持显示默认的索引列；只支持固定行高的表格</p>

    <!-- <div class="scroll0w-table-oper">
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div> -->

    <elx-table
      ref="elxTable"
      border
      :data.sync="list"
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
      list: [],
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
      this.list = []
      let size = Number(this.$route.params.number)
      setTimeout(() => {
        if (window[`CACHE_LIST_${size}`]) {
          this.list = window[`CACHE_LIST_${size}`].slice(0, size)
          this.loading = false
        } else {
          // 生成大量数据
          let currTime = Date.now()
          let list = []
          let fullIndex = 0
          let setData = () => {
            for (let index = 0; index < 4000; index++) {
              currTime += 5000
              fullIndex++
              list.push({
                _index: fullIndex,
                id: `${10000 + fullIndex}`,
                name: `name_${fullIndex}`,
                date: currTime,
                sex: index % 3 ? '0' : '1',
                age: index % 4 === 0 ? 30 : index % 3 === 0 ? 28 : index % 2 === 0 ? 26 : 24,
                region: index % 4 === 0 ? [19, 199, 1773] : index % 3 === 0 ? [9, 73, 719] : [1, 1, 5],
                rate: index % 4 === 0 ? 4 : index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1,
                updateTime: currTime,
                createTime: currTime
              })
            }
            if (fullIndex >= size) {
              window[`CACHE_LIST_${size}`] = list
              this.list = list.slice(0, size)
              this.loading = false
            } else {
              setTimeout(setData, 50)
            }
          }
          setData()
        }
      }, 500)
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

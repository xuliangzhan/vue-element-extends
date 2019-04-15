<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">启用滚动渲染，可以非常流畅的支撑大量数据</p>
    <p style="color: red;font-size: 12px;">出于性能考虑：不支持滚动动画；不支持显示默认的索引列；只支持固定行高的表格</p>

    <!-- <div class="scroll-table1-oper">
      <el-button type="success" size="small" @click="insertEvent">新增</el-button>
      <el-button type="success" size="small" @click="exportCsvEvent">导出</el-button>
    </div> -->

    <elx-editable
      ref="elxEditable"
      class="scroll-table1"
      border
      :data.sync="list"
      :edit-config="{trigger: 'manual', mode: 'row', render: 'scroll'}"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="_index" label="#" align="center" width="100"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" width="220" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy年MM月dd日 HH时ss分mm秒'}}"></elx-editable-column>
      <elx-editable-column prop="rate" label="评分" :edit-render="{type: 'visible'}">
        <template v-slot:edit="scope">
          <el-rate
            v-model="scope.row.rate"
            show-score
            text-color="#ff9900">
          </el-rate>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="160">
        <template v-slot="scope">
          <template v-if="$refs.elxEditable.hasActiveRow(scope.row)">
            <el-button size="small" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="small" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </elx-editable-column>
    </elx-editable>
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
      list: [],
      sexList: [],
      regionList: [],
      isClearActiveFlag: true
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
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    insertEvent () {
      let activeInfo = this.$refs.elxEditable.getActiveRow()
      let { insertRecords } = this.$refs.elxEditable.getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        this.$refs.elxEditable.insert({
          name: `New ${Date.now()}`,
          age: 26,
          flag: false
        }).then(({ row }) => {
          this.$refs.elxEditable.setActiveRow(row)
        })
      }
    },
    // 编辑处理
    openActiveRowEvent (row) {
      this.$nextTick(() => {
        let activeInfo = this.$refs.elxEditable.getActiveRow()
        if (activeInfo && activeInfo.isUpdate) {
          this.isClearActiveFlag = false
          MessageBox.confirm('检测到未保存的内容，请确认操作?', '温馨提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存数据',
            cancelButtonText: '取消修改',
            type: 'warning'
          }).then(() => {
            this.$refs.elxEditable.setActiveRow(row)
            this.saveRowEvent(activeInfo.row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs.elxEditable.revert(activeInfo.row)
              this.$refs.elxEditable.setActiveRow(row)
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
        } else {
          this.$refs.elxEditable.setActiveRow(row)
        }
      })
    },
    // 取消处理
    cancelRowEvent (row) {
      if (!row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '移除数据',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.elxEditable.remove(row)
          }
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else if (this.$refs.elxEditable.hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('检测到未保存的内容，是否取消修改?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '取消修改',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          this.$refs.elxEditable.clearActive()
          this.$refs.elxEditable.revert(row)
        }).catch(action => {
          if (action === 'cancel') {
            this.$refs.elxEditable.setActiveRow(row)
          }
        }).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.elxEditable.clearActive()
      }
    },
    removeEvent (row) {
      if (row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          XEAjax.doDelete(`/api/role/delete/${row.id}`).then(({ data }) => {
            this.findList()
          }).catch(e => {
            this.loading = false
          })
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.elxEditable.remove(row)
      }
    },
    saveRowEvent (row) {
      this.$refs.elxEditable.validateRow(row, valid => {
        if (valid) {
          let url = '/api/role/add'
          if (row.id) {
            url = '/api/role/update'
          }
          this.loading = true
          this.$refs.elxEditable.clearActive()
          XEAjax.doPost(url, row).then(({ data }) => {
            this.findList()
            Message({ message: '保存成功', type: 'success' })
          }).catch(e => {
            this.loading = false
          })
        }
      })
    },
    exportCsvEvent () {
      this.$refs.elxEditable.exportCsv()
    }
  },
  beforeRouteUpdate (to, from, next) {
    next()
    this.findList()
  }
}
</script>

<style>
.scroll-table1-oper {
  margin-bottom: 18px;
}
.scroll-table1.elx-editable .elx-editable-row.new-insert,
.scroll-table1.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>

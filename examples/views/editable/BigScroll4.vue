<template>
  <div
    v-loading="loading"
    element-loading-text="生成数据中，请稍后..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <p style="color: red;font-size: 12px;">双击模式、列编辑</p>
    <p style="color: red;font-size: 12px;">影响性能的参数：data、rowKey、fixed</p>
    <p style="color: red;font-size: 12px;">兼容性：不兼容动态行高；不支持树结构</p>

    <div class="scroll-table4-oper">
      <el-button type="success" size="small" @click="insertEvent">新增</el-button>
      <el-button type="success" size="small" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="scroll-table4"
      border
      height="500"
      size="small"
      :edit-config="{trigger: 'click', mode: 'cell', render: 'scroll', renderSize: 80, useDefaultValidTip: true}"
      :edit-rules="validRules"
      :context-menu-config="{headerMenus, bodyMenus}"
      style="width: 100%">
      <elx-editable-column type="index" width="100"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" min-width="140" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="sex" label="性别" min-width="140" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" min-width="140" :edit-render="{name: 'ElInputNumber', props: {min: 1, max: 200}}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', props: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" width="220" :edit-render="{name: 'ElDatePicker', props: {type: 'datetime', format: 'yyyy年MM月dd日 HH时ss分mm秒'}}"></elx-editable-column>
      <elx-editable-column prop="rate" label="评分" width="180" :edit-render="{type: 'visible'}">
        <template v-slot:edit="scope">
          <el-rate
            v-model="scope.row.rate"
            show-score
            text-color="#ff9900">
          </el-rate>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="200" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="200" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="100">
        <template v-slot="scope">
          <el-button type="mini" @click="removeEvent(scope.row)">删除</el-button>
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
      sexList: [],
      regionList: [],
      isClearActiveFlag: true,
      validRules: {
        name: [
          { required: true, message: '请输入名字', trigger: 'change' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'change' }
        ]
      },
      headerMenus: [
        [
          {
            code: 'ALL_EXPORT',
            name: '导出全部.csv',
            prefixIcon: 'el-icon-download'
          }
        ]
      ],
      bodyMenus: [
        [
          {
            code: 'ROW_INSERT_ACTIVE',
            name: '插入新行',
            prefixIcon: 'el-icon-plus'
          },
          {
            code: 'ROW_REMOVE',
            name: '删除行',
            prefixIcon: 'el-icon-minus'
          }
        ],
        [
          {
            code: 'CELL_RESET',
            name: '清除内容',
            prefixIcon: 'el-icon-close'
          },
          {
            code: 'CELL_REVERT',
            name: '还原数据'
          }
        ],
        [
          {
            code: 'ROW_EXPORT',
            name: '导出行.csv',
            prefixIcon: 'el-icon-download'
          },
          {
            code: 'ALL_EXPORT',
            name: '导出全部.csv'
          }
        ]
      ]
    }
  },
  created () {
    Message.closeAll()
    this.findList()
    this.findSexList()
    this.findRegionList()
  },
  methods: {
    findList () {
      this.loading = true
      let size = Number(this.$route.params.number)
      this.$nextTick(() => {
        this.$refs.elxEditable.reload([])
        setTimeout(() => {
          let list = window.CACHE_DATA_LIST.slice(0, size)
          let startTime = Date.now()
          this.$refs.elxEditable.reload(list)
          this.loading = false
          this.$nextTick(() => {
            Message({ message: `渲染 ${list.length} 条耗时 ${Date.now() - startTime} ms`, type: 'info', duration: 8000, showClose: true })
          })
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
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    insertEvent () {
      this.$refs.elxEditable.insert({
        name: `New ${Date.now()}`,
        age: 26,
        rate: 2
      }).then(({ row }) => {
        this.$refs.elxEditable.setActiveCell(row)
      })
    },
    removeEvent (row) {
      if (row.id) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.elxEditable.remove(row)
        })
      } else {
        this.$refs.elxEditable.remove(row)
      }
    },
    saveRowEvent (row) {
      this.$refs.elxEditable.validateRow(row, valid => {
        if (valid) {
          Message({ message: '保存', type: 'success' })
          this.$refs.elxEditable.clearActive()
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
.scroll-table4-oper {
  margin-bottom: 18px;
}
.scroll-table4.elx-editable .elx-editable-row.new-insert,
.scroll-table4.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>

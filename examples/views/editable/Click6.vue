<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">自定义设置动态列</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent(0)">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="click-table6"
      stripe border
      size="medium"
      height="540"
      style="width: 100%">
      <el-editable-column type="index" width="55">
        <template slot="header">
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </el-editable-column>
      <template v-for="(item, index) in columnConfigs">
        <el-editable-column v-if="item.customShow" :key="index" v-bind="item"></el-editable-column>
      </template>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-popover placement="top" width="160" v-model="scope.row.flag3">
            <p>确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="scope.row.flag3 = false">取消</el-button>
              <el-button type="primary" size="mini" @click="removeEvent(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" size="mini" type="danger">删除</el-button>
          </el-popover>
        </template>
      </el-editable-column>
    </el-editable>

    <el-pagination
      class="my-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageVO.currentPage"
      :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
      :page-size="pageVO.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageVO.totalResult">
    </el-pagination>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="540px" append-to-body @open="openCustomEvent">
      <el-transfer
        filterable
        v-model="selectColumns"
        :data="columnConfigs"
        :titles="['隐藏列', '显示列']"
        :props="{key: 'prop', label: 'label'}"
        :filter-method="filterColumnMethod"
        filter-placeholder="请输入列"></el-transfer>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetCustomEvent">重 置</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCustomEvent">保 存</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import columnsData from '@/common/json/editable/columns.json'

export default {
  data () {
    return {
      loading: false,
      dialogVisible: false,
      columnConfigs: [],
      selectColumns: [],
      sexList: [],
      regionList: [],
      pageVO: {
        currentPage: 1,
        pageSize: 100,
        totalResult: 0
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      let sexPromise = this.getSexJSON()
      let regionPromise = this.getRegionJSON()
      this.loading = true
      Promise.all([
        this.loadList(),
        this.getColumnConfigs().then(data => {
          this.columnConfigs = data.map(column => {
            let defaultShow = ['name', 'age', 'birthdate'].includes(column.prop)
            column.customDefault = defaultShow
            column.customShow = defaultShow
            switch (column.prop) {
              case 'sex':
                column.editRender.options = []
                sexPromise.then(rest => {
                  column.editRender.options = rest
                })
                break
              case 'region':
                column.editRender.attrs = { options: [] }
                regionPromise.then(rest => {
                  column.editRender.attrs.options = rest
                })
                break
              case 'birthdate':
                column.editRender.attrs = {
                  type: 'date',
                  format: 'yyyy-MM-dd'
                }
                break
              case 'rate':
                column.editRender.type = 'visible'
                break
            }
            return column
          })
        })
      ]).then(datas => {
        this.loading = false
      })
    },
    findList () {
      this.loading = true
      return this.loadList().then(data => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    handleSizeChange (pageSize) {
      this.pageVO.pageSize = pageSize
      this.findList()
    },
    handleCurrentChange (currentPage) {
      this.pageVO.currentPage = currentPage
      this.findList()
    },
    loadList () {
      this.loading = true
      return this.getDataJSON().then(({ page, result }) => {
        this.pageVO.totalResult = page.total
        this.$refs.editable.reload(result)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    insertEvent (index) {
      let row = this.$refs.editable.insertAt({ rate: 2 }, index)
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
    },
    removeEvent (row) {
      row.flag3 = false
      this.$refs.editable.remove(row)
    },
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
    },
    filterColumnMethod (query, item) {
      return item.label.indexOf(query) > -1
    },
    openCustomEvent () {
      this.selectColumns = this.columnConfigs.filter(column => column.customShow).map(column => column.prop)
    },
    resetCustomEvent () {
      this.selectColumns = this.columnConfigs.filter(column => column.customDefault).map(column => column.prop)
    },
    saveCustomEvent () {
      this.dialogVisible = false
      this.columnConfigs.forEach(column => {
        column.customShow = this.selectColumns.includes(column.prop)
      })
    },
    getInsertEvent () {
      let rest = this.$refs.editable.getInsertRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取新增数据(${rest.length}条)` }).catch(e => e)
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` }).catch(e => e)
    },
    getRemoveEvent () {
      let rest = this.$refs.editable.getRemoveRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已删除数据(${rest.length}条)` }).catch(e => e)
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    postJSON (data) {
      // 提交请求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(
          [
            {
              label: '男',
              spell: 'nan',
              value: '1',
              val: 'x'
            },
            {
              label: '女',
              spell: 'nv',
              value: '0',
              val: 'o'
            }
          ]
        ), 300)
      })
    },
    getColumnConfigs () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(columnsData), 100)
      })
    },
    getDataJSON () {
      // 模拟分页数据
      return new Promise(resolve => {
        let list = []
        Array.from(new Array(100)).map(item => {
          if (list.length < this.pageVO.pageSize) {
            list = list.concat(listData)
          }
        })
        list = XEUtils.shuffle(XEUtils.clone(list, true))
        list.length = this.pageVO.pageSize
        setTimeout(() => resolve({
          page: {
            total: 1000
          },
          result: list
        }), 350)
      })
    },
    getRegionJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(regionData), 200)
      })
    }
  }
}
</script>

<style scoped>
.my-pagination {
  margin: 15px 20px 0 0;
  text-align: right;
}
</style>

<style>
.custom-wrapper {
  height: 200px;
  overflow: auto;
  list-style: decimal;
}
</style>

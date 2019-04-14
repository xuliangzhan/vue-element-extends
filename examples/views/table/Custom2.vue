<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">动态显示、隐藏列</p>
    <p style="color: red;font-size: 12px;">通过配置 custom-columns 参数初始化列，设置 visible 可以设置显示隐藏</p>

    <el-form ref="tableform" class="click-table6-form" size="mini" :inline="true" :model="formData">
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

    <elx-table
      border
      height="466"
      :data.sync="list"
      :custom-columns.sync="customColumns"
      style="width: 100%">
      <elx-table-column type="selection" width="55"></elx-table-column>
      <elx-table-column type="index" width="55">
        <template v-slot:header>
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </elx-table-column>
      <elx-table-column prop="name" label="名字"></elx-table-column>
      <elx-table-column prop="nickname" label="昵称"></elx-table-column>
      <elx-table-column prop="age" label="年龄"></elx-table-column>
      <elx-table-column prop="role" label="角色"></elx-table-column>
      <elx-table-column prop="date" label="日期" :formatter="formatterDate"></elx-table-column>
      <elx-table-column prop="rate" label="评分"></elx-table-column>
      <elx-table-column prop="attr1" label="属性1"></elx-table-column>
      <elx-table-column prop="attr2" label="属性2"></elx-table-column>
      <elx-table-column prop="attr3" label="属性3"></elx-table-column>
      <elx-table-column prop="attr4" label="属性4"></elx-table-column>
      <elx-table-column prop="attr5" label="属性5"></elx-table-column>
    </elx-table>

    <el-pagination
      class="click-table6-pagination"
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
        v-model="selectColumns"
        :data="allCustomColumnList"
        :titles="['隐藏列', '显示列']"
        :props="{key: 'prop', label: 'label'}"></el-transfer>
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
import XEAjax from 'xe-ajax'
import { Message } from 'element-ui'

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
      },
      dialogVisible: false,
      customColumns: [],
      selectColumns: []
    }
  },
  computed: {
    allCustomColumnList () {
      return this.customColumns.filter(item => item.prop)
    }
  },
  created () {
    this.loading = true
    Promise.all([
      this.findConfColumnsList(),
      this.findList()
    ]).catch(e => e).then(() => {
      this.loading = false
    })
  },
  methods: {
    findList () {
      this.loading = true
      return XEAjax.doGet(`/api/user/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`, this.formData).then(response => {
        let { page, result } = response.data
        this.list = result
        this.pageVO.totalResult = page.totalResult
        this.loading = false
        return result
      }).catch(e => {
        this.loading = false
      })
    },
    findConfColumnsList () {
      return XEAjax.doGet('/api/conf/columns/list').then(({ data }) => {
        this.customColumns = data
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
    openCustomEvent () {
      this.selectColumns = this.allCustomColumnList.filter(item => item.visible).map(column => column.prop)
    },
    resetCustomEvent () {
      this.selectColumns = this.allCustomColumnList.map(column => column.prop)
    },
    saveCustomEvent () {
      if (!this.selectColumns.length) {
        return Message({
          type: 'error',
          message: '请至少选择一列！'
        })
      }
      this.dialogVisible = false
      this.allCustomColumnList.forEach(column => {
        column.visible = this.selectColumns.includes(column.prop)
      })
    }
  }
}
</script>

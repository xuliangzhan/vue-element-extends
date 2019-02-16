<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">自定义行样式</p>
    <p style="color: red;font-size: 12px;">使用分页组件</p>

    <p>
      <el-button type="success" size="mini" @click="$refs.editable.insert({name: '默认名字2'})">新增一行</el-button>
      <el-button type="success" size="mini" @click="$refs.editable.insertAt({name: '默认名字2'}, -1)">在最后新增一行</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
    </p>

    <el-editable ref="editable" height="540" size="small" border :row-class-name="tableRowClassName" :editConfig="{trigger: 'click', showStatus: false}" style="width: 100%">
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字（只读）" min-width="140" show-overflow-tooltip></el-editable-column>
      <el-editable-column prop="sex" label="性别" width="100" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" width="140" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" min-width="140" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" width="220" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" width="220" :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="date2" label="多个日期" width="220" :editRender="{name: 'ElDatePicker', attrs: {type: 'dates'}}"></el-editable-column>
      <el-editable-column prop="date3" label="选择周" width="150" :editRender="{name: 'ElDatePicker', attrs: {type: 'week', format: 'yyyy 第 WW 周'}}"></el-editable-column>
      <el-editable-column prop="date4" label="选择月" width="150" :editRender="{name: 'ElDatePicker', attrs: {type: 'month'}}"></el-editable-column>
      <el-editable-column prop="date5" label="选择年" width="150" :editRender="{name: 'ElDatePicker', attrs: {type: 'year'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" width="100" :editRender="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="order" label="自定义渲染" width="120" :editRender="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-autocomplete v-model="scope.row.order" :fetch-suggestions="querySearchAsync" placeholder="选中订单" @select="$refs.editable.updateStatus(scope)"></el-autocomplete>
        </template>
        <template slot-scope="scope">
          <span>自定义：{{ scope.row.order }}</span>
        </template>
      </el-editable-column>
      <el-editable-column prop="remark" label="备注（只读）" min-width="140"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>

    <el-pagination
      class="my-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageVO.currentPage"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pageVO.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageVO.totalResult">
    </el-pagination>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      orderDataList: [
        {value: '136'},
        {value: '1362'},
        {value: '13886'}
      ],
      pageVO: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.findList()
      this.getSexJSON().then(data => {
        this.sexList = data
      })
      this.getRegionJSON().then(data => {
        this.regionList = data
      })
    },
    findList () {
      this.loading = true
      this.getDataJSON().then(({ page, result }) => {
        this.pageVO.totalResult = page.total
        this.$refs.editable.reload(result)
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
    tableRowClassName ({row, rowIndex}) {
      if (rowIndex === 2 || rowIndex === 3 || rowIndex === 4) {
        return 'warning-row'
      } else if (rowIndex === 6 || rowIndex === 7) {
        return 'success-row'
      }
      return ''
    },
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
    },
    removeEvent (row) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(row)
        this.findList()
      }).catch(e => e)
    },
    querySearchAsync (queryString, cb) {
      var orderDataList = this.orderDataList
      var results = queryString ? orderDataList.filter(this.createStateFilter(queryString)) : orderDataList
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 3000 * Math.random())
    },
    createStateFilter (queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    postJSON (data) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getDataJSON () {
      // 模拟分页数据
      return new Promise(resolve => {
        let list = XEUtils.clone(listData, true).concat(XEUtils.clone(listData, true)).concat(XEUtils.clone(listData, true)).concat(XEUtils.clone(listData, true))
        list.length = this.pageVO.pageSize
        setTimeout(() => resolve({
          page: {
            total: 100
          },
          result: XEUtils.shuffle(list)
        }), 350)
      })
    },
    getRegionJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
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
.el-table .warning-row {
  background: oldlace;
}
.el-table .success-row {
  background: #f0f9eb;
}
</style>

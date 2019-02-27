<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">第1行不允许勾选</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent()">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearFilter()">清空筛选条件</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSort()">清空排序条件</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getSelectedEvent">获取已选中数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      height="480"
      stripe
      border
      size="medium"
      @select="selectEvent"
      @current-change="currentChangeEvent"
      :edit-config="{trigger: 'click', mode: 'row', showIcon: true, showStatus: true, useDefaultValidTip: true, autoScrollIntoView: true}"
      style="width: 100%">
      <el-editable-column type="selection" width="55" :selectable="selectableEvent"></el-editable-column>
      <el-editable-column type="index" :index="indexMethod" width="55"></el-editable-column>
      <el-editable-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline>
            <el-form-item label="名称">
              <span>{{ props.row.name }}</span>
            </el-form-item>
            <el-form-item label="描述">
              <span>{{ props.row.desc }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-editable-column>
      <el-editable-column prop="sex" label="单选下拉" width="100" align="center" :edit-render="{name: 'ElSelect', options: sexList, optionProps: {value: 'value', label: 'spell'}}"></el-editable-column>
      <el-editable-column prop="attr6" label="多选下拉" width="200" :edit-render="{name: 'ElSelect', options: attrOptions, attrs: {multiple: true}}"></el-editable-column>
      <el-editable-column prop="attr7" label="多选下拉" width="200" :edit-render="{name: 'ElSelect', options: attrOptions, attrs: {multiple: true, collapseTags: true}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" min-width="180" :edit-render="{name: 'ElCascader', attrs: {clearable: true, options: regionList, separator: '-'}}"></el-editable-column>
      <el-editable-column prop="attr8" label="ElSelect 自定义显示内容" width="200" :edit-render="{name: 'ElSelect', options: attrOptions, attrs: {multiple: true, collapseTags: true}}">
        <template slot-scope="scope">{{ getAttr8Label(scope.row.attr8) }}</template>
      </el-editable-column>
      <el-editable-column prop="name" label="textarea 自定义渲染" min-width="200" show-overflow-tooltip :edit-render="{type: 'default', autofocus: true}">
        <template slot="edit" slot-scope="scope">
          <textarea class="editable-custom_input" v-model="scope.row.name" @input="$refs.editable.updateStatus(scope)"></textarea>
        </template>
      </el-editable-column>
      <el-editable-column prop="nickname" label="textarea 自定义渲染和内容" min-width="200" show-overflow-tooltip :edit-render="{type: 'default', autofocus: true}">
        <template slot="edit" slot-scope="scope">
          <textarea class="editable-custom_input" v-model="scope.row.nickname" @input="$refs.editable.updateStatus(scope)"></textarea>
        </template>
        <template slot-scope="scope">
          <span>自定义内容：{{ scope.row.nickname }}</span>
        </template>
      </el-editable-column>
      <el-editable-column prop="age" label="年龄" width="140" align="center" headerAlign="center" :filters="ageFilterList" :filter-method="filterHandler" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" min-width="180" :edit-render="{name: 'ElCascader', attrs: {options: regionList, separator: '-'}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="日期" width="220" sortable :sort-method="birthdateSortHandler" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd hh:mm'}}"></el-editable-column>
      <el-editable-column prop="attr3" label="固定时间点" width="140" sortable :edit-render="{name: 'ElTimeSelect', attrs: {pickerOptions: {start: '08:30', step: '00:15', end: '18:30'}, placeholder: '选择时间'}}"></el-editable-column>
      <el-editable-column prop="date3" label="任意时间点" width="160" sortable :edit-render="{name: 'ElTimePicker', attrs: {pickerOptions: {selectableRange: '06:30:00 - 22:30:00'}, placeholder: '任意时间点'}}"></el-editable-column>
      <el-editable-column prop="date3" label="任意时间点" width="160" sortable :edit-render="{name: 'ElTimePicker', attrs: {pickerOptions: {selectableRange: '06:30:00 - 22:30:00'}, placeholder: '任意时间点'}}"></el-editable-column>
      <el-editable-column prop="date2" label="选择日期范围1" width="250" sortable :edit-render="{name: 'ElDatePicker', attrs: {type: 'daterange', pickerOptions: pickerOptions2, rangeSeparator: '至', startPlaceholder: '开始日期', endPlaceholder: '结束日期'}}"></el-editable-column>
      <el-editable-column prop="date7" label="选择日期范围2" width="380" sortable :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetimerange', pickerOptions: pickerOptions2, rangeSeparator: '到', startPlaceholder: '开始日期', endPlaceholder: '结束日期', align: 'right'}}"></el-editable-column>
      <el-editable-column prop="order" label="el-autocomplete 自定义渲染" width="240" :formatter="formatterOrder" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-autocomplete v-model="scope.row.order" :fetch-suggestions="querySearchAsync" placeholder="选中订单" @select="$refs.editable.updateStatus(scope)"></el-autocomplete>
        </template>
      </el-editable-column>
      <el-editable-column prop="attr4" label="带输入建议" width="140" :edit-render="{name: 'ElAutocomplete', attrs: {fetchSuggestions: querySearchAsync}}"></el-editable-column>
      <el-editable-column prop="remark" label="备注" min-width="180" :edit-render="{name: 'ElInput', attrs: {type: 'textarea', rows: 2}}"></el-editable-column>
      <el-editable-column prop="slider" label="滑块" width="200" :edit-render="{name: 'ElSlider', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="flag" label="开关" width="140" :edit-render="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="flag2" label="单选" width="200" :edit-render="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <el-radio-group v-model="scope.row.flag2" size="mini" @change="$refs.editable.updateStatus(scope)">
            <el-radio label="N" border>值1</el-radio>
            <el-radio label="Y" border>值2</el-radio>
          </el-radio-group>
        </template>
      </el-editable-column>
      <el-editable-column prop="tag1" label="标签" width="200" :edit-render="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <el-tag type="success" v-for="(item, index) in scope.row.tag1" :key="index">{{ item }}</el-tag>
        </template>
      </el-editable-column>
      <el-editable-column prop="status" label="多选" width="160" :edit-render="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <el-checkbox-group v-model="scope.row.status" size="mini" @change="$refs.editable.updateStatus(scope)">
            <el-checkbox-button label="success">成功</el-checkbox-button>
            <el-checkbox-button label="error">失败</el-checkbox-button>
          </el-checkbox-group>
        </template>
      </el-editable-column>
      <el-editable-column label="操作" width="160" fixed="left">
        <template slot-scope="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="$refs.editable.setActiveRow(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox, Message } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    const date = new Date()
    return {
      loading: false,
      sexList: [],
      regionList: [],
      attrOptions: [
        {
          value: '111',
          label: '值1'
        },
        {
          value: '222',
          label: '值2'
        },
        {
          value: '333',
          label: '值3'
        }
      ],
      orderDataList: [
        {
          value: '136'
        },
        {
          value: '1362'
        },
        {
          value: '13886'
        }
      ],
      pickerOptions2: {
        shortcuts: [{
          text: '今天',
          onClick: picker => picker.$emit('pick', [date, date])
        }, {
          text: '最近一周',
          onClick: picker => picker.$emit('pick', [XEUtils.getWhatDay(date, -7), date])
        }, {
          text: '最近一个月',
          onClick: picker => picker.$emit('pick', [XEUtils.getWhatMonth(date, -1), date])
        }, {
          text: '最近三个月',
          onClick: picker => picker.$emit('pick', [XEUtils.getWhatMonth(date, -3), date])
        }]
      },
      ageFilterList: [
        {
          text: '26',
          value: 26
        },
        {
          text: '24',
          value: 24
        },
        {
          text: '22',
          value: 22
        }
      ]
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
      this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    getAttr8Label (value) {
      return value.map(value => {
        let selectItem = this.attrOptions.find(item => item.value === value)
        return selectItem ? selectItem.value : null
      }).join(' / ')
    },
    insertEvent (index) {
      let row = this.$refs.editable.insertAt({ name: '默认名字1', age: 26 }, index)
      this.$nextTick(() => this.$refs.editable.setActiveRow(row))
    },
    removeEvent (row) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(row)
      }).catch(e => e)
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.postJSON('url', { row }).then(data => {
            Message({ message: '保存成功', type: 'success' })
          })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
        } else {
          // 关闭取消编辑状态
          this.$refs.editable.clearActive()
        }
      })
    },
    indexMethod (index) {
      return index * 2
    },
    selectEvent (selection, row) {
      console.log(selection)
    },
    currentChangeEvent (currentRow, oldCurrentRow) {
      console.log(oldCurrentRow)
    },
    formatterOrder (row, column, cellValue, index) {
      return `订单号：${cellValue}`
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
          this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
            this.findList()
          })
        } else {
          console.log('error submit!!')
          return false
        }
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
    getSelectedEvent () {
      let rest = this.$refs.editable.getSelecteds()
      MessageBox({ message: JSON.stringify(rest), title: `获取已选中数据(${rest.length}条)` }).catch(e => e)
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    selectableEvent (row, index) {
      return index >= 1
    },
    birthdateSortHandler (a, b) {
      return a.birthdate > b.birthdate ? 1 : -1
    },
    filterHandler (value, row, column) {
      return row[column.property] === value
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
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getDataJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(listData, true)), 350)
      })
    },
    getRegionJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
      })
    }
  }
}
</script>

<style scoped>
.editable-custom_input {
  width: 95%;
}
</style>

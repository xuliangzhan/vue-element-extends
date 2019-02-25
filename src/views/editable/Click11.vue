<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验最少3个字符）</p>
    <p style="color: red;font-size: 12px;">第1行不允许勾选</p>
    <p style="color: red;font-size: 12px;">第3行的年龄不允许编辑</p>
    <p style="color: red;font-size: 12px;">自定义渲染：attr4字段，选择唯一下拉选项；attr5字段，限制唯一下拉选项</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent(0)">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearFilter()">清空筛选条件</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSort()">清空排序条件</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">校验&保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getSelectedEvent">获取已选中数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      stripe
      border
      height="480"
      size="medium"
      @select="selectEvent"
      @current-change="currentChangeEvent"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell', showIcon: true, showStatus: true, activeMethod}"
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
      <el-editable-column prop="sex" label="性别" width="100" align="center" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="name" label="名字（带校验的自定义渲染)" min-width="220" show-overflow-tooltip :edit-render="{type: 'default', autofocus: true}">
        <template slot="edit" slot-scope="scope">
          <textarea class="editable-custom_input" v-model="scope.row.name" @input="$refs.editable.updateStatus(scope)"></textarea>
        </template>
      </el-editable-column>
      <el-editable-column prop="age" label="年龄" width="140" align="center" headerAlign="center" :filters="ageFilterList" :filter-method="filterHandler" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" min-width="180" :edit-render="{name: 'ElCascader', attrs: {options: regionList, separator: '-'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" width="220" sortable :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="slider" label="滑块" width="200" :edit-render="{name: 'ElSlider', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="attr4" label="attr4 唯一下拉选项" width="200" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-select v-model="scope.row.attr4" @change="attr4ChangeEvent(scope)">
            <el-option v-for="(item, index) in attr4Options" :key="index" :value="item.value" :label="item.label" :disabled="item.disabled"></el-option>
          </el-select>
        </template>
        <template slot-scope="scope">{{ getSelectLabel(scope.row.attr4, 'value', 'label', attr4Options) }}</template>
      </el-editable-column>
      <el-editable-column  prop="attr5" label="attr5 限制唯一下拉" width="200" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-select v-model="scope.row.attr5" @change="attr5ChangeEvent(scope)">
            <el-option v-for="(item, index) in attr5Options" :key="index" :value="item.label" :label="item.label"></el-option>
          </el-select>
        </template>
      </el-editable-column>
      <el-editable-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      typeOptions: Array.from(new Array(5), (v, i) => {
        return {
          label: `类型${i}`,
          value: `type${i}`,
          disabled: false
        }
      }),
      attr4Options: [],
      attr5Options: [],
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
      ],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, message: '名称长度最小 3 个字符', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.attr4Options = XEUtils.clone(this.typeOptions)
      this.attr5Options = XEUtils.clone(this.typeOptions)
      this.getSexJSON().then(data => {
        this.sexList = data
      })
      this.getRegionJSON().then(data => {
        this.regionList = data
      })
    },
    activeMethod ({ row, column, rowIndex }) {
      if (rowIndex === 2 && ['age'].includes(column.property)) {
        return false
      }
      return true
    },
    insertEvent (index) {
      let row = this.$refs.editable.insertAt({ name: '默认名字2', age: 1, slider: 30 }, index)
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'sex'))
    },
    removeEvent (scope) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(scope.row)
        this.attr4ChangeEvent(scope)
        this.attr5ChangeEvent(scope)
      }).catch(e => e)
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
    attr4ChangeEvent (scope) {
      let list = this.$refs.editable.getRecords()
      this.attr4Options.forEach(item => {
        item.disabled = list.some(row => row.attr4 === item.value)
      })
      this.$refs.editable.updateStatus(scope)
    },
    getSelectLabel (value, valueProp, labelProp, list) {
      let item = list.find(item => item[valueProp] === value)
      return item ? item[labelProp] : null
    },
    attr5ChangeEvent (scope) {
      let list = this.$refs.editable.getRecords()
      this.attr5Options = this.typeOptions.filter(item => !list.some(row => row.attr5 === item.label))
      this.$refs.editable.updateStatus(scope)
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          alert('成功')
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

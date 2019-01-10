<template>
  <div v-loading="loading">
    <h1>基于 ElementUI 可编辑表格</h1>
    <el-button @click="$refs.editable.insert({name: '默认名字2'})">插入一行</el-button>
    <el-button @click="$refs.editable.insertAt({name: '默认名字2'}, -1)">在最后插入一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeRows([0, 2])">删除指定行[0, 2]</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="warning" @click="$refs.editable.revert()">还原更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空所有</el-button>
    <el-button type="primary" @click="submitEvent">保存</el-button>
    <el-editable ref="editable" height="340" stripe border @select="selectEvent" @current-change="currentChangeEvent">
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
      <el-editable-column prop="name" label="名字" min-width="180" show-overflow-tooltip></el-editable-column>
      <el-editable-column prop="sex" label="性别" width="100" align="center" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" width="140" align="center" headerAlign="center" :filters="ageFilterList" :filter-method="filterHandler" :editRender="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" min-width="180" :editRender="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="birthdate" label="出生日期" min-width="180" sortable :sort-method="birthdateSortHandler" :editRender="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date1" label="选择日期" min-width="180" sortable :editRender="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" width="100" :editRender="{name: 'ElSwitch'}"></el-editable-column>
      <el-editable-column prop="flag2" label="是否启用2" width="180" :editRender="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <el-radio-group v-model="scope.row.flag2" size="mini">
            <el-radio label="N" border>值1</el-radio>
            <el-radio label="Y" border>值2</el-radio>
          </el-radio-group>
        </template>
      </el-editable-column>
      <el-editable-column prop="status" label="状态" width="160" :editRender="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <el-checkbox-group v-model="scope.row.status" size="mini">
            <el-checkbox-button label="success">成功</el-checkbox-button>
            <el-checkbox-button label="error">失败</el-checkbox-button>
          </el-checkbox-group>
        </template>
      </el-editable-column>
      <el-editable-column prop="order" label="自定义渲染" width="140" :formatter="formatterOrder" :editRender="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-autocomplete v-model="scope.row.order" :fetch-suggestions="querySearchAsync" placeholder="选中订单"></el-autocomplete>
        </template>
      </el-editable-column>
      <el-editable-column prop="remark" label="备注" min-width="180" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作" width="100" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row, scope.$index)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui'

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
    removeEvent (row, index) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.removeRow(index)
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
    formatterOrder (row, column, cellValue, index) {
      return `订单号：${cellValue}`
    },
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
    },
    selectableEvent (row, index) {
      return index >= 1
    },
    birthdateSortHandler (a, b) {
      return -1
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
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              label: '男',
              value: '1'
            },
            {
              label: '女',
              value: '0'
            }
          ])
        }, 100)
      })
    },
    getDataJSON () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              name: 'test11111111111111111111111111111111111111111111111111111111',
              height: 176,
              age: 26,
              sex: '1',
              region: null,
              birthdate: new Date(1994, 0, 1),
              date1: new Date(2019, 0, 1, 20, 0, 30),
              remark: '备注1',
              status: ['error'],
              order: '136',
              flag: false,
              flag2: 'Y',
              desc: '描述1',
              noList: [
                {
                  no: '10',
                  content: ''
                },
                {
                  no: '11',
                  content: ''
                }
              ]
            },
            {
              name: 'test22',
              height: 166,
              age: 24,
              sex: '0',
              region: ['gds', 'szs', 'lhq'],
              birthdate: new Date(1992, 0, 1),
              date1: new Date(2019, 0, 1, 12, 10, 30),
              remark: '备注2',
              status: ['success', 'error'],
              order: '1362',
              flag: true,
              flag2: 'N',
              desc: '描述2',
              noList: [
                {
                  no: '20',
                  content: ''
                },
                {
                  no: '22',
                  content: ''
                }
              ]
            },
            {
              name: 'test333333333333333333333333333333333333333333333333333',
              height: 172,
              age: 22,
              sex: '1',
              region: ['bj', 'bjs', 'dcq'],
              birthdate: new Date(1990, 0, 1),
              date1: new Date(2019, 0, 1, 0, 30, 50),
              remark: null,
              status: ['success'],
              order: '13886',
              flag: false,
              flag2: 'N',
              desc: '描述3',
              noList: [
                {
                  no: '30',
                  content: ''
                },
                {
                  no: '31',
                  content: ''
                }
              ]
            }
          ])
        }, 350)
      })
    },
    getRegionJSON () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              value: 'bj',
              label: '北京',
              children: [
                {
                  value: 'bjs',
                  label: '北京市',
                  children: [
                    {
                      value: 'dcq',
                      label: '东城区'
                    }
                  ]
                }
              ]
            },
            {
              value: 'gds',
              label: '广东省',
              children: [
                {
                  value: 'szs',
                  label: '深圳市',
                  children: [
                    {
                      value: 'lhq',
                      label: '罗湖区'
                    }
                  ]
                },
                {
                  value: 'gzs',
                  label: '广州市',
                  children: [
                    {
                      value: 'thq',
                      label: '天河区'
                    }
                  ]
                }
              ]
            }
          ])
        }, 200)
      })
    }
  }
}
</script>

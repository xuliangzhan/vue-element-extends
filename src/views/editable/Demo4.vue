<template>
  <div v-loading="loading">
    <h1>Editable 可编辑表格</h1>
    <el-button @click="$refs.editable.insert({name: '默认名字2'})">插入一行</el-button>
    <el-button @click="$refs.editable.insertAt({name: '默认名字2'}, -1)">在最后插入一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeRows([0, 2])">删除指定行[0, 2]</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="warning" @click="$refs.editable.revert()">还原更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空所有</el-button>
    <el-button type="primary" @click="submitEvent">保存</el-button>
    <el-editable ref="editable" height="340" stripe border size="medium">
      <el-editable-column v-for="(item, index) in columnConfigs" :key="index" v-bind="item"></el-editable-column>
      <el-editable-column label="操作" width="160">
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
      columnList: [],
      sexList: [],
      regionList: []
    }
  },
  computed: {
    columnConfigs () {
      let columns = []
      this.columnList.forEach(item => {
        switch (item.prop) {
          case 'sex':
            columns.push({
              prop: item.prop,
              label: item.label,
              editRender: {
                name: 'ElSelect',
                options: this.sexList
              }
            })
            break
          case 'region':
            columns.push({
              prop: item.prop,
              label: item.label,
              editRender: {
                name: 'ElCascader',
                attrs: {
                  options: this.regionList
                }
              }
            })
            break
          case 'birthdate':
            columns.push({
              prop: item.prop,
              label: item.label,
              editRender: {
                name: 'ElDatePicker',
                attrs: {
                  type: 'date',
                  format: 'yyyy-MM-dd'
                }
              }
            })
            break
          default:
            columns.push({
              prop: item.prop,
              label: item.label,
              showOverflowTooltip: true,
              editRender: {
                name: 'ElInput'
              }
            })
            break
        }
      })
      return columns
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.findList()
      this.getColumnConfigs().then(data => {
        this.columnList = data
      })
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
    submitEvent () {
      let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
      this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
        this.findList()
      })
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
    getColumnConfigs () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              prop: 'name',
              label: '名称'
            },
            {
              prop: 'sex',
              label: '性别'
            },
            {
              prop: 'region',
              label: '地区'
            },
            {
              prop: 'birthdate',
              label: '出生日期'
            }
          ])
        })
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

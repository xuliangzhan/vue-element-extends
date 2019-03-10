<template>
  <div>
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验3-10个字符</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent">新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSelection()">清空用户的选择</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.toggleAllSelection()">选中所有</el-button>
    </p>

    <el-editable
      ref="editable"
      class="manual-table4"
      size="mini"
      border
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell'}"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="select1" label="ElSelect" :edit-render="{name: 'ElSelect', options: selectList, attrs: {clearable: true}}"></el-editable-column>
      <el-editable-column prop="select2" label="iSelect" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <Select v-model="scope.row.select2" clearable>
            <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </template>
        <template slot-scope="scope">{{ getSelectLabel(scope.row.select2) }}</template>
      </el-editable-column>
      <el-editable-column prop="cascader1" label="ElCascader" :edit-render="{name: 'ElCascader', attrs: {options: cascaderList, clearable: true}}"></el-editable-column>
      <el-editable-column prop="cascader2" label="iCascader" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <Cascader :data="cascaderList" v-model="scope.row.cascader2"></Cascader>
        </template>
        <template slot-scope="scope">{{ getCascaderLabel(scope.row.cascader2) }}</template>
      </el-editable-column>
      <el-editable-column prop="date1" label="ElDatePicker" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="date2" label="iDatePicker" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <DatePicker v-model="scope.row.date2" type="date" show-week-numbers></DatePicker>
        </template>
        <template slot-scope="scope">{{ getDateLabel(scope.row.date2) }}</template>
      </el-editable-column>
      <el-editable-column prop="flag1" label="ElSwitch" :edit-render="{name: 'ElSwitch', type: 'visible'}"></el-editable-column>
      <el-editable-column prop="flag2" label="iSwitch" :edit-render="{type: 'visible'}">
        <template slot="edit" slot-scope="scope">
          <i-switch v-model="scope.row.flag2">
            <span slot="open">开</span>
            <span slot="close">关</span>
          </i-switch>
        </template>
      </el-editable-column>
      <el-editable-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          <el-button size="mini" type="warning" @click="revertEvent(scope.row)">还原</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      cascaderList: [
        {
          label: '广东',
          value: '1000',
          children: [
            {
              label: '深圳',
              value: '1010',
              children: [
                {
                  label: '南山',
                  value: '1011'
                },
                {
                  label: '龙岗',
                  value: '1012'
                }
              ]
            }
          ]
        },
        {
          label: '北京',
          value: '2000',
          children: [
            {
              label: '东城',
              value: '2010'
            },
            {
              label: '西城',
              value: '2020'
            }
          ]
        },
        {
          label: '上海',
          value: '3000',
          children: [
            {
              label: '黄浦',
              value: '3010'
            },
            {
              label: '金山',
              value: '3020'
            }
          ]
        }
      ],
      selectList: [
        {
          label: '男',
          value: '1'
        },
        {
          label: '女',
          value: '0'
        }
      ],
      list: [
        {
          select1: '1',
          select2: '0',
          cascader1: ['1000', '1010', '1012'],
          cascader2: ['2000', '2010'],
          date1: new Date(),
          date2: new Date(),
          flag1: true,
          flag2: false
        }
      ],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 10, message: '名称长度 3-10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getSelectLabel (cellValue) {
      let item = XEUtils.find(this.selectList, item => item.value === cellValue)
      return item ? item.label : null
    },
    matchCascaderData (values, index, list, labels) {
      let val = values[index]
      if (list && values.length > index) {
        list.forEach(item => {
          if (item.value === val) {
            labels.push(item.label)
            this.matchCascaderData(values, ++index, item.children, labels)
          }
        })
      }
    },
    getCascaderLabel (cellValue) {
      let labels = []
      this.matchCascaderData(cellValue || [], 0, this.cascaderList, labels)
      return labels.join(' / ')
    },
    getDateLabel (cellValue) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd')
    },
    insertEvent () {
      let row = this.$refs.editable.insert({
        cascader1: [],
        cascader2: [],
        flag1: false,
        flag2: false
      })
      this.$nextTick(() => this.$refs.editable.setActiveRow(row))
    },
    isRowOperate (row) {
      let activeInfo = this.$refs.editable.getActiveRow()
      return activeInfo ? activeInfo.row === row : true
    },
    removeEvent (row) {
      if (this.isRowOperate(row)) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.editable.remove(row)
        }).catch(e => e)
      }
    },
    revertEvent (row) {
      if (this.isRowOperate(row)) {
        if (this.$refs.editable.hasRowChange(row)) {
          MessageBox.confirm('确定还原该行数据?', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$refs.editable.revert(row)
            Message({ message: '数据还原成功！', type: 'success' })
          }).catch(e => e)
        } else {
          Message({ message: '数据未改动！', type: 'info' })
        }
      }
    },
    updateRowEvent (row) {
      this.$refs.editable.reloadRow(row)
      Message({ message: '保存成功', type: 'success' })
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
          this.$refs.editable.reloadRow(row)
          Message({ message: '保存成功', type: 'success' })
        } else {
          console.log('error row submit!!')
        }
      })
    }
  }
}
</script>

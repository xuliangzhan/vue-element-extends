<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">如果存在校验不通过的列则不允许新增</p>
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验3-10个字符）nickname字段（校验5-20个字符）sex字段（校验必填，校验手机号码）age字段（校验必填，自定义校验，18-28之间）phone字段（校验必填，校验手机号码）rate字段（校验必填，校验最少选中2颗星）url（校验必填，校验URL路径）attr1（校验数字）attr2（校验整数）attr3（校验小数）</p>
    <p style="color: red;font-size: 12px;">上下左右方向键切换列、Tab 键切换列、选中后可直接输入值覆盖旧值</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="warning" size="mini" @click="validEvent">校验</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">校验&保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getPendingRemoveEvent">获取已标记删除数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent()">导出显示数据</el-button>
      <el-button type="success" size="mini" @click="customExportCsvEvent({original: true})">导出实际数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="dblclick-table7"
      stripe
      border
      height="480"
      size="medium"
      :row-class-name="tableRowClassName"
      @valid-error="validErrorEvent"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', showIcon: false, showStatus: false, isTabKey: true, isArrowKey: true, activeMethod}"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55">
        <template slot="header">
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </el-editable-column>
      <template v-for="(item, index) in columnConfigs">
        <template v-if="item.customShow">
          <el-editable-column :key="index" v-bind="item"></el-editable-column>
        </template>
      </template>
    </el-editable>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="540px" append-to-body @open="openCustomEvent">
      <el-transfer
        v-model="selectColumns"
        :data="columnConfigs"
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
import { Message, MessageBox } from 'element-ui'
import regionData from '@/common/json/editable/region.json'
import columnsData from '@/common/json/editable/columns.json'

export default {
  data () {
    const checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('年龄不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (parseInt(value) < 18 || parseInt(value) > 28) {
            callback(new Error('年龄必须在18-28之间'))
          } else {
            callback()
          }
        }
      }, 50)
    }
    const checkRate = (rule, value, callback) => {
      if (parseInt(value || 0) < 2) {
        callback(new Error('最小选择2颗星'))
      } else {
        callback()
      }
    }
    const checkAttr2 = (rule, value, callback) => {
      if (!value || XEUtils.isInteger(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入整数'))
      }
    }
    const checkAttr3 = (rule, value, callback) => {
      if (!value || XEUtils.isFloat(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入小数'))
      }
    }
    return {
      loading: false,
      dialogVisible: false,
      pendingRemoveList: [],
      columnConfigs: [],
      selectColumns: [],
      sexList: [],
      regionList: [],
      validRules: {
        name: [
          { required: true, message: '名称必须填写', trigger: 'blur' },
          { min: 3, max: 10, message: '名称长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        nickname: [
          { min: 5, max: 20, message: '名称长度在 5 到 20 个字符', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '年龄必须填写', trigger: 'change' },
          { validator: checkAge, trigger: 'change' }
        ],
        phone: [
          { required: true, message: '手机号码必须填写', trigger: 'blur' },
          { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        birthdate: [
          { required: true, message: '请选择日期', trigger: 'blur' }
        ],
        rate: [
          { required: true, message: '请选择评分', trigger: 'blur' },
          { validator: checkRate, trigger: 'blur' }
        ],
        url: [
          { required: true, message: 'URL必须填写', trigger: 'blur' },
          { pattern: /^((ht|f)tps?):\/\/([\w-]+(\.[\w-]+)*\/)*[\w-]+(\.[\w-]+)*\/?(\?([\w\-.,@?^=%&:/~+#]*)+)?/, message: '格式：http(s)://xxx.com', trigger: 'blur' }
        ],
        attr1: [
          { type: 'number', message: '请输入数字', trigger: 'blur' }
        ],
        attr2: [
          { validator: checkAttr2, trigger: 'blur' }
        ],
        attr3: [
          { validator: checkAttr3, trigger: 'blur' }
        ],
        attr4: [
          { required: true, message: 'attr4必须填写', trigger: 'blur' }
        ]
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
            let defaultShow = ['name', 'nickname', 'sex', 'region', 'phone', 'rate', 'attr1', 'attr2', 'attr3', 'attr4', 'attr5'].includes(column.prop)
            let editRender = column.editRender
            column.customDefault = defaultShow
            column.customShow = defaultShow
            column.minWidth = '150'
            editRender.attrs = {
              placeholder: `请输入${column.label}`
            }
            switch (column.prop) {
              case 'sex':
                editRender.options = []
                sexPromise.then(rest => {
                  editRender.options = rest
                })
                break
              case 'region':
                editRender.attrs = { options: [] }
                regionPromise.then(rest => {
                  editRender.attrs.options = rest
                })
                break
              case 'birthdate':
                editRender.attrs = {
                  type: 'date',
                  format: 'yyyy-MM-dd'
                }
                break
              case 'rate':
                editRender.type = 'visible'
                break
            }
            return column
          })
        })
      ]).then(datas => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    findList () {
      this.loading = true
      this.pendingRemoveList = []
      return this.loadList().then(data => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    loadList () {
      return this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
      })
    },
    validErrorEvent (rule, row, column) {
      Message({ message: rule.message, type: 'error' })
    },
    customExportCsvEvent (opts) {
      this.$refs.editable.exportCsv(opts)
    },
    insertEvent () {
      if (!this.$refs.editable.checkValid().error) {
        let row = this.$refs.editable.insert()
        this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
      }
    },
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    activeMethod ({ row, column, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return false
      }
      return true
    },
    pendingRemoveEvent () {
      let selection = this.$refs.editable.getSelecteds()
      if (selection.length) {
        let plus = []
        let minus = []
        selection.forEach(data => {
          if (this.pendingRemoveList.some(item => data === item)) {
            minus.push(data)
          } else {
            plus.push(data)
          }
        })
        if (minus.length) {
          this.pendingRemoveList = this.pendingRemoveList.filter(item => minus.some(data => data !== item)).concat(plus)
        } else if (plus) {
          this.pendingRemoveList = this.pendingRemoveList.concat(plus)
        }
        this.$refs.editable.clearSelection()
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    validEvent () {
      this.$refs.editable.validate().then(valid => {
        alert('通过')
      }).catch(valid => {
        console.log('error submit!!')
      })
    },
    submitEvent () {
      this.$refs.editable.validate().then(valid => {
        let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
        this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
          this.findList()
        })
      }).catch(valid => {
        console.log('error submit!!')
      })
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
    getPendingRemoveEvent () {
      let rest = this.pendingRemoveList
      MessageBox({ message: JSON.stringify(rest), title: `获取已标记删除数据(${rest.length}条)` }).catch(e => e)
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
        setTimeout(() => resolve(columnsData), 600)
      })
    },
    getDataJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve([{
          attr1: null,
          attr2: null,
          attr3: null,
          attr4: '必填字段4',
          attr5: '必填字段5',
          name: '名称1',
          nickname: '隔壁老王1',
          phone: 13666666666,
          rate: 3,
          region: [19, 199, 1773],
          sex: '1'
        }]), 350)
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

<style>
.dblclick-table7 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.dblclick-table7 .el-table__body .el-table__row>td.editable-col_checked {
  box-shadow: inset 0 0 6px #409EFF;
}
.dblclick-table7 .error-msg {
  display: block;
  color: #fff;
  background-color: red;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1;
  padding: 10px;
  position: absolute;
  top: calc(100% + 10px);
  left: 10px;
  z-index: 9;
}
.dblclick-table7 .error-msg:before {
  content: "";
  position: absolute;
  border: 4px solid;
  top: -8px;
  left: 20%;
  border-color: transparent transparent red transparent;
}
.custom-wrapper {
  height: 200px;
  overflow: auto;
  list-style: decimal;
}
</style>

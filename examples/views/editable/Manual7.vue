<template>
  <div>
    <p style="color: red;font-size: 12px;">可配置的动态列</p>

    <div v-loading="columnLoading">
      <div class="manual-table7-oper">
        <el-button type="success" size="mini" @click="insertEvent('elxEditable1')">新增</el-button>
        <el-button type="danger" size="mini" @click="deleteSelectedEvent('elxEditable1')">删除选中</el-button>
      </div>

      <elx-editable
        ref="elxEditable1"
        class="manual-table7"
        size="small"
        border
        height="260"
        :data.sync="columnList"
        :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod1}"
        style="width: 100%">
        <elx-editable-column type="selection" width="55"></elx-editable-column>
        <elx-editable-column prop="seq" label="序号" width="140" align="center" :edit-render="{name: 'ElInputNumber'}"></elx-editable-column>
        <elx-editable-column prop="key" label="字段名" width="120" :edit-render="{name: 'ElSelect', options: keyList, events: {change: uniqueKey}}"></elx-editable-column>
        <elx-editable-column prop="name" label="字段描述" width="120" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="readonly" label="是否只读" width="100" :formatter="formatterRequired" :edit-render="{name: 'ElSwitch'}"></elx-editable-column>
        <elx-editable-column prop="required" label="是否必填" width="100" :formatter="formatterRequired" :edit-render="{name: 'ElSwitch'}"></elx-editable-column>
        <elx-editable-column prop="validator" label="校验规则" width="100" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="validMsg" label="校验提示" width="100" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="visible" label="默认显示" width="100" :formatter="formatterRequired" :edit-render="{name: 'ElSwitch'}"></elx-editable-column>
        <elx-editable-column prop="type" label="渲染类型" width="100" :edit-render="{name: 'ElSelect', options: renderTypeList}"></elx-editable-column>
        <elx-editable-column prop="width" label="设置宽度" width="100" :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="align" label="对齐方式" width="100" :edit-render="{name: 'ElSelect', options: alignList, props: {clearable: true}}"></elx-editable-column>
        <elx-editable-column prop="describe" label="备注" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="updateTime" label="更新时间" width="150" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column prop="createTime" label="创建时间" width="150" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column label="操作" width="160">
          <template v-slot="scope">
            <template v-if="$refs.elxEditable1.hasActiveRow(scope.row)">
              <el-button size="mini" type="success" @click="saveRowEvent('elxEditable1', scope.row)">保存</el-button>
              <el-button size="mini" type="warning" @click="cancelRowEvent('elxEditable1', scope.row)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="openActiveRowEvent('elxEditable1', scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="removeEvent('elxEditable1', scope.row)">删除</el-button>
            </template>
          </template>
        </elx-editable-column>
      </elx-editable>
    </div>

    <div v-loading="userLoading">
      <div class="manual-table7-oper">
        <el-button type="success" size="mini" @click="insertEvent('elxEditable2')">新增</el-button>
        <el-button type="danger" size="mini" @click="deleteSelectedEvent('elxEditable2')">删除选中</el-button>
        <el-button type="primary" size="mini" @click="reloadConf">刷新配置</el-button>
      </div>

      <elx-editable
        ref="elxEditable2"
        size="small"
        border
        height="260"
        :data.sync="userList"
        :edit-rules="validRules"
        :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod2}"
        style="width: 100%">
        <elx-editable-column type="selection" width="55"></elx-editable-column>
        <elx-editable-column type="index" width="55">
          <template v-slot:header>
            <i class="el-icon-setting" @click="dialogVisible = true"></i>
          </template>
        </elx-editable-column>
        <template v-for="item in columnConfigs">
          <template v-if="item._show">
            <elx-editable-column v-bind="item" :key="item.prop"></elx-editable-column>
          </template>
        </template>
        <elx-editable-column label="操作" width="150">
          <template v-slot="scope">
            <template v-if="$refs.elxEditable2.hasActiveRow(scope.row)">
              <el-button size="mini" type="success" @click="saveRowEvent('elxEditable2', scope.row)">保存</el-button>
              <el-button size="mini" type="warning" @click="cancelRowEvent('elxEditable2', scope.row)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="openActiveRowEvent('elxEditable2', scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="removeEvent('elxEditable2', scope.row)">删除</el-button>
            </template>
          </template>
        </elx-editable-column>
      </elx-editable>

      <el-pagination
        class="manual-table7-pagination"
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange2"
        :current-page="userPageVO.currentPage"
        :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
        :page-size="userPageVO.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userPageVO.totalResult">
      </el-pagination>

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
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      keyList: ['name', 'age', 'date', 'role', 'phone', 'email', 'attr1', 'attr2', 'attr3', 'attr4', 'attr5'].map(name => {
        return {
          value: name,
          label: name,
          props: {
            disabled: false
          }
        }
      }),
      alignList: [
        {
          value: 'left',
          label: '居左'
        },
        {
          value: 'center',
          label: '居中'
        },
        {
          value: 'right',
          label: '居右'
        }
      ],
      renderTypeList: [
        {
          value: 'ElInput',
          label: '文本框'
        },
        {
          value: 'ElInputNumber',
          label: '数值'
        },
        {
          value: 'ElDatePicker',
          label: '日期'
        }
      ],
      columnList: [],
      columnLoading: false,
      userList: [],
      userLoading: false,
      userPageVO: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      validRules: null,
      isClearActiveFlag: true,
      dialogVisible: false,
      selectColumns: [],
      columnConfigs: []
    }
  },
  created () {
    this.findColumnList()
    this.findConfColumnsList()
    this.findUserList()
  },
  methods: {
    findColumnList () {
      this.columnLoading = true
      XEAjax.doGet('/api/column/list').then(({ data }) => {
        this.columnList = data
        this.columnLoading = false
        this.uniqueKey()
      })
    },
    findUserList () {
      this.userLoading = true
      XEAjax.doGet(`/api/user/page/list/${this.userPageVO.pageSize}/${this.userPageVO.currentPage}`).then(response => {
        let { page, result } = response.data
        this.userList = result
        this.userPageVO.totalResult = page.totalResult
        this.userLoading = false
      })
    },
    findConfColumnsList () {
      return XEAjax.doGet('/api/column/list', { sort: 'seq', order: 'asc' }).then(({ data }) => {
        let validRules = {}
        let columnConfigs = []
        data.forEach(column => {
          let item = {
            prop: column.key,
            label: column.name,
            width: column.width,
            align: column.align,
            _default: column.visible,
            _show: column.visible
          }
          // 动态生成校验
          if (column.required) {
            validRules[column.key] = [
              { required: true, message: `请填写${column.name}`, trigger: 'change' }
            ]
          }
          if (column.validator) {
            if (validRules[column.key]) {
              validRules[column.key].push({ pattern: new RegExp(column.validator), message: column.validMsg || `${column.name}校验不通过，请重新填写`, trigger: 'change' })
            } else {
              validRules[column.key] = [
                { pattern: new RegExp(column.validator), message: column.validMsg || `${column.name}校验不通过，请重新填写`, trigger: 'change' }
              ]
            }
          }
          // 动态处理渲染
          if (!column.readonly) {
            item.editRender = {
              name: column.type
            }
          }
          columnConfigs.push(item)
        })
        this.validRules = validRules
        this.columnConfigs = columnConfigs
      })
    },
    reloadConf () {
      this.findConfColumnsList()
    },
    handleSizeChange2 (pageSize) {
      this.userPageVO.pageSize = pageSize
      this.findUserList()
    },
    handleCurrentChange2 (currentPage) {
      this.userPageVO.currentPage = currentPage
      this.findUserList()
    },
    formatterRequired (row, column, cellValue, index) {
      return cellValue ? '是' : '否'
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    formatColumnSize (row, column, cellValue, index) {
      if (XEUtils.isNumber(cellValue)) {
        let units = ['B', 'KB', 'MB', 'GB', 'TB']
        let unit = ''
        let size = XEUtils.toNumber(cellValue)
        for (let index = 0; index < units.length; index++) {
          unit = units[index]
          if (size >= 1024) {
            size = XEUtils.toFixedNumber(size / 1024, 2)
          } else {
            break
          }
        }
        return `${size} ${unit}`
      }
      return ''
    },
    uniqueKey (scope, value) {
      let list = this.columnList
      this.keyList.forEach(item => {
        item.props.disabled = list.some(row => row.key === item.value)
      })
      if (scope) {
        this.$refs.elxEditable1.updateStatus(scope)
      }
    },
    insertEvent (name) {
      let activeInfo = this.$refs[name].getActiveRow()
      let { insertRecords } = this.$refs[name].getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        switch (name) {
          case 'elxEditable1':
            let nextItem = this.keyList.find(item => !item.props.disabled)
            this.$refs[name].insert({
              key: nextItem.value,
              name: nextItem.value,
              readonly: false,
              required: false,
              visible: true,
              type: 'ElInput'
            }).then(({ row }) => {
              this.$refs[name].setActiveRow(row)
            })
            break
          case 'elxEditable2':
            this.$refs[name].insert().then(({ row }) => {
              this.$refs[name].setActiveRow(row)
            })
            break
        }
      } else {
        if (activeInfo) {
          this.checkSaveData(name, activeInfo.row)
        } else if (insertRecords) {
          this.checkSaveData(name, insertRecords[0])
        }
      }
    },
    clearActiveMethod1 ({ type, row, rowIndex }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkSaveData('elxEditable1', row) : this.isClearActiveFlag
    },
    clearActiveMethod2 ({ type, row, rowIndex }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkSaveData('elxEditable2', row) : this.isClearActiveFlag
    },
    // 判断多表格切换时是否有数据没有保存
    checkSaveData (name, row) {
      if (!this.$refs[name].checkValid().error) {
        if (!row.id) {
          this.isClearActiveFlag = false
          MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
            confirmButtonText: '移除数据',
            cancelButtonText: '返回继续',
            type: 'warning'
          }).then(action => {
            if (action === 'confirm') {
              this.$refs[name].remove(row)
            }
          }).catch(e => e).then(() => {
            this.isClearActiveFlag = true
          })
        } else if (this.$refs[name].hasRowChange(row)) {
          this.isClearActiveFlag = false
          MessageBox.confirm('您离开了表格，检测未保存的内容，是否在离开前保存修改?', '温馨提示', {
            closeOnClickModal: false,
            distinguishCancelAndClose: true,
            confirmButtonText: '保存',
            cancelButtonText: '放弃修改',
            type: 'warning'
          }).then(() => {
            this.$refs[name].clearActive()
            this.saveRowEvent(name, row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs[name].revert(row)
              this.$refs[name].clearActive()
            } else {
              this.$refs[name].setActiveRow(row)
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
          return false
        }
      }
      return this.isClearActiveFlag
    },
    openActiveRowEvent (name, row) {
      this.$nextTick(() => {
        let activeInfo = this.$refs[name].getActiveRow()
        // 如果当前行正在编辑中，禁止编辑其他行
        if (activeInfo) {
          if (activeInfo.row === row || !this.$refs[name].checkValid().error) {
            if (activeInfo.isUpdate) {
              this.isClearActiveFlag = false
              MessageBox.confirm('检测到未保存的内容，是否在离开前保存修改?', '温馨提示', {
                closeOnClickModal: false,
                distinguishCancelAndClose: true,
                confirmButtonText: '保存',
                cancelButtonText: '放弃修改',
                type: 'warning'
              }).then(() => {
                this.$refs[name].setActiveRow(row)
                this.saveRowEvent(name, activeInfo.row)
              }).catch(action => {
                if (action === 'cancel') {
                  this.$refs[name].revert(activeInfo.row)
                  this.$refs[name].setActiveRow(row)
                }
              }).then(() => {
                this.isClearActiveFlag = true
              })
            } else {
              this.$refs[name].setActiveRow(row)
            }
          }
        } else {
          this.$refs[name].setActiveRow(row)
        }
      })
    },
    removeEvent (name, row) {
      if (row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          switch (name) {
            case 'elxEditable1':
              this.columnLoading = true
              XEAjax.doDelete(`/api/column/delete/${row.id}`).then(({ data }) => {
                this.findColumnList()
              }).catch(e => {
                this.columnLoading = false
              })
              break
            case 'elxEditable2':
              this.userLoading = true
              XEAjax.doDelete(`/api/user/delete/${row.id}`).then(({ data }) => {
                this.findUserList()
              }).catch(e => {
                this.userLoading = false
              })
              break
          }
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs[name].remove(row)
      }
    },
    deleteSelectedEvent (name) {
      let removeRecords = this.$refs[name].getSelecteds()
      if (removeRecords.length) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定删除所选数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          switch (name) {
            case 'elxEditable1':
              this.columnLoading = true
              XEAjax.doPost('/api/column/save', { removeRecords }).then(({ data }) => {
                Message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.findColumnList()
              }).catch(e => {
                this.columnLoading = false
              })
              break
            case 'elxEditable2':
              this.userLoading = true
              XEAjax.doPost('/api/user/save', { removeRecords }).then(({ data }) => {
                Message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.findUserList()
              }).catch(e => {
                this.userLoading = false
              })
              break
          }
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    saveRowEvent (name, row) {
      this.$refs[name].validateRow(row, valid => {
        if (valid) {
          let url
          switch (name) {
            case 'elxEditable1':
              url = '/api/column/add'
              if (row.id) {
                url = '/api/column/update'
              }
              this.columnLoading = true
              this.$refs[name].clearActive()
              XEAjax.doPost(url, row).then(({ data }) => {
                this.findColumnList()
                Message({ message: '保存成功', type: 'success' })
              }).catch(e => {
                this.columnLoading = false
              })
              break
            case 'elxEditable2':
              url = '/api/user/add'
              if (row.id) {
                url = '/api/user/update'
              }
              if (XEUtils.isDate(row.date)) {
                row.date = row.date.getTime()
              }
              this.userLoading = true
              this.$refs[name].clearActive()
              XEAjax.doPost(url, row).then(({ data }) => {
                this.findUserList()
                Message({ message: '保存成功', type: 'success' })
              }).catch(e => {
                this.userLoading = false
              })
              break
          }
        }
      })
    },
    cancelRowEvent (name, row) {
      if (!row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
          confirmButtonText: '移除数据',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs[name].remove(row)
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else if (this.$refs[name].hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('检测到未保存的内容，确定放弃修改?', '温馨提示', {
          closeOnClickModal: false,
          confirmButtonText: '放弃更改',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs[name].clearActive()
            this.$refs[name].revert(row)
          } else {
            this.$refs[name].setActiveRow(row)
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs[name].clearActive()
      }
    },
    openCustomEvent () {
      this.selectColumns = this.columnConfigs.filter(column => column._show).map(column => column.prop)
    },
    resetCustomEvent () {
      this.selectColumns = this.columnConfigs.filter(column => column._default).map(column => column.prop)
    },
    saveCustomEvent () {
      if (!this.selectColumns.length) {
        return Message({
          type: 'error',
          message: '请至少选择一列！'
        })
      }
      this.dialogVisible = false
      this.columnConfigs.forEach(column => {
        column._show = this.selectColumns.includes(column.prop)
      })
    }
  }
}
</script>

<style>
.manual-table7-oper {
  margin-bottom: 18px;
}
.manual-table7-pagination {
  margin-top: 18px;
  text-align: right;
}
.manual-table7.elx-editable .elx-editable-row.new-insert,
.manual-table7.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>

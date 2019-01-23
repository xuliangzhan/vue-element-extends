<template>
  <el-table
    ref="refElTable"
    :class="['editable', {'editable--icon': showIcon}]"
    :data="datas"
    :height="height"
    :maxHeight="maxHeight"
    :stripe="stripe"
    :border="border"
    :size="size"
    :fit="fit"
    :showHeader="showHeader"
    :highlightCurrentRow="highlightCurrentRow"
    :currentRowKey="currentRowKey"
    :rowClassName="rowClassName"
    :rowStyle="rowStyle"
    :headerRowClassName="headerRowClassName"
    :headerRowStyle="headerRowStyle"
    :headerCellClassName="headerCellClassName"
    :headerCellStyle="headerCellStyle"
    :rowKey="rowKey"
    :emptyText="emptyText"
    :defaultExpandAll="defaultExpandAll"
    :expandRowKeys="expandRowKeys"
    :defaultSort="defaultSort"
    :tooltipEffect="tooltipEffect"
    :showSummary="showSummary"
    :sumText="sumText"
    :summaryMethod="_summaryMethod"
    :selectOnIndeterminate="selectOnIndeterminate"
    :spanMethod="_spanMethod"
    @select="_select"
    @select-all="_selectAll"
    @selection-change="_selectionChange"
    @cell-mouse-enter="_cellMouseEnter"
    @cell-mouse-leave="_cellMouseLeave"
    @cell-click="_cellClick"
    @cell-dblclick="_cellDBLclick"
    @row-click="_rowClick"
    @row-contextmenu="_rowContextmenu"
    @row-dblclick="_rowDBLclick"
    @header-click="_headerClick"
    @header-contextmenu="_headerContextmenu"
    @sort-change="_sortChange"
    @filter-change="_filterChange"
    @current-change="_currentChange"
    @header-dragend="_headerDragend"
    @expand-change="_expandChange">
    <slot></slot>
  </el-table>
</template>

<script>
import XEUtils from 'xe-utils'
import { mapGetters } from 'vuex'

export default {
  name: 'ElEditable',
  props: {
    editConfig: Object,
    editRules: Object,

    /**
     * 还原 ElTable 所有属性
     */
    data: Array,
    height: [String, Number],
    maxHeight: [String, Number],
    stripe: Boolean,
    border: Boolean,
    size: { type: String, default: 'small' },
    fit: { type: Boolean, default: true },
    showHeader: { type: Boolean, default: true },
    highlightCurrentRow: Boolean,
    currentRowKey: [String, Number],
    rowClassName: [Function, String],
    rowStyle: [Function, Object],
    cellClassName: [Function, String],
    cellStyle: [Function, Object],
    headerRowClassName: [Function, String],
    headerRowStyle: [Function, Object],
    headerCellClassName: [Function, String],
    headerCellStyle: [Function, Object],
    rowKey: [Function, String],
    emptyText: String,
    defaultExpandAll: Boolean,
    expandRowKeys: Array,
    defaultSort: Object,
    tooltipEffect: { type: String, default: 'dark' },
    showSummary: Boolean,
    sumText: { type: String, default: '合计' },
    summaryMethod: Function,
    selectOnIndeterminate: { type: Boolean, default: true },
    spanMethod: Function
  },
  provide () {
    return {
      $editable: this
    }
  },
  data () {
    return {
      editProto: {},
      datas: [],
      initialStore: [],
      deleteRecords: [],
      lastActive: null
    }
  },
  computed: {
    ...mapGetters([
      'globalClick'
    ]),
    activeRowIndex () {
      return this.lastActive ? XEUtils.findIndexOf(this.datas, row => row === this.lastActive.row) : -1
    },
    showIcon () {
      return this.editConfig ? !(this.editConfig.showIcon === false) : true
    },
    showStatus () {
      return this.editConfig ? !(this.editConfig.showStatus === false) : true
    },
    autoFocus () {
      return this.editConfig ? !(this.editConfig.autoFocus === false) : true
    },
    mode () {
      return this.editConfig ? (this.editConfig.mode || 'cell') : 'cell'
    }
  },
  watch: {
    /**
     * 监听全局 click 事件
     * 用于处理点击表格外清除激活状态
     */
    globalClick (evnt) {
      if (this.lastActive) {
        let target = evnt.target
        let { row, column, cell } = this.lastActive
        this._validActiveCol().then(() => {
          while (target && target.nodeType && target !== document) {
            if (this.mode === 'row' ? target === cell.parentNode : target === cell) {
              return
            }
            target = target.parentNode
          }
          this._clearValidError(row)
          this._clearActiveData()
          this._clearActiveCell(['editable-col_active', 'valid-error'])
          this.$emit('clear-active', row.data, column, cell, evnt)
        }).catch(e => e)
      }
    },
    datas () {
      this.updateStatus()
    }
  },
  created () {
    this._initial(this.data, true)
  },
  methods: {
    _initial (datas, isReload) {
      if (isReload) {
        this.initialStore = XEUtils.clone(datas, true)
      }
      this.datas = (datas || []).map(item => this._toData(item))
    },
    _toData (item, status) {
      return item.editable && item._EDITABLE_PROTO === this.editProto ? item : {
        _EDITABLE_PROTO: this.editProto,
        data: item,
        store: XEUtils.clone(item, true),
        validActive: null,
        validRule: null,
        editActive: null,
        editStatus: status || 'initial',
        editable: {
          size: this.size,
          showIcon: this.showIcon,
          showStatus: this.showStatus,
          autoFocus: this.autoFocus,
          mode: this.mode,
          rules: this.editRules
        }
      }
    },
    _updateData () {
      this.$emit('update:data', this.datas.map(item => item.data))
    },
    _select (selection, row) {
      this.$emit('select', selection.map(item => item.data), row.data)
    },
    _selectAll (selection) {
      this.$emit('select-all', selection.map(item => item.data))
    },
    _selectionChange (selection) {
      this.$emit('selection-change', selection.map(item => item.data))
    },
    _cellMouseEnter (row, column, cell, event) {
      this.$emit('cell-mouse-enter', row.data, column, cell, event)
    },
    _cellMouseLeave (row, column, cell, event) {
      this.$emit('cell-mouse-leave', row.data, column, cell, event)
    },
    _cellClick (row, column, cell, event) {
      this._cellHandleEvent('click', row, column, cell, event)
    },
    _cellDBLclick (row, column, cell, event) {
      this._cellHandleEvent('dblclick', row, column, cell, event)
    },
    _cellHandleEvent (type, row, column, cell, event) {
      this._validActiveCol().then(() => {
        if (this.lastActive) {
          this._clearValidError(this.lastActive.row)
          this._removeCellClass(this.lastActive.cell, ['valid-error'])
        }
        if (this.editConfig ? this.editConfig.trigger === type : type === 'click') {
          this._triggerActive(row, column, cell, event)
          this._validColRules('change', row, column).catch(rule => {
            this._toValidError(rule, row, column, cell)
          })
        } else {
          if (row.editActive !== column.property) {
            this._addActiveCell(cell, ['editable-col_checked'])
          }
        }
        this.$emit(`cell-${type}`, row.data, column, cell, event)
      }).catch(e => e)
    },
    _rowClick (row, event, column) {
      this.$emit('row-click', row.data, event, column)
    },
    _rowContextmenu (row, event) {
      this.$emit('row-contextmenu', row.data, event)
    },
    _rowDBLclick (row, event) {
      this.$emit('row-dblclick', row.data, event)
    },
    _headerClick (column, event) {
      this.$emit('header-click', column, event)
    },
    _headerContextmenu (column, event) {
      this.$emit('header-contextmenu', column, event)
    },
    _sortChange ({ column, prop, order }) {
      this.$emit('sort-change', { column, prop, order })
    },
    _filterChange (filters) {
      this.$emit('filter-change', filters)
    },
    _currentChange (currentRow, oldCurrentRow) {
      if (currentRow && oldCurrentRow) {
        this.$emit('current-change', currentRow.data, oldCurrentRow.data)
      } else if (currentRow) {
        this.$emit('current-change', currentRow.data)
      } else if (oldCurrentRow) {
        this.$emit('current-change', oldCurrentRow.data)
      }
    },
    _headerDragend (newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
    },
    _expandChange (row, expandedRows) {
      this.$emit('expand-change', row.data, expandedRows)
    },
    _clearActiveData () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editActive = null
      })
    },
    _clearActiveCell (clss) {
      Array.from(this.$el.querySelectorAll(`.${clss.join('.editable-column,.')}.editable-column`)).forEach(elem => this._removeCellClass(elem, clss))
    },
    _addActiveCell (cell, clss) {
      this._clearActiveCell(clss)
      this._addCellClass(cell, clss)
    },
    _addCellClass (cell, clss) {
      let classList = cell.className.split(' ')
      clss.forEach(name => {
        if (classList.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    _removeCellClass (cell, clss) {
      let classList = []
      cell.className.split(' ').forEach(name => {
        if (clss.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    _setFocus (cell) {
      let inpElem = cell.querySelector('.el-input>input')
      if (!inpElem) {
        inpElem = cell.querySelector('.el-textarea>textarea')
        if (!inpElem) {
          inpElem = cell.querySelector('.editable-custom_input')
        }
      }
      if (inpElem) {
        inpElem.focus()
      }
    },
    _triggerActive (row, column, cell, event) {
      let clss = ['editable-col_active']
      if (row.validActive === column.property) {
        clss.push('valid-error')
      }
      this.clearActive()
      this.lastActive = { row, column, cell }
      this._addCellClass(cell, clss)
      row.editActive = column.property
      if (this.autoFocus) {
        this.$nextTick(() => {
          this._setFocus(cell)
          if (row.editActive !== column.property) {
            this.$emit('edit-active', row.data, column, cell, event)
          }
        })
      } else {
        if (row.editActive !== column.property) {
          this.$emit('edit-active', row.data, column, cell, event)
        }
      }
    },
    _updateColumnStatus (trElem, column, tdElem) {
      if (column.className.split(' ').includes('editable-col_edit')) {
        this._addCellClass(tdElem, ['editable-col_dirty'])
      }
    },
    _summaryMethod (param) {
      let { columns } = param
      let data = param.data.map(item => item.data)
      let sums = []
      if (this.summaryMethod) {
        sums = this.summaryMethod({ columns, data })
      } else {
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = this.sumText
            return
          }
          let values = data.map(item => Number(item[column.property]))
          let precisions = []
          let notNumber = true
          values.forEach(value => {
            if (!isNaN(value)) {
              notNumber = false
              let decimal = ('' + value).split('.')[1]
              precisions.push(decimal ? decimal.length : 0)
            }
          })
          let precision = Math.max.apply(null, precisions)
          if (!notNumber) {
            sums[index] = values.reduce((prev, curr) => {
              let value = Number(curr)
              if (!isNaN(value)) {
                return parseFloat((prev + curr).toFixed(Math.min(precision, 20)))
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = ''
          }
        })
      }
      return sums
    },
    _spanMethod ({ row, column, rowIndex, columnIndex }) {
      let rowspan = 1
      let colspan = 1
      let fn = this.spanMethod
      if (XEUtils.isFunction(fn)) {
        var result = fn({ row: row.data, column, rowIndex, columnIndex })
        if (XEUtils.isArray(result)) {
          rowspan = result[0]
          colspan = result[1]
        } else if (XEUtils.isPlainObject(result)) {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }
      return { rowspan, colspan }
    },
    isValidError () {
      return this.lastActive ? !!this.lastActive.row.validActive : false
    },
    _validRowRules (type, row) {
      let validPromise = Promise.resolve()
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let datas = this.datas
        let columns = this.$refs.refElTable.columns
        let ruleKeys = Object.keys(editRules)
        let trElems = this.$el.querySelectorAll('.el-table__row')
        let index = XEUtils.findIndexOf(datas, item => item === row)
        this._clearValidError(row)
        columns.forEach((column, cIndex) => {
          if (ruleKeys.includes(column.property)) {
            validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
              this._validColRules('all', row, column).then(resolve).catch(rule => {
                let rest = { rule, row, column, cell: trElems[index].children[cIndex] }
                return reject(rest)
              })
            }))
          }
        })
      }
      return validPromise
    },
    /**
     * 校验数据
     * 按表格行、列顺序依次校验（同步或异步）
     * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
     * 如果校验失败则，触发回调或者Promise，结果返回一个 Boolean 值
     * 如果是传回调方式这返回一个 Boolean 值和校验不通过列的错误消息
     *
     * 参数：required=Boolean 是否必填，min=Number 最小长度，max=Number 最大长度，validator=Function(rule, value, callback) 自定义校验，trigger=blur|change 触发方式
     */
    _validColRules (type, row, column) {
      let property = column.property
      let validPromise = Promise.resolve()
      if (property && !XEUtils.isEmpty(this.editRules)) {
        let rules = this.editRules[property]
        let value = row.data[property]
        if (rules) {
          for (let rIndex = 0; rIndex < rules.length; rIndex++) {
            validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
              let rule = rules[rIndex]
              if ((type === 'all' || !rule.trigger || rule.trigger === 'change' || type === rule.trigger) && (rule.required === true || value)) {
                if (XEUtils.isFunction(rule.validator)) {
                  rule.validator(rule, value, e => {
                    if (XEUtils.isError(e)) {
                      let cusRule = { type: 'custom', message: e.message, rule }
                      return reject(cusRule)
                    }
                    return resolve(rule)
                  })
                } else {
                  let strVal = '' + (value || '')
                  if (!value ||
                    (XEUtils.isNumber(rule.min) && strVal.length < rule.min) ||
                    (XEUtils.isNumber(rule.max) && strVal.length > rule.max)) {
                    reject(rule)
                  } else {
                    resolve(rule)
                  }
                }
              } else {
                resolve(rule)
              }
            }))
          }
        }
      }
      return validPromise
    },
    _validActiveCol () {
      if (this.lastActive && !XEUtils.isEmpty(this.editRules)) {
        let { row, column, cell } = this.lastActive
        return this._validColRules('blur', row, column).catch(rule => {
          let rest = { rule, row, column, cell }
          this._toValidError(rule, row, column, cell)
          return Promise.reject(rest)
        })
      }
      return Promise.resolve()
    },
    _clearValidError (row) {
      row.validRule = null
      row.validActive = null
    },
    _toValidError (rule, row, column, cell) {
      row.validRule = rule
      row.validActive = column.property
      setTimeout(() => this._triggerActive(row, column, cell, { type: 'valid' }), 5)
    },
    clearActive () {
      this._clearActiveData()
      this._clearActiveCell(['editable-col_active', 'editable-col_checked', 'valid-error'])
    },
    /**
     * 指定某一行为激活状态
     * 当指定为 mode='row' 行编辑模式时
     * 可以根据索引激活行为编辑状态
     */
    setActiveRow (rowIndex) {
      let row = this.datas[rowIndex]
      if (row && this.mode === 'row') {
        this.validateRow(rowIndex).then(valid => {
          let column = this.$refs.refElTable.columns.find(column => column.property)
          let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .el-table__row')
          let cell = trElemList[rowIndex].children[0]
          this._triggerActive(row, column, cell, { type: 'edit' })
        }).catch(e => e)
        return true
      }
      return false
    },
    /**
     * 初始化
     * 用于初始化数据、重新加载数据
     */
    reload (datas) {
      this.deleteRecords = []
      this.clearActive()
      this._initial(datas, true)
      this._updateData()
    },
    /**
     * 还原更改
     * 还原为最后一次 reload 的数据
     */
    revert () {
      this.reload(this.initialStore)
    },
    /**
     * 清空
     */
    clear () {
      this.deleteRecords = []
      this.clearActive()
      this._initial([])
      this._updateData()
    },
    insert (record) {
      this.insertAt(record, 0)
    },
    /**
     * 插入数据
     * 可以根据索引将数据插入到指定任意行
     * 如果是 null 或 0 则插入到第一行
     * 如果是 -1 或 大于行索引 则使用 push 到表格最后
     */
    insertAt (record, rowIndex) {
      let recordItem = {}
      let len = this.datas.length
      this.$refs.refElTable.columns.forEach(column => {
        if (column.property) {
          recordItem[column.property] = null
        }
      })
      recordItem = this._toData(Object.assign(recordItem, record), 'insert')
      if (rowIndex) {
        if (rowIndex === -1 || rowIndex >= len) {
          rowIndex = len
          this.datas.push(recordItem)
        } else {
          this.datas.splice(rowIndex, 0, recordItem)
        }
      } else {
        rowIndex = 0
        this.datas.unshift(recordItem)
      }
      this._updateData()
    },
    /**
     * 根据索引删除行数据
     */
    removeRow (rowIndex) {
      let items = this.datas.splice(rowIndex, 1)
      items.forEach(item => {
        if (item.editStatus === 'initial') {
          this.deleteRecords.push(item)
        }
      })
      this._updateData()
    },
    removeRows (rowIndexs) {
      XEUtils.lastEach(this.datas, (item, index) => {
        if (rowIndexs.includes(index)) {
          this.removeRow(index)
        }
      })
    },
    remove (record) {
      this.removeRow(XEUtils.findIndexOf(this.datas, item => item.data === record))
    },
    removes (records) {
      XEUtils.lastEach(this.datas, (item, index) => {
        if (records.includes(item.data)) {
          this.removeRow(index)
        }
      })
    },
    removeSelecteds () {
      this.removes(this.$refs.refElTable.selection.map(item => item.data))
    },
    getRecords (datas) {
      return (datas || this.datas).map(item => item.data)
    },
    getAllRecords () {
      return {
        records: this.getRecords(),
        insertRecords: this.getInsertRecords(),
        removeRecords: this.getRemoveRecords(),
        updateRecords: this.getUpdateRecords()
      }
    },
    getInsertRecords () {
      return this.getRecords(this.datas.filter(item => item.editStatus === 'insert'))
    },
    getRemoveRecords () {
      return this.getRecords(this.deleteRecords)
    },
    getUpdateRecords () {
      return this.getRecords(this.datas.filter(item => item.editStatus === 'initial' && !XEUtils.isEqual(item.data, item.store)))
    },
    /**
     * 更新列状态
     * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
     * 由于缓存策略，但行数据发生增加或删除时，需要更新所有行
     */
    updateStatus (scope) {
      if (arguments.length === 0) {
        if (this.showStatus) {
          this.$nextTick(() => {
            let trElems = this.$el.querySelectorAll('.el-table__row')
            if (trElems.length) {
              let columns = this.$refs.refElTable.columns
              this.datas.forEach((item, index) => {
                let trElem = trElems[index]
                if (trElem.children.length) {
                  if (item.editStatus === 'insert') {
                    columns.forEach((column, cIndex) => this._updateColumnStatus(trElem, column, trElem.children[cIndex]))
                  } else {
                    columns.forEach((column, cIndex) => {
                      let tdElem = trElem.children[cIndex]
                      if (tdElem) {
                        if (XEUtils.isEqual(item.data[column.property], item.store[column.property])) {
                          this._removeCellClass(tdElem, ['editable-col_dirty'])
                        } else {
                          this._updateColumnStatus(trElem, column, trElem.children[cIndex])
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        }
      } else {
        this.$nextTick(() => {
          let { $index, _row, column, store } = scope
          let trElems = store.table.$el.querySelectorAll('.el-table__row')
          if (trElems.length) {
            let trElem = trElems[$index]
            let tdElem = trElem.querySelector(`.${column.id}`)
            if (tdElem) {
              if (this.showStatus) {
                if (XEUtils.isEqual(_row.data[column.property], _row.store[column.property])) {
                  this._removeCellClass(tdElem, ['editable-col_dirty'])
                } else {
                  this._updateColumnStatus(trElem, column, tdElem)
                }
              }
              return this._validColRules('change', _row, column).then(rule => {
                this._clearValidError(_row)
                this._removeCellClass(tdElem, ['valid-error'])
              }).catch(rule => {
                this._toValidError(rule, _row, column, tdElem)
              })
            }
          }
        })
      }
    },
    /**
     * 指定行索引进行校验
     * 返回 Promise 对象，或者使用回调方式
     */
    validateRow (rowIndex, fn) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this._validActiveCol().then(() => {
            let row = this.datas[rowIndex]
            if (row && this.mode === 'row') {
              this._validRowRules('change', row).then(rest => {
                if (fn) {
                  fn(true)
                }
                resolve(true)
              }).catch(({ rule, row, column, cell }) => {
                let status = false
                this._toValidError(rule, row, column, cell)
                if (fn) {
                  fn(status, {[column.property]: [new Error(rule.message)]})
                  resolve(status)
                } else {
                  reject(status)
                }
              })
            } else {
              resolve()
            }
          }).catch(({ rule, row, column, cell }) => {
            let status = false
            if (fn) {
              fn(status, {[column.property]: [new Error(rule.message)]})
              resolve(status)
            } else {
              reject(status)
            }
          })
        }, 5)
      })
    },
    /**
     * 对整个表格数据进行校验
     * 返回 Promise 对象，或者使用回调方式
     */
    validate (fn) {
      let validPromise = Promise.resolve(true)
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let datas = this.datas
        let columns = this.$refs.refElTable.columns
        let ruleKeys = Object.keys(editRules)
        let trElems = this.$el.querySelectorAll('.el-table__row')
        datas.forEach((row, index) => {
          this._clearValidError(row)
          columns.forEach((column, cIndex) => {
            if (ruleKeys.includes(column.property)) {
              validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
                this._validColRules('all', row, column).then(resolve).catch(rule => {
                  let rest = { rule, row, column, cell: trElems[index].children[cIndex] }
                  return reject(rest)
                })
              }))
            }
          })
        })
        return validPromise.then(() => {
          if (fn) {
            fn(true)
          }
          return true
        }).catch(({ rule, row, column, cell }) => {
          let status = false
          this._toValidError(rule, row, column, cell)
          if (fn) {
            fn(status, {[column.property]: [new Error(rule.message)]})
          }
          return fn ? Promise.resolve(status) : Promise.reject(status)
        })
      } else {
        if (fn) {
          fn(true)
        }
      }
      return validPromise
    }
  }
}
</script>

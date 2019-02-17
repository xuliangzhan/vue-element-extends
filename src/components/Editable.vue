<template>
  <el-table
    ref="refElTable"
    :class="['editable', `editable_${trigger}`, {'editable_icon': showIcon}]"
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
      lastActive: null,
      isClearlActivate: false,
      isManualActivate: false
    }
  },
  computed: {
    ...mapGetters([
      'globalClick'
    ]),
    tableData () {
      return this.$refs.refElTable ? this.$refs.refElTable.tableData : this.datas
    },
    trigger () {
      return this.editConfig ? this.editConfig.trigger : 'click'
    },
    showIcon () {
      return this.editConfig ? !(this.editConfig.showIcon === false) : true
    },
    showStatus () {
      return this.editConfig ? !(this.editConfig.showStatus === false) : true
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
      if (!this.isManualActivate && this.lastActive) {
        let target = evnt.target
        let { row, column, cell } = this.lastActive
        while (target && target.nodeType && target !== document) {
          if (this.mode === 'row' ? target === cell.parentNode : target === cell) {
            return
          }
          target = target.parentNode
        }
        this._validActiveCell().then(() => {
          this._clearValidError(row)
          this._clearActiveData()
          this._clearActiveCell(['editable-col_active', 'valid-error'])
          this._restoreTooltip()
          this.$emit('clear-active', row.data, column, cell, evnt)
        }).catch(e => e)
      } else {
        this.isManualActivate = false
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
    /**************************/
    /* Original methods statrt */
    /**************************/
    clearSelection () {
      this.$nextTick(() => this.$refs.refElTable.clearSelection())
    },
    toggleRowSelection (record, selected) {
      this.$nextTick(() => this.$refs.refElTable.toggleRowSelection(this.datas.find(item => item.data === record), selected))
    },
    toggleAllSelection () {
      this.$nextTick(() => this.$refs.refElTable.toggleAllSelection())
    },
    toggleRowExpansion (record, expanded) {
      this.$nextTick(() => this.$refs.refElTable.toggleRowExpansion(this.datas.find(item => item.data === record), expanded))
    },
    setCurrentRow (record) {
      this.$nextTick(() => this.$refs.refElTable.setCurrentRow(this.datas.find(item => item.data === record)))
    },
    clearSort () {
      this.$nextTick(() => this.$refs.refElTable.clearSort())
    },
    clearFilter () {
      this.$nextTick(() => this.$refs.refElTable.clearFilter())
    },
    doLayout () {
      this.$nextTick(() => this.$refs.refElTable.doLayout())
    },
    insert (newRecord) {
      return this.insertAt(newRecord, 0)
    },
    /**************************/
    /* Original methods end */
    /**************************/

    /***************************/
    /* Interior methods statrt */
    /***************************/
    _initial (datas, isReload) {
      if (isReload) {
        this.initialStore = XEUtils.clone(datas, true)
      }
      this.datas = (datas || []).map(item => this._toData(item))
    },
    _getData (datas) {
      return (datas || this.datas).map(item => item.data)
    },
    _toData (item, status) {
      return item && item._EDITABLE_PROTO === this.editProto ? item : {
        _EDITABLE_PROTO: this.editProto,
        data: item,
        store: XEUtils.clone(item, true),
        validActive: null,
        validRule: null,
        editActive: null,
        editStatus: status || 'initial',
        config: {
          size: this.size,
          showIcon: this.showIcon,
          showStatus: this.showStatus,
          mode: this.mode,
          rules: this.editRules
        }
      }
    },
    _updateData () {
      this.$emit('update:data', this.datas.map(item => item.data))
    },
    _select (selection, row) {
      this.$emit('select', selection.map(item => item ? item.data : item), row.data)
    },
    _selectAll (selection) {
      this.$emit('select-all', selection.map(item => item ? item.data : item))
    },
    _selectionChange (selection) {
      this.$emit('selection-change', selection.map(item => item ? item.data : item))
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
    /**
     * 触发编辑事件
     * 行模式和列模式可编辑，如果是只读列不能编辑
     * 触发时先校验活动行或列，如果存在校验规则且校验不通过
     * 停止激活新行，聚焦到校验错误行
     */
    _cellHandleEvent (type, row, column, cell, event) {
      if (!this.isClearlActivate && this._hasClass(cell, 'editable-col_edit')) {
        this._validActiveCell().then(() => {
          if (this.lastActive) {
            this._clearValidError(this.lastActive.row)
            this._removeClass(this.lastActive.cell, ['valid-error'])
          }
          if (this.trigger === type) {
            this._triggerActive(row, column, cell, event)
            if (row && this.mode === 'row') {
              this._validRowRules('change', row).catch(({ rule, row, column, cell }) => this._toValidError(rule, row, column, cell))
            } else {
              this._validColRules('change', row, column).catch(rule => this._toValidError(rule, row, column, cell))
            }
          } else {
            if (row.editActive !== column.property) {
              this._checkedActiveCell(cell, ['editable-col_checked'])
            }
          }
          this.$emit(`cell-${type}`, row.data, column, cell, event)
        }).catch(e => e)
      } else {
        this.isClearlActivate = false
      }
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
    _restoreTooltip (cell) {
      Array.from(this.$el.querySelectorAll('.disabled-el-tooltip')).forEach(elem => {
        this._removeClass(elem, ['disabled-el-tooltip'])
        this._addClass(elem, ['el-tooltip'])
      })
    },
    /**
     * 阻止带有 tooltip 组件的列
     * 如果行或列被激活编辑时，关闭 tooltip 提示并禁用
     */
    _disabledTooltip (cell) {
      let tElems = ['row', 'manual'].includes(this.mode) ? cell.parentNode.querySelectorAll('td.editable-col_edit>.cell.el-tooltip') : cell.querySelectorAll('.cell.el-tooltip')
      if (this.$refs.refElTable) {
        let refElTableBody = this.$refs.refElTable.$children.find(comp => this._hasClass(comp.$el, 'el-table__body'))
        if (refElTableBody && refElTableBody.$refs.tooltip) {
          refElTableBody.$refs.tooltip.hide()
        }
      }
      Array.from(tElems).forEach(elem => {
        this._removeClass(elem, ['el-tooltip'])
        this._addClass(elem, ['disabled-el-tooltip'])
      })
    },
    _clearActiveColumns () {
      this._clearActiveData()
      this._clearActiveCell(['editable-col_active', 'editable-col_checked', 'valid-error'])
    },
    _clearActiveCell (clss) {
      Array.from(this.$el.querySelectorAll(`.${clss.join('.editable-column,.')}.editable-column`)).forEach(elem => this._removeClass(elem, clss))
    },
    _checkedActiveCell (cell, clss) {
      this._clearActiveCell(clss)
      this._addClass(cell, clss)
    },
    _addClass (cell, clss) {
      let classList = cell.className.split(' ')
      clss.forEach(name => {
        if (classList.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    _hasClass (cell, cls) {
      return cell.className.split(' ').includes(cls)
    },
    _removeClass (cell, clss) {
      let classList = []
      cell.className.split(' ').forEach(name => {
        if (clss.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    /**
     * 设置列聚焦
     * 默认对文本款类的激活后自动聚焦
     * 如果是自定义渲染，也可以指定 class=editable-custom_input 使该列自动聚焦
     * 允许通过列渲染配置指定 autofocus 来打开或关闭自动聚焦
     */
    _setFocus (cell) {
      let inpElem = cell.querySelector('.el-input>input')
      if (!inpElem) {
        inpElem = cell.querySelector('.el-textarea>textarea')
        if (!inpElem) {
          inpElem = cell.querySelector('.editable-custom_input')
        }
      }
      if (inpElem && this._hasClass(cell, 'autofocus')) {
        inpElem.focus()
      }
    },
    _isEditCell (row, column) {
      return this.editConfig && this.editConfig.activeMethod ? this.editConfig.activeMethod(row, this.mode === 'row' ? null : column, XEUtils.findIndexOf(this.tableData, item => item === row)) : true
    },
    _triggerActive (row, column, cell, event) {
      if (this._isEditCell(row, column)) {
        let clss = ['editable-col_active']
        if (row.validActive === column.property) {
          clss.push('valid-error')
        }
        this._restoreTooltip(cell)
        this._disabledTooltip(cell)
        this._clearActiveColumns()
        this._addClass(cell, clss)
        this.lastActive = { row, column, cell }
        row.editActive = column.property
        this.$nextTick(() => {
          this._setFocus(cell)
          if (row.editActive !== column.property) {
            this.$emit('edit-active', row.data, column, cell, event)
          }
        })
      }
    },
    _updateColumnStatus (trElem, column, tdElem) {
      if (this._hasClass(column, 'editable-col_edit')) {
        this._addClass(tdElem, ['editable-col_dirty'])
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
      let spanMethod = this.spanMethod
      if (XEUtils.isFunction(spanMethod)) {
        var result = spanMethod({ row: row.data, column, rowIndex, columnIndex })
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
    _validRowRules (type, row) {
      let validPromise = Promise.resolve()
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let datas = this.tableData
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
              let isRequired = rule.required === true
              if ((type === 'all' || !rule.trigger || rule.trigger === 'change' || type === rule.trigger) && (isRequired || value)) {
                if (XEUtils.isFunction(rule.validator)) {
                  rule.validator(rule, value, e => {
                    if (XEUtils.isError(e)) {
                      let cusRule = { type: 'custom', message: e.message, rule }
                      return reject(cusRule)
                    }
                    return resolve(rule)
                  })
                } else {
                  let restVal
                  let isNumber = rule.type === 'number'
                  if (isNumber) {
                    restVal = XEUtils.toNumber(value)
                  } else {
                    restVal = '' + (value || '')
                  }
                  if (isRequired && !value) {
                    reject(rule)
                  } else if (value &&
                    ((isNumber && isNaN(value)) ||
                    (XEUtils.isRegExp(rule.pattern) && !rule.pattern.test(value)) ||
                    (XEUtils.isNumber(rule.min) && (isNumber ? restVal < rule.min : restVal.length < rule.min)) ||
                    (XEUtils.isNumber(rule.max) && (isNumber ? restVal > rule.max : restVal.length > rule.max)))
                  ) {
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
    _validActiveCell () {
      if (this.lastActive && !XEUtils.isEmpty(this.editRules)) {
        let { row, column, cell } = this.lastActive
        if (row && this.mode === 'row') {
          return this._validRowRules('blur', row).catch(({ rule, row, column, cell }) => {
            let rest = { rule, row, column, cell }
            this._toValidError(rule, row, column, cell)
            return Promise.reject(rest)
          })
        } else {
          return this._validColRules('blur', row, column).catch(rule => {
            let rest = { rule, row, column, cell }
            this._toValidError(rule, row, column, cell)
            return Promise.reject(rest)
          })
        }
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
      this._triggerActive(row, column, cell, { type: 'valid' })
      if (cell && cell.scrollIntoView) {
        this.$nextTick(() => cell.scrollIntoView())
      }
    },
    _deleteData (index) {
      if (index > -1) {
        let items = this.datas.splice(index, 1)
        items.forEach(item => {
          if (item.editStatus === 'initial') {
            this.deleteRecords.push(item)
          }
        })
        return items
      }
      return []
    },
    _clearAllOpers () {
      this.clearSelection()
      this.clearFilter()
      this.clearSort()
    },
    /***************************/
    /* Interior methods end    */
    /***************************/

    /***************************/
    /* Public methods start    */
    /***************************/
    reload (datas) {
      this.deleteRecords = []
      this._clearAllOpers()
      this._clearActiveColumns()
      this._initial(datas, true)
      this._updateData()
    },
    /**
     * 还原更改
     * 还原为最后一次 reload 的数据
     */
    revert () {
      this._clearAllOpers()
      this.reload(this.initialStore)
    },
    /**
     * 清空
     */
    clear () {
      this.deleteRecords = []
      this._clearActiveColumns()
      this._initial([])
      this._updateData()
    },
    /**
     * 插入数据
     * 如果是 record 或 rowIndex 则在指定位置新增一行新数据
     * 如果是 null 或 0 则插入到第一行
     * 如果是 -1 或 大于行索引 则使用 push 到表格最后
     */
    insertAt (newRecord, recordOrIndex) {
      let recordItem = {}
      let len = this.datas.length
      this.$refs.refElTable.columns.forEach(column => {
        if (column.property) {
          recordItem[column.property] = null
        }
      })
      recordItem = this._toData(Object.assign(recordItem, newRecord), 'insert')
      if (recordOrIndex) {
        if (!XEUtils.isNumber(recordOrIndex)) {
          recordOrIndex = XEUtils.findIndexOf(this.datas, item => item.data === recordOrIndex)
        }
        if (recordOrIndex === -1 || recordOrIndex >= len) {
          this.datas.push(recordItem)
        } else {
          this.datas.splice(recordOrIndex, 0, recordItem)
        }
      } else {
        this.datas.unshift(recordItem)
      }
      this._updateData()
      return recordItem.data
    },
    /**
     * 根据索引删除行数据
     */
    removeByIndex (rowIndex) {
      let row = this.tableData[rowIndex]
      if (row) {
        return this.remove(row.data)
      }
      return null
    },
    removeByIndexs (rowIndexs) {
      return this.removes(rowIndexs.map(index => this.tableData[index] ? this.tableData[index].data : null))
    },
    remove (record) {
      let items = this._deleteData(XEUtils.findIndexOf(this.datas, item => item.data === record))
      this._updateData()
      return items.length ? items[0].data : null
    },
    removes (records) {
      let items = []
      XEUtils.lastEach(this.datas, (item, index) => {
        if (records.includes(item.data)) {
          items = items.concat(this._deleteData(index))
        }
      })
      this._updateData()
      return items.map(item => item.data)
    },
    getSelecteds () {
      return this.$refs.refElTable.selection.map(item => item.data)
    },
    removeSelecteds () {
      this.removes(this.getSelecteds())
    },
    getRecords (rowIndex) {
      let list = this._getData()
      return arguments.length ? list[rowIndex] : list
    },
    getAllRecords () {
      return {
        records: this._getData(),
        selecteds: this.getSelecteds(),
        insertRecords: this.getInsertRecords(),
        removeRecords: this.getRemoveRecords(),
        updateRecords: this.getUpdateRecords()
      }
    },
    getInsertRecords () {
      return this._getData(this.datas.filter(item => item.editStatus === 'insert'))
    },
    getRemoveRecords () {
      return this._getData(this.deleteRecords)
    },
    getUpdateRecords () {
      return this._getData(this.datas.filter(item => item.editStatus === 'initial' && !XEUtils.isEqual(item.data, item.store)))
    },
    clearActive () {
      this.isClearlActivate = true
      this._clearActiveColumns()
      this._restoreTooltip()
    },
    /**
     * 指定某一行为激活状态
     * 只有当指定为 mode='row' 行编辑模式时
     * 才可以根据索引激活行为编辑状态
     */
    setActiveRow (record) {
      let rowIndex = XEUtils.findIndexOf(this.tableData, item => item.data === record)
      let row = this.tableData[rowIndex]
      if (rowIndex > -1 && this.mode === 'row') {
        this.isManualActivate = true
        this._validRowRules('all', row).then(valid => {
          let columns = this.$refs.refElTable.columns
          let colIndex = XEUtils.findIndexOf(columns, item => item.property)
          let column = columns[colIndex]
          let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .el-table__row')
          let cell = trElemList[rowIndex].children[colIndex]
          this._triggerActive(row, column, cell, { type: 'edit' })
        }).catch(({ rule, row, column, cell }) => {
          this._toValidError(rule, row, column, cell)
        })
        return true
      }
      return false
    },
    isActiveRow (record) {
      return this.lastActive ? this.lastActive.row.data === record : false
    },
    getActiveInfo () {
      if (this.lastActive) {
        let { row, column } = this.lastActive
        let index = XEUtils.findIndexOf(this.datas, item => item === row)
        if (this.mode === 'row') {
          return { row: row.data, $index: index, _row: row }
        }
        return { row: row.data, column, $index: index, _row: row }
      }
      return null
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
              this.tableData.forEach((item, index) => {
                let trElem = trElems[index]
                if (trElem.children.length) {
                  if (item.editStatus === 'insert') {
                    columns.forEach((column, cIndex) => this._updateColumnStatus(trElem, column, trElem.children[cIndex]))
                  } else {
                    columns.forEach((column, cIndex) => {
                      let tdElem = trElem.children[cIndex]
                      if (tdElem) {
                        if (XEUtils.isEqual(item.data[column.property], item.store[column.property])) {
                          this._removeClass(tdElem, ['editable-col_dirty'])
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
                  this._removeClass(tdElem, ['editable-col_dirty'])
                } else {
                  this._updateColumnStatus(trElem, column, tdElem)
                }
              }
              return this._validColRules('change', _row, column).then(rule => {
                this._clearValidError(_row)
                this._removeClass(tdElem, ['valid-error'])
              }).catch(rule => {
                this._toValidError(rule, _row, column, tdElem)
              })
            }
          }
        })
      }
    },
    checkValid () {
      let row = this.datas.find(item => item.validActive)
      if (row) {
        let index = XEUtils.findIndexOf(this.datas, item => item === row)
        return { error: true, row: row.data, prop: row.validActive, rule: row.validRule, $index: index, _row: row }
      }
      return { error: false }
    },
    /**
     * 对表格某一行进行校验的方法
     * 返回 Promise 对象，或者使用回调方式
     */
    validateRow (record, cb) {
      let rowIndex = XEUtils.findIndexOf(this.tableData, item => item.data === record)
      return new Promise((resolve, reject) => {
        let row = this.tableData[rowIndex]
        this._validRowRules('all', row).then(rest => {
          let valid = true
          if (cb) {
            cb(valid)
          }
          resolve(true)
        }).catch(({ rule, row, column, cell }) => {
          let valid = false
          this._toValidError(rule, row, column, cell)
          if (cb) {
            cb(valid, { [column.property]: [new Error(rule.message)] })
            resolve(valid)
          } else {
            reject(valid)
          }
        })
      })
    },
    /**
     * 对整个表格数据进行校验
     * 返回 Promise 对象，或者使用回调方式
     */
    validate (cb) {
      let validPromise = Promise.resolve(true)
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let datas = this.tableData
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
          let valid = true
          if (cb) {
            cb(valid)
          }
          return true
        }).catch(({ rule, row, column, cell }) => {
          let valid = false
          this._toValidError(rule, row, column, cell)
          if (cb) {
            cb(valid, { [column.property]: [new Error(rule.message)] })
          }
          return cb ? Promise.resolve(valid) : Promise.reject(valid)
        })
      } else {
        let valid = true
        if (cb) {
          cb(valid)
        }
      }
      return validPromise
    }
    /***************************/
    /* Public methods end      */
    /***************************/
  }
}
</script>

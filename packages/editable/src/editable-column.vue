<template>
  <el-table-column v-if="isVisible && (type === 'selection' && scrollLoad)" v-bind="bindProps">
    <template v-slot:header="scope">
      <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="checkAllEvent"></el-checkbox>
    </template>
    <template v-slot="scope">
      <el-checkbox v-model="scope.row.scrollChecked" @change="checkRowEvent(scope)"></el-checkbox>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible && (type === 'selection' || group || isGroup)" v-bind="bindProps">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="isVisible && type === 'index'" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="getHeadScope(scope)">{{ label || '#' }}</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="getIndexScope(scope)">{{ formatRowIndex(scope) }}</slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible && type === 'expand'" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="getHeadScope(scope)"></slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="getRowScope(scope)"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible && editRender" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="getHeadScope(scope)">
        <i v-if="checkRequired(scope)" class="editable-required-icon"></i>
        <i v-if="checkIcon(scope)" class="el-icon-edit-outline editable-header-icon"></i>
        {{ scope.column.label }}
      </slot>
    </template>
    <template v-slot="scope">
      <template v-if="isEditRender(scope)">
        <slot name="edit" v-bind="getRowScope(scope)">
          <template v-if="compName === 'ElSelect'">
            <el-select v-if="renderOpts.optionGroups" v-model="scope.row.data[scope.column.property]" v-bind="getRendProps(scope)" v-on="getRendEvents(scope)">
              <el-option-group v-for="(group, gIndex) in renderOpts.optionGroups" :key="gIndex" :label="group[renderOpts.optionGroupProps.label]" v-bind="group.props">
                <el-option v-for="(item, index) in group[renderOpts.optionGroupProps.options]" :key="index" :value="item[renderOpts.optionProps.value]" :label="item[renderOpts.optionProps.label]" v-bind="item.props || item.attrs"></el-option>
              </el-option-group>
            </el-select>
            <el-select v-else v-model="scope.row.data[scope.column.property]" v-bind="getRendProps(scope)" v-on="getRendEvents(scope)">
              <el-option v-for="(item, index) in renderOpts.options" :key="index" :value="item[renderOpts.optionProps.value]" :label="item[renderOpts.optionProps.label]" v-bind="item.props || item.attrs"></el-option>
            </el-select>
          </template>
          <template v-else-if="comps.includes(compName)">
            <component :is="compName" v-model="scope.row.data[scope.column.property]" v-bind="getRendProps(scope)" v-on="getRendEvents(scope)"></component>
          </template>
          <template v-else>
            <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendProps(scope)" v-on="getRendEvents(scope)"></el-input>
          </template>
        </slot>
      </template>
      <template v-else>
        <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
      </template>
      <template v-if="scope.row.validActive && !editConfig.disabledValidTip && scope.row.validActive === scope.column.property">
        <template v-if="editConfig.useDefaultValidTip">
          <template v-if="scope.row.showValidMsg">
            <slot name="valid" v-bind="getVaildScope(scope)">
              <div class="editable-valid_error">
                <span class="valid-message">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</span>
              </div>
            </slot>
          </template>
        </template>
        <template v-else>
          <el-tooltip :value="scope.row.showValidMsg" v-bind="editConfig.validTooltip">
            <div class="editable-valid_wrapper"></div>
            <template v-slot:content>
              <slot name="valid" v-bind="getVaildScope(scope)">
                <div class="valid-message">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</div>
              </slot>
            </template>
          </el-tooltip>
        </template>
      </template>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="getHeadScope(scope)">{{ scope.column.label }}</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
    </template>
  </el-table-column>
</template>

<script>
import XEUtils from 'xe-utils'
import PropsStatic from './props'

export default {
  name: 'ElxEditableColumn',
  props: {
    group: Boolean,
    editRender: Object,
    ...PropsStatic.tableColumn
  },
  inject: [
    '$editable'
  ],
  data () {
    return {
      checkAll: false,
      isIndeterminate: false,
      // 支持内置组件
      comps: [
        'ElAutocomplete',
        'ElInput',
        'ElSelect',
        'ElCascader',
        'ElTimeSelect',
        'ElTimePicker',
        'ElDatePicker',
        'ElInputNumber',
        'ElSwitch',
        'ElRate',
        'ElColorPicker',
        'ElSlider'
      ]
    }
  },
  computed: {
    renderOpts () {
      let editRender = this.editRender
      return Object.assign({
        name: editRender ? 'ElInput' : null,
        type: 'default',
        autofocus: editRender && ['ElInput', 'ElInputNumber', 'ElAutocomplete'].includes(editRender.name),
        optionProps: {
          value: 'value',
          label: 'label'
        },
        optionGroupProps: {
          options: 'options',
          label: 'label'
        }
      }, editRender)
    },
    editConfig () {
      return this.$editable.configs
    },
    scrollLoad () {
      return this.$editable.scrollLoad
    },
    isReadonly () {
      return !this.editRender
    },
    compName () {
      return this.renderOpts.name
    },
    isGroup () {
      return this.$slots.default && this.$slots.default.some(item => item && item.componentOptions && item.componentOptions.tag === 'elx-editable-column')
    },
    customColumnList () {
      return this.$editable.columnList
    },
    isVisible () {
      if (this.prop && this.customColumnList && this.customColumnList.length) {
        let column = this.customColumnList.find(item => item.prop === this.prop)
        return column ? column.visible : true
      }
      return true
    },
    bindProps () {
      let sortBy
      let clsName = this.isReadonly ? 'elx_readonly ' : 'elx_edit '
      if (this.className) {
        clsName += `${this.className} `
      }
      if (this.renderOpts.autofocus) {
        clsName += 'elx_autofocus '
      }
      if (XEUtils.isFunction(this.sortBy)) {
        sortBy = this.sortBy
      } else if (XEUtils.isString(this.sortBy)) {
        sortBy = `data.${this.sortBy}`
      } else if (XEUtils.isArray(this.sortBy)) {
        sortBy = this.sortBy.map(name => `data.${name}`)
      } else if (this.sortable && this.prop) {
        sortBy = `data.${this.prop}`
      }
      return {
        type: this.scrollLoad ? null : this.type,
        label: this.label,
        columnKey: this.columnKey,
        prop: this.prop,
        width: this.width,
        minWidth: this.minWidth,
        fixed: this.fixed,
        sortable: this.sortable,
        sortMethod: this.sortMethod ? this.sortMethodEvent : this.sortMethod,
        sortBy,
        sortOrders: this.sortOrders,
        resizable: this.resizable,
        showOverflowTooltip: this.showOverflowTooltip,
        align: this.align,
        headerAlign: this.headerAlign,
        className: `elx-editable-column ${XEUtils.trimRight(clsName)}`,
        labelClassName: this.labelClassName,
        selectable: this.selectableEvent,
        reserveSelection: this.reserveSelection,
        filters: this.filters,
        filterPlacement: this.filterPlacement,
        filterMultiple: this.filterMultiple,
        filterMethod: this.filterMethod ? this.filterMethodEvent : this.filterMethod,
        filteredValue: this.filteredValue
      }
    }
  },
  methods: {
    getHeadScope (scope) {
      return {
        column: scope.column,
        store: scope.store,
        $index: scope.$index,
        $render: this.renderOpts,
        _self: scope._self
      }
    },
    getIndexScope (scope) {
      return {
        row: scope.row.data,
        column: scope.column,
        store: scope.store,
        $index: this.getRowIndex(scope),
        $render: this.renderOpts,
        _self: scope._self,
        _row: scope.row
      }
    },
    getRowScope (scope) {
      return {
        row: scope.row.data,
        column: scope.column,
        store: scope.store,
        $index: scope.$index,
        $render: this.renderOpts,
        _self: scope._self,
        _row: scope.row
      }
    },
    getVaildScope (scope) {
      return {
        rule: scope.row.validRule || {},
        row: scope.row.data,
        column: scope.column,
        store: scope.store,
        $index: scope.$index,
        $render: this.renderOpts,
        _self: scope._self,
        _row: scope.row
      }
    },
    getRowIdentity (row, column) {
      return XEUtils.get(row.data, column.property)
    },
    getRendProps (scope) {
      let size = this.$editable.size
      let props = this.renderOpts.props || this.renderOpts.attrs
      return size ? Object.assign({ size }, props) : props
    },
    getRendEvents ({ $index, row, column, store }) {
      let type = 'change'
      let scope = { $index, row: row.data, column, store, $render: this.renderOpts, _row: row }
      switch (this.compName) {
        case 'ElAutocomplete':
          type = 'select'
          break
        case 'ElInput':
        case 'ElInputNumber':
          type = 'input'
          break
      }
      let defEvent = { [type]: evnt => this.$editable.updateStatus(scope) }
      if (this.renderOpts.events) {
        return Object.assign(defEvent, XEUtils.objectMap(this.renderOpts.events, cb => function () {
          cb.apply(null, [scope].concat(Array.from(arguments)))
        }))
      }
      return defEvent
    },
    getRowIndex (scope) {
      return this.$editable.visibleStart + scope.$index
    },
    formatRowIndex (scope) {
      let $index = this.getRowIndex(scope)
      return this.index ? this.index($index) : $index + 1
    },
    formatColumnLabel (scope) {
      if (this.formatter) {
        return this.formatter(scope.row.data, scope.column, this.getRowIdentity(scope.row, scope.column), scope.$index)
      }
      switch (this.compName) {
        case 'ElSelect':
          return this.getSelectLabel(scope)
        case 'ElCascader':
          return this.getCascaderLabel(scope)
        case 'ElTimePicker':
          return this.getTimePickerLabel(scope)
        case 'ElDatePicker':
          return this.getDatePickerLabel(scope)
      }
      return this.getRowIdentity(scope.row, scope.column)
    },
    getSelectLabel ({ row, column }) {
      let renderOpts = this.renderOpts
      let props = renderOpts.props || this.renderOpts.attrs || {}
      let labelProp = renderOpts.optionProps.label
      let valueProp = renderOpts.optionProps.value
      let optionsProp = renderOpts.optionGroupProps.options
      let value = this.getRowIdentity(row, column)
      if (!(value === null || value === undefined || value === '')) {
        return (props.multiple ? value : [value]).map(renderOpts.optionGroups ? value => {
          let selectItem = XEUtils.find(renderOpts.optionGroups, group => group[optionsProp].find(item => item[valueProp] === value))
          return selectItem ? selectItem[labelProp] : null
        } : value => {
          let selectItem = XEUtils.find(renderOpts.options, item => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';')
      }
      return null
    },
    getCascaderLabel ({ row, column }) {
      let values = this.getRowIdentity(row, column) || []
      let labels = []
      let props = this.renderOpts.props || this.renderOpts.attrs || {}
      let matchCascaderData = function (index, list) {
        let val = values[index]
        if (list && values.length > index) {
          list.forEach(item => {
            if (item.value === val) {
              labels.push(item.label)
              matchCascaderData(++index, item.children)
            }
          })
        }
      }
      matchCascaderData(0, props.options || [])
      return (props.showAllLevels === false ? labels.slice(labels.length - 1, labels.length) : labels).join(` ${props.separator || '/'} `)
    },
    getTimePickerLabel ({ row, column }) {
      let value = this.getRowIdentity(row, column)
      let props = this.renderOpts.props || this.renderOpts.attrs || {}
      return XEUtils.toDateString(value, props.format || 'hh:mm:ss')
    },
    getDatePickerLabel ({ row, column }) {
      let value = this.getRowIdentity(row, column)
      let props = this.renderOpts.props || this.renderOpts.attrs || {}
      switch (props.type) {
        case 'week':
          return this.getFormatDate(value, props, 'yyyywWW')
        case 'month':
          return this.getFormatDate(value, props, 'yyyy-MM')
        case 'year':
          return this.getFormatDate(value, props, 'yyyy')
        case 'dates':
          return this.getFormatDates(value, props, ', ', 'yyyy-MM-dd')
        case 'daterange':
          return this.getFormatDates(value, props, ` ${props.rangeSeparator || '-'} `, 'yyyy-MM-dd')
        case 'datetimerange':
          return this.getFormatDates(value, props, ` ${props.rangeSeparator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
      }
      return this.getFormatDate(value, props, 'yyyy-MM-dd')
    },
    getFormatDate (value, props, defaultFormat) {
      return XEUtils.toDateString(value, props.format || defaultFormat)
    },
    getFormatDates (values, props, separator, defaultFormat) {
      return XEUtils.toArray(values).map(date => this.getFormatDate(date, props, defaultFormat)).join(separator)
    },
    checkRequired ({ column, store }) {
      let property = column.property
      let editRules = this.$editable.editRules
      if (property && editRules) {
        let columnRules = XEUtils.get(editRules, property)
        if (columnRules) {
          return columnRules.some(rule => rule.required === true)
        }
      }
      return false
    },
    isEditRender ({ row, column }) {
      return this.renderOpts.type === 'visible' || (row.editActive && (this.editConfig.mode === 'row' ? row.editActive : row.editActive === column.property))
    },
    checkIcon ({ column, store }) {
      return column.property && this.editConfig.showIcon
    },
    sortByEvent (row, index) {
      return this.sortBy(row.data, index)
    },
    sortMethodEvent (v1, v2) {
      return this.sortMethod(v1.data, v2.data)
    },
    selectableEvent (row, index) {
      if (this.selectable) {
        return this.selectable(row.data, index)
      }
      return !row.data._disabled
    },
    filterMethodEvent (value, row, column) {
      return this.filterMethod(value, row.data, column)
    },
    checkAllEvent () {
      let status = this.checkAll
      let _fullData = this.$editable._fullData
      _fullData.forEach(item => {
        item.scrollChecked = status
      })
      this.isIndeterminate = false
      this.$editable.$emit('select-all', status ? _fullData.map(item => item ? item.data : item) : [])
      this.$editable._updateSelection(status ? _fullData : [])
    },
    checkRowEvent ({ row }) {
      let selection = this.handleCheckRow()
      this.$editable.$emit('select', selection.map(item => item ? item.data : item), row.data)
      this.$editable._updateSelection(selection)
    },
    handleCheckRow () {
      if (this.type === 'selection' && this.scrollLoad) {
        let _fullData = this.$editable._fullData
        let selection = _fullData.filter(item => item.scrollChecked)
        let isIndeterminate = selection.length > 0
        this.isIndeterminate = isIndeterminate
        if (isIndeterminate && _fullData.every(item => item.scrollChecked)) {
          this.checkAll = true
          this.isIndeterminate = false
        } else {
          this.checkAll = false
        }
        return selection
      }
    }
  }
}
</script>

<style src="../../../style/editable-column.css"></style>

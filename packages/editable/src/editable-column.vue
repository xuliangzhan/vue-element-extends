<template>
  <el-table-column v-if="type === 'selection' || group" v-bind="attrs">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'index'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="header" v-bind="getHeadScope(scope)">#</slot>
    </template>
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'expand'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="header" v-bind="getHeadScope(scope)"></slot>
    </template>
    <template slot-scope="scope">
      <slot v-bind="getRowScope(scope)"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="editRender" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="header" v-bind="getHeadScope(scope)">
        <i v-if="checkRequired(scope)" class="editable-required-icon"></i>
        <i v-if="checkIcon(scope)" class="el-icon-edit-outline editable-header-icon"></i>
        {{ scope.column.label }}
      </slot>
    </template>
    <template slot-scope="scope">
      <template v-if="isEditRender(scope)">
        <slot name="edit" v-bind="getRowScope(scope)">
          <template v-if="compName === 'ElSelect'">
            <el-select v-if="renderOpts.optionGroups" v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)">
              <el-option-group v-for="(group, gIndex) in renderOpts.optionGroups" :key="gIndex" :label="group[renderOpts.optionGroupProps.label]" v-bind="group.attrs">
                <el-option v-for="(item, index) in group[renderOpts.optionGroupProps.options]" :key="index" :value="item[renderOpts.optionProps.value]" :label="item[renderOpts.optionProps.label]" v-bind="item.attrs"></el-option>
              </el-option-group>
            </el-select>
            <el-select v-else v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)">
              <el-option v-for="(item, index) in renderOpts.options" :key="index" :value="item[renderOpts.optionProps.value]" :label="item[renderOpts.optionProps.label]" v-bind="item.attrs"></el-option>
            </el-select>
          </template>
          <template v-else-if="comps.includes(compName)">
            <component :is="compName" v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></component>
          </template>
          <template v-else>
            <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></el-input>
          </template>
        </slot>
      </template>
      <template v-else>
        <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
      </template>
      <template v-if="scope.row.validActive && scope.row.validActive === scope.column.property">
        <template v-if="scope.row.config.useDefaultValidTip">
          <template v-if="scope.row.showValidMsg">
            <slot name="valid" v-bind="getVaildScope(scope)">
              <div class="editable-valid_error">
                <span class="valid-message">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</span>
              </div>
            </slot>
          </template>
        </template>
        <template v-else-if="!scope.row.config.validTooltip.disabled">
          <el-tooltip :value="scope.row.showValidMsg" v-bind="scope.row.config.validTooltip">
            <div class="editable-valid_wrapper"></div>
            <div slot="content">
              <slot name="valid" v-bind="getVaildScope(scope)">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</slot>
            </div>
          </el-tooltip>
        </template>
      </template>
    </template>
  </el-table-column>
  <el-table-column v-else v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="header" v-bind="getHeadScope(scope)">{{ scope.column.label }}</slot>
    </template>
    <template slot-scope="scope">
      <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
    </template>
  </el-table-column>
</template>

<script>
import XEUtils from 'xe-utils'

export default {
  name: 'ElEditableColumn',
  props: {
    group: Boolean,
    editRender: Object,

    /**
     * 还原 ElTableColumn 所有属性
     */
    index: [Number, Function],
    type: String,
    label: String,
    columnKey: String,
    prop: String,
    width: String,
    minWidth: String,
    fixed: [Boolean, String],
    sortable: [Boolean, String],
    sortMethod: Function,
    sortBy: [String, Array, Function],
    sortOrders: Array,
    resizable: { type: Boolean, default: true },
    formatter: Function,
    showOverflowTooltip: Boolean,
    align: { type: String, default: 'left' },
    headerAlign: String,
    className: { type: String, default: '' },
    labelClassName: String,
    selectable: Function,
    reserveSelection: Boolean,
    filters: Array,
    filterPlacement: String,
    filterMultiple: { type: Boolean, default: true },
    filterMethod: Function,
    filteredValue: Array
  },
  inject: [
    '$editable'
  ],
  data () {
    return {
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
    isReadonly () {
      return !this.editRender
    },
    compName () {
      return this.renderOpts.name
    },
    attrs () {
      let sortBy
      let clsName = this.isReadonly ? 'editable-col_readonly ' : 'editable-col_edit '
      if (this.className) {
        clsName += `${this.className} `
      }
      if (this.renderOpts.autofocus) {
        clsName += 'editable-col_autofocus '
      }
      if (XEUtils.isFunction(this.sortBy)) {
        sortBy = this.sortBy
      } else if (XEUtils.isString(this.sortBy)) {
        sortBy = `data.${this.sortBy}`
      } else if (XEUtils.isArray(this.sortBy)) {
        sortBy = this.sortBy.map(name => `data.${name}`)
      } else if (this.prop) {
        sortBy = `data.${this.prop}`
      }
      return {
        index: this.index,
        type: this.type,
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
        className: `editable-column ${XEUtils.trimRight(clsName)}`,
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
        $index: scope.$index,
        column: scope.column,
        store: scope.store,
        editRender: this.renderOpts,
        _self: scope._self
      }
    },
    getRowScope (scope) {
      return {
        $index: scope.$index,
        row: scope.row.data,
        column: scope.column,
        store: scope.store,
        editRender: this.renderOpts,
        _self: scope._self,
        _row: scope.row
      }
    },
    getVaildScope (scope) {
      return {
        rule: scope.row.validRule || {},
        $index: scope.$index,
        row: scope.row.data,
        column: scope.column,
        store: scope.store,
        editRender: this.renderOpts,
        _self: scope._self,
        _row: scope.row
      }
    },
    getRowIdentity (row, column) {
      return XEUtils.get(row.data, column.property)
    },
    getRendAttrs (scope) {
      let size = scope.row.config.size
      return Object.assign({ size }, this.renderOpts.attrs)
    },
    getRendEvents ({ $index, row, column, store }) {
      let type = 'change'
      let scope = { $index, row: row.data, column, store, editRender: this.renderOpts, _row: row }
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
      let attrs = renderOpts.attrs || {}
      let labelProp = renderOpts.optionProps.label
      let valueProp = renderOpts.optionProps.value
      let optionsProp = renderOpts.optionGroupProps.options
      let value = this.getRowIdentity(row, column)
      if (value) {
        return (attrs.multiple ? value : [value]).map(renderOpts.optionGroups ? value => {
          let selectItem = renderOpts.optionGroups.find(group => group[optionsProp].find(item => item[valueProp] === value))
          return selectItem ? selectItem[labelProp] : null
        } : value => {
          let selectItem = renderOpts.options.find(item => item[valueProp] === value)
          return selectItem ? selectItem[labelProp] : null
        }).join(';')
      }
      return null
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
    getCascaderLabel ({ row, column }) {
      let values = this.getRowIdentity(row, column) || []
      let labels = []
      let attrs = this.renderOpts.attrs || {}
      this.matchCascaderData(values, 0, attrs.options || [], labels)
      return labels.join(` ${attrs.separator || '/'} `)
    },
    getTimePickerLabel ({ row, column }) {
      let value = this.getRowIdentity(row, column)
      let attrs = this.renderOpts.attrs || {}
      return XEUtils.toDateString(value, attrs.format || 'hh:mm:ss')
    },
    getDatePickerLabel ({ row, column }) {
      let value = this.getRowIdentity(row, column)
      let attrs = this.renderOpts.attrs || {}
      switch (attrs.type) {
        case 'week':
          return this.getFormatDate(value, attrs, 'yyyywWW')
        case 'month':
          return this.getFormatDate(value, attrs, 'yyyy-MM')
        case 'year':
          return this.getFormatDate(value, attrs, 'yyyy')
        case 'dates':
          return this.getFormatDates(value, attrs, ', ', 'yyyy-MM-dd')
        case 'daterange':
          return this.getFormatDates(value, attrs, ` ${attrs.rangeSeparator || '-'} `, 'yyyy-MM-dd')
        case 'datetimerange':
          return this.getFormatDates(value, attrs, ` ${attrs.rangeSeparator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
      }
      return this.getFormatDate(value, attrs, 'yyyy-MM-dd')
    },
    getFormatDate (value, attrs, defaultFormat) {
      return XEUtils.toDateString(value, attrs.format || defaultFormat)
    },
    getFormatDates (values, attrs, separator, defaultFormat) {
      return XEUtils.toArray(values).map(date => this.getFormatDate(date, attrs, defaultFormat)).join(separator)
    },
    checkRequired ({ column, store }) {
      if (column.property && this.$editable && this.$editable.editRules) {
        let rules = this.$editable.editRules[column.property]
        if (rules) {
          return rules.some(rule => rule.required === true)
        }
      }
      return false
    },
    isEditRender ({ row, column }) {
      return this.renderOpts.type === 'visible' || (row.editActive && (row.config.mode === 'row' ? row.editActive : row.editActive === column.property))
    },
    checkIcon ({ column, store }) {
      return column.property && this.$editable && this.$editable.editConfig ? !(this.$editable.editConfig.showIcon === false) : true
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
    }
  }
}
</script>

<style src="../../../style/editable-column.css"></style>

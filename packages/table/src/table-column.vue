<template>
  <el-table-column v-if="isVisible && (type === 'selection' || group)" v-bind="attrs">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="isVisible && type === 'index'" v-bind="attrs">
    <template v-slot:header="scope">
      <slot name="header" v-bind="scope">#</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="scope"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible" v-bind="attrs">
    <template v-slot:header="scope">
      <slot name="header" v-bind="scope">{{ scope.column.label }}</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="scope">{{ formatColumnLabel(scope) }}</slot>
    </template>
  </el-table-column>
</template>

<script>
import XEUtils from 'xe-utils'

export default {
  name: 'ElxTableColumn',
  props: {
    group: Boolean,
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
  computed: {
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
    attrs () {
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
        sortMethod: this.sortMethod,
        sortBy: this.sortBy,
        sortOrders: this.sortOrders,
        resizable: this.resizable,
        showOverflowTooltip: this.showOverflowTooltip,
        align: this.align,
        headerAlign: this.headerAlign,
        className: `elx-table-column ${this.className}`,
        labelClassName: this.labelClassName,
        selectable: this.selectableEvent,
        reserveSelection: this.reserveSelection,
        filters: this.filters,
        filterPlacement: this.filterPlacement,
        filterMultiple: this.filterMultiple,
        filterMethod: this.filterMethod,
        filteredValue: this.filteredValue
      }
    }
  },
  methods: {
    getRowIdentity (row, column) {
      return XEUtils.get(row, column.property)
    },
    formatColumnLabel (scope) {
      if (this.formatter) {
        return this.formatter(scope.row, scope.column, this.getRowIdentity(scope.row, scope.column), scope.$index)
      }
      return this.getRowIdentity(scope.row, scope.column)
    }
  }
}
</script>

<style src="../../../style/table-column.css"></style>

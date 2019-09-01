<template>
  <el-table-column v-if="isVisible && (type === 'selection' || group || isGroup)" v-bind="bindProps">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="isVisible && type === 'index'" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="scope">#</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="getIndexScope(scope)">{{ formatRowIndex(scope) }}</slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible && type === 'expand'" v-bind="bindProps">
    <template v-slot:header="scope">
      <slot name="header" v-bind="scope">{{ scope.column.label }}</slot>
    </template>
    <template v-slot="scope">
      <slot v-bind="scope"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="isVisible" v-bind="bindProps">
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
import PropsStatic from '../../editable/src/props'

export default {
  name: 'ElxTableColumn',
  props: {
    group: Boolean,
    ...PropsStatic.tableColumn
  },
  inject: [
    '$table'
  ],
  computed: {
    customColumnList () {
      return this.$table.columnList
    },
    isGroup () {
      return this.$slots.default && this.$slots.default.some(item => item && item.componentOptions && item.componentOptions.tag === 'elx-table-column')
    },
    isVisible () {
      if (this.prop && this.customColumnList && this.customColumnList.length) {
        let column = this.customColumnList.find(item => item.prop === this.prop)
        return column ? column.visible : true
      }
      return true
    },
    bindProps () {
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
        selectable: this.selectable,
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
    getIndexScope (scope) {
      return {
        row: scope.row,
        column: scope.column,
        store: scope.store,
        $index: this.getRowIndex(scope),
        _self: scope._self
      }
    },
    getRowIdentity (row, column) {
      return XEUtils.get(row, column.property)
    },
    getRowIndex (scope) {
      return this.$table.visibleStart + scope.$index
    },
    formatRowIndex (scope) {
      let $index = this.getRowIndex(scope)
      return this.index ? this.index($index) : $index + 1
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

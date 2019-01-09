<template>
  <el-table-column
    :className="editRender ? 'editable-column edit' : 'editable-column view'"
    :label="label"
    :columnKey="columnKey"
    :prop="prop"
    :width="width"
    :minWidth="minWidth">
    <template slot-scope="scope">
      <template v-if="!editRender">{{ scope.row.data[scope.column.property] }}</template>
      <template v-else-if="editRender.name === 'ElSwitch'">
        <el-switch v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-switch>
      </template>
      <template v-else>
        <template v-if="scope.row.editable.active === scope.column.property">
          <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
            <template v-if="editRender.name === 'ElSelect'">
              <el-select v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs">
                <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="editRender.optionAttrs"></el-option>
              </el-select>
            </template>
            <template v-else-if="editRender.name === 'ElCascader'">
              <el-cascader v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-cascader>
            </template>
            <template v-else-if="editRender.name === 'ElDatePicker'">
              <el-date-picker v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-date-picker>
            </template>
            <template v-else-if="editRender.name === 'ElInputNumber'">
              <el-input-number v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-input-number>
            </template>
            <template v-else>
              <el-input v-model="scope.row.data[scope.column.property]"></el-input>
            </template>
          </slot>
        </template>
        <template v-else>
          <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
            <template v-if="editRender.name === 'ElSelect'">{{ getSelectLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElCascader'">{{ getCascaderLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElDatePicker'">{{ getDatePickerLabel(scope) }}</template>
            <template v-else>{{ scope.row.data[scope.column.property] }}</template>
          </slot>
        </template>
      </template>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'ElEditableColumn',
  props: {
    editRender: Object,
    label: String,
    columnKey: String,
    prop: String,
    width: String,
    minWidth: String
  },
  methods: {
    getSelectLabel (scope) {
      let value = scope.row.data[scope.column.property]
      let selectItem = this.editRender.options.find(item => item.value === value)
      return selectItem ? selectItem.label : null
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
    getCascaderLabel (scope) {
      let values = scope.row.data[scope.column.property] || []
      let labels = []
      this.matchCascaderData(values, 0, this.editRender.attrs.options, labels)
      return labels.join(this.editRender.attrs ? this.editRender.attrs.separator || '/' : '/')
    },
    getDatePickerLabel (scope) {
      let value = scope.row.data[scope.column.property]
      return this.$utils.toDateString(value, this.editRender.attrs ? this.editRender.attrs.format : null)
    }
  }
}
</script>

<style lang="scss">
.editable {
  .editable-column {
    &.active {
      padding: 0;
    }
    .cell {
      >.edit-input,
      >.el-select {
        width: 100%;
      }
    }
  }
}
</style>

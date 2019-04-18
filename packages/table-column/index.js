import ElxTableColumn from '../table/src/table-column'

ElxTableColumn.install = function (Vue) {
  Vue.component(ElxTableColumn.name, ElxTableColumn)
}

export const TableColumn = ElxTableColumn
export default ElxTableColumn

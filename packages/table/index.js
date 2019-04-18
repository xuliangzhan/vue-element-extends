import ElxTable from '../table/src/table'

ElxTable.install = function (Vue) {
  Vue.component(ElxTable.name, ElxTable)
}

export const Table = ElxTable
export default ElxTable

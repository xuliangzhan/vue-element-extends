import Table from './table'
import TableColumn from './table-column'
import Editable from './editable'
import EditableColumn from './editable-column'

const components = [
  Table,
  TableColumn,
  Editable,
  EditableColumn
]

const install = function (Vue) {
  if (!install.installed) {
    components.map(component => Vue.component(component.name, component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  Table,
  TableColumn,
  Editable,
  EditableColumn
}

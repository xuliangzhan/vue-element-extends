import Vue from 'vue'
import Router from 'vue-router'

const TableBase1 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base1')
const TableBase2 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base2')
const TableBase3 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base3')
const TableBase4 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base4')
const TableBase5 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base5')
const TableBase6 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base6')
const TableBase7 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base7')
const TableBase8 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base8')
const TableBase9 = () => import(/* webpackChunkName: "table-base" */ './views/table/Base9')
const TableCustom1 = () => import(/* webpackChunkName: "table-custom" */ './views/table/Custom1')
const TableCustom2 = () => import(/* webpackChunkName: "table-custom" */ './views/table/Custom2')
const TableCustom3 = () => import(/* webpackChunkName: "table-custom" */ './views/table/Custom3')
const TableScroll = () => import(/* webpackChunkName: "table-scroll" */ './views/table/Scroll')

const EditableManual1 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual1')
const EditableManual2 = () => import(/* webpackChunkName: "editable-anual" */ './views/editable/Manual2')
const EditableManual3 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual3')
const EditableManual4 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual4')
const EditableManual5 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual5')
const EditableManual6 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual6')
const EditableManual7 = () => import(/* webpackChunkName: "editable-manual" */ './views/editable/Manual7')
const EditableClick1 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click1')
const EditableClick2 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click2')
const EditableClick3 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click3')
const EditableClick4 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click4')
const EditableClick5 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click5')
const EditableClick6 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click6')
const EditableClick7 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click7')
const EditableClick8 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click8')
const EditableClick9 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click9')
const EditableClick10 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click10')
const EditableClick11 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click11')
const EditableClick12 = () => import(/* webpackChunkName: "editable-click" */ './views/editable/Click12')
const EditableDblclick1 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick1')
const EditableDblclick2 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick2')
const EditableDblclick3 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick3')
const EditableDblclick4 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick4')
const EditableDblclick5 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick5')
const EditableDblclick6 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick6')
const EditableDblclick7 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick7')
const EditableDblclick8 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/Dblclick8')
const EditableMultiComp1 = () => import(/* webpackChunkName: "editable-dblclick" */ './views/editable/MultiComp1')
const EditableExcel1 = () => import(/* webpackChunkName: "editable-excel" */ './views/editable/Excel1')
const EditableExcel2 = () => import(/* webpackChunkName: "editable-excel" */ './views/editable/Excel2')
const EditableExcel3 = () => import(/* webpackChunkName: "editable-excel" */ './views/editable/Excel3')
const EditableExcel4 = () => import(/* webpackChunkName: "editable-excel" */ './views/editable/Excel4')
const EditableExcel5 = () => import(/* webpackChunkName: "editable-excel5" */ './views/editable/Excel5')
const EditableScroll1 = () => import(/* webpackChunkName: "editable-scroll" */ './views/editable/Scroll1')
const EditableScroll2 = () => import(/* webpackChunkName: "editable-scroll" */ './views/editable/Scroll2')
const EditableScroll3 = () => import(/* webpackChunkName: "editable-scroll" */ './views/editable/Scroll3')
const EditableScroll4 = () => import(/* webpackChunkName: "editable-scroll" */ './views/editable/Scroll4')
const EditableScroll5 = () => import(/* webpackChunkName: "editable-scroll" */ './views/editable/Scroll5')

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: {
        name: 'EditableClick1'
      }
    },
    {
      path: '/table/base1',
      name: 'TableBase1',
      component: TableBase1
    },
    {
      path: '/table/base2',
      name: 'TableBase2',
      component: TableBase2
    },
    {
      path: '/table/base3',
      name: 'TableBase3',
      component: TableBase3
    },
    {
      path: '/table/base4',
      name: 'TableBase4',
      component: TableBase4
    },
    {
      path: '/table/base5',
      name: 'TableBase5',
      component: TableBase5
    },
    {
      path: '/table/base6',
      name: 'TableBase6',
      component: TableBase6
    },
    {
      path: '/table/base7',
      name: 'TableBase7',
      component: TableBase7
    },
    {
      path: '/table/base8',
      name: 'TableBase8',
      component: TableBase8
    },
    {
      path: '/table/base9',
      name: 'TableBase9',
      component: TableBase9
    },
    {
      path: '/table/custom1',
      name: 'TableCustom1',
      component: TableCustom1
    },
    {
      path: '/table/custom2',
      name: 'TableCustom2',
      component: TableCustom2
    },
    {
      path: '/table/custom3',
      name: 'TableCustom3',
      component: TableCustom3
    },
    {
      path: '/table/scroll/:number',
      name: 'TableScroll',
      component: TableScroll
    },
    {
      path: '/editable/manual1',
      name: 'EditableManual1',
      component: EditableManual1
    },
    {
      path: '/editable/manual2',
      name: 'EditableManual2',
      component: EditableManual2
    },
    {
      path: '/editable/manual3',
      name: 'EditableManual3',
      component: EditableManual3
    },
    {
      path: '/editable/manual4',
      name: 'EditableManual4',
      component: EditableManual4
    },
    {
      path: '/editable/manual5',
      name: 'EditableManual5',
      component: EditableManual5
    },
    {
      path: '/editable/manual6',
      name: 'EditableManual6',
      component: EditableManual6
    },
    {
      path: '/editable/manual7',
      name: 'EditableManual7',
      component: EditableManual7
    },
    {
      path: '/editable/scroll1/:number',
      name: 'EditableScroll1',
      component: EditableScroll1
    },
    {
      path: '/editable/scroll2/:number',
      name: 'EditableScroll2',
      component: EditableScroll2
    },
    {
      path: '/editable/scroll3/:number',
      name: 'EditableScroll3',
      component: EditableScroll3
    },
    {
      path: '/editable/scroll4/:number',
      name: 'EditableScroll4',
      component: EditableScroll4
    },
    {
      path: '/editable/scroll5/:number',
      name: 'EditableScroll5',
      component: EditableScroll5
    },
    {
      path: '/editable/click1',
      name: 'EditableClick1',
      component: EditableClick1
    },
    {
      path: '/editable/click2',
      name: 'EditableClick2',
      component: EditableClick2
    },
    {
      path: '/editable/click3',
      name: 'EditableClick3',
      component: EditableClick3
    },
    {
      path: '/editable/click4',
      name: 'EditableClick4',
      component: EditableClick4
    },
    {
      path: '/editable/click5',
      name: 'EditableClick5',
      component: EditableClick5
    },
    {
      path: '/editable/click6',
      name: 'EditableClick6',
      component: EditableClick6
    },
    {
      path: '/editable/click7',
      name: 'EditableClick7',
      component: EditableClick7
    },
    {
      path: '/editable/click8',
      name: 'EditableClick8',
      component: EditableClick8
    },
    {
      path: '/editable/click9',
      name: 'EditableClick9',
      component: EditableClick9
    },
    {
      path: '/editable/click10',
      name: 'EditableClick10',
      component: EditableClick10
    },
    {
      path: '/editable/click11',
      name: 'EditableClick11',
      component: EditableClick11
    },
    {
      path: '/editable/click12',
      name: 'EditableClick12',
      component: EditableClick12
    },
    {
      path: '/editable/dblclick1',
      name: 'EditableDblclick1',
      component: EditableDblclick1
    },
    {
      path: '/editable/dblclick2',
      name: 'EditableDblclick2',
      component: EditableDblclick2
    },
    {
      path: '/editable/dblclick3',
      name: 'EditableDblclick3',
      component: EditableDblclick3
    },
    {
      path: '/editable/dblclick4',
      name: 'EditableDblclick4',
      component: EditableDblclick4
    },
    {
      path: '/editable/dblclick5',
      name: 'EditableDblclick5',
      component: EditableDblclick5
    },
    {
      path: '/editable/dblclick6',
      name: 'EditableDblclick6',
      component: EditableDblclick6
    },
    {
      path: '/editable/dblclick7',
      name: 'EditableDblclick7',
      component: EditableDblclick7
    },
    {
      path: '/editable/dblclick8',
      name: 'EditableDblclick8',
      component: EditableDblclick8
    },
    {
      path: '/editable/multiComp1',
      name: 'EditableMultiComp1',
      component: EditableMultiComp1
    },
    {
      path: '/editable/excel1',
      name: 'EditableExcel1',
      component: EditableExcel1
    },
    {
      path: '/editable/excel2',
      name: 'EditableExcel2',
      component: EditableExcel2
    },
    {
      path: '/editable/excel3',
      name: 'EditableExcel3',
      component: EditableExcel3
    },
    {
      path: '/editable/excel4',
      name: 'EditableExcel4',
      component: EditableExcel4
    },
    {
      path: '/editable/excel5',
      name: 'EditableExcel5',
      component: EditableExcel5
    }
  ]
})

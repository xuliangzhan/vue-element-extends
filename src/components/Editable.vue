<template>
  <el-table
    class="editable"
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
    @cell-click="cellClick">
    <slot></slot>
  </el-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ElEditable',
  props: {
    data: Array,
    height: [String, Number],
    maxHeight: [String, Number],
    stripe: Boolean,
    border: Boolean,
    size: String,
    fit: { type: Boolean, default: true },
    showHeader: { type: Boolean, default: true },
    highlightCurrentRow: Boolean,
    currentRowKey: [String, Number]
  },
  data () {
    return {
      datas: [],
      lastActive: null
    }
  },
  computed: {
    ...mapGetters([
      'onclick'
    ])
  },
  watch: {
    data (value) {
      this.updateData()
    },
    onclick (evnt) {
      if (this.lastActive) {
        let target = evnt.target
        let { cell } = this.lastActive
        while (target && target.nodeType && target !== document) {
          if (target === cell) {
            return
          }
          target = target.parentNode
        }
        this.clearActive()
      }
    }
  },
  created () {
    this.updateData()
  },
  methods: {
    updateData () {
      this.datas = this.data.map(item => {
        return {
          data: item,
          store: [],
          editable: {
            active: null
          }
        }
      })
    },
    clearActive () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editable.active = null
      })
      Array.from(this.$el.querySelectorAll('.active.editable-column')).forEach(elem => {
        elem.className = elem.className.replace(/\s?active/, '')
      })
    },
    cellClick (row, column, cell, event) {
      this.clearActive()
      this.lastActive = { row, column, cell }
      cell.className += ` active`
      row.editable.active = column.property
      this.$emit('cell-click', row.data, column, cell, event)
    }
  }
}
</script>

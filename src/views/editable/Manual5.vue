<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">表格树：自动保存</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent('0')">新增目录</el-button>
      <el-button type="success" size="mini" @click="insertEvent('1')">新增文件</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="my-table11"
      size="small"
      :data.sync="list"
      :row-class-name="treeRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod}"
      @clear-active="clearActiveEvent"
      @row-click="rowClickEvent"
      style="width: 100%">
      <el-editable-column class-name="tree-operate-node" width="200">
        <template slot="head">
          <el-checkbox v-model="treeAllCheck" :indeterminate="treeAllIndeterminate" @change="treeAllChange(treeAllCheck)"></el-checkbox>
        </template>
        <template slot-scope="scope">
          <i class="tree-expand-icon fa" :class="treeIcons(scope.row)" @click="toggleCollapseNode(scope.row)"></i>
          <el-checkbox v-model="scope.row.isCheck" :indeterminate="scope.row.indeterminate" @change="treeNodeChange(scope.row)"></el-checkbox>
        </template>
      </el-editable-column>
      <el-editable-column prop="fileName" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="fileSize" label="大小" width="100" :formatter="formatColumnSize"></el-editable-column>
      <el-editable-column prop="createDate" label="创建时间" width="160" :formatter="formatColumnDate"></el-editable-column>
      <el-editable-column prop="updateDate" label="最后修改时间" width="160" :formatter="formatColumnDate"></el-editable-column>
      <el-editable-column label="操作" width="220">
        <template slot-scope="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      isClearActiveFlag: true,
      treeAllCheck: false,
      treeAllIndeterminate: false,
      currentRow: null,
      list: [],
      treeNode: [],
      treeList: [],
      validRules: {
        fileName: [
          { required: true, message: '请输入名称', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.findList()
    },
    clearActiveMethod ({ row }) {
      return this.isClearActiveFlag
    },
    findList () {
      this.loading = true
      return this.loadList().then(data => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    loadList () {
      return this.getDataJSON().then(data => {
        this.initTreeList(data)
      })
    },
    /** Tree func start */
    getChildren (row) {
      return this.treeList.filter(item => item.parentId === row.id)
    },
    hasDirectory (row) {
      return this.getChildren(row).length > 0
    },
    reloedTreeList (data) {
      this.initTreeList(data, true)
    },
    initTreeList (data, isReload) {
      let treeNode = XEUtils.toArrayTree(data, { key: 'id', parentKey: 'parentId', children: 'children' })
      let treeList = XEUtils.toTreeArray(treeNode, { children: 'children' })
      if (!isReload) {
        treeList.forEach(item => {
          Object.assign(item, {
            expandNode: false,
            showNode: false,
            isCheck: false,
            indeterminate: false
          })
        })
      }
      this.treeNode = treeNode
      this.treeList = treeList
      if (!isReload) {
        treeNode.forEach((item, index) => {
          Object.assign(item, {
            treeLevel: 0,
            treeIndex: index,
            showNode: true
          })
        })
      }
      this.loadTree()
    },
    treeIcons (row) {
      let clsName = ''
      if (row.expandNode) {
        clsName = 'fa-folder-open'
      } else {
        if (row.fileType === '0') {
          clsName = 'fa-folder'
        } else {
          let type = (row.fileName || '').split('.').pop()
          switch (type) {
            case 'excel':
              clsName = 'fa-file-excel-o'
              break
            case 'word':
              clsName = 'fa-file-word-o'
              break
            case 'pdf':
              clsName = 'fa-file-pdf-o'
              break
            case 'text':
              clsName = 'fa-file-text-o'
              break
            case 'zip':
              clsName = 'fa-file-zip-o'
              break
            default:
              clsName = 'fa-file'
              break
          }
        }
      }
      return clsName
    },
    treeAllChange (value) {
      this.treeAllIndeterminate = false
      this.treeList.forEach(item => {
        item.isCheck = value
        item.indeterminate = false
      })
    },
    treeNodeChange (row) {
      if (row.isCheck) {
        row.indeterminate = false
      }
      this.treeCheckChildNode(row, row.isCheck)
      this.treeCheckParentNode(row)
    },
    treeCheckParentNode (row) {
      let parent = this.treeList.find(item => item.id === row.parentId)
      if (parent) {
        let children = this.treeList.filter(item => item.parentId === parent.id)
        parent.isCheck = children.every(item => item.isCheck)
        parent.indeterminate = !parent.isCheck && !children.every(item => !item.isCheck && !item.indeterminate)
        this.treeCheckParentNode(parent)
      } else {
        let children = this.treeNode
        this.treeAllCheck = children.every(item => item.isCheck)
        this.treeAllIndeterminate = !this.treeAllCheck && !children.every(item => !item.isCheck && !item.indeterminate)
      }
    },
    treeCheckChildNode (parent, check) {
      let children = this.treeList.filter(item => item.parentId === parent.id)
      children.forEach((child, index) => {
        child.isCheck = check
        child.treeIndex = index
        child.treeLevel = parent.treeLevel + 1
        this.treeCheckChildNode(child, check)
      })
    },
    treeCollapseNode (parent, expand) {
      let children = this.treeList.filter(item => item.parentId === parent.id)
      parent.expandNode = expand && children.length
      children.forEach((child, index) => {
        child.treeIndex = index
        child.treeLevel = parent.treeLevel + 1
        child.showNode = expand !== null ? expand : false
        this.treeCollapseNode(child, null)
      })
    },
    loadTree () {
      this.list = this.treeList.filter(item => item.showNode)
    },
    treeRowClassName ({ row, rowIndex }) {
      let clsName = `tree-level_${row.treeLevel}`
      if (this.currentRow && this.currentRow.id === row.id) {
        clsName += ' current-row'
      }
      return clsName
    },
    toggleCollapseNode (row) {
      this.treeCollapseNode(row, !row.expandNode)
      this.loadTree()
    },
    /** Tree func end */
    rowClickEvent (row, event, column) {
      this.currentRow = row
    },
    formatColumnDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue)
    },
    formatColumnSize (row, column, cellValue, index) {
      return cellValue ? `${cellValue} KB` : ''
    },
    insertEvent (type) {
      if (!this.$refs.editable.checkValid().error) {
        let selectRow = this.currentRow
        let index = selectRow ? XEUtils.findIndexOf(this.list, item => item.id === selectRow.id) : 0
        let data = {
          isNew: true,
          id: Date.now(),
          fileType: type,
          parentId: null,
          treeLevel: 0,
          treeIndex: 0,
          expandNode: false,
          showNode: true,
          isCheck: false,
          indeterminate: false
        }
        if (selectRow) {
          if (selectRow.fileType === '0' && (selectRow.expandNode || !this.getChildren(selectRow).length)) {
            selectRow.expandNode = true
            data.parentId = selectRow.id
            data.treeLevel = selectRow.treeLevel + 1
          } else {
            data.parentId = selectRow.parentId
            data.treeLevel = selectRow.treeLevel
          }
        }
        let row = this.$refs.editable.insertAt(data, selectRow ? index + 1 : 0)
        this.$nextTick(() => {
          if (selectRow) {
            let dataIndex = XEUtils.findIndexOf(this.treeList, item => item.id === selectRow.id)
            this.treeList.splice(dataIndex + 1, 0, row)
          } else {
            this.treeList.push(row)
          }
          this.reloedTreeList(this.treeList)
          this.$nextTick(() => this.$refs.editable.setActiveRow(row))
        })
      }
    },
    openActiveRowEvent (row) {
      let activeInfo = this.$refs.editable.getActiveInfo()
      // 如果当前行正在编辑中，禁止编辑其他行
      if (activeInfo) {
        if (activeInfo.row === row || !this.$refs.editable.checkValid().error) {
          if (activeInfo.isUpdate) {
            this.isClearActiveFlag = false
            MessageBox.confirm('检测到未保存的内容，是否在离开前保存修改?', '温馨提示', {
              distinguishCancelAndClose: true,
              confirmButtonText: '保存',
              cancelButtonText: '放弃修改',
              type: 'warning'
            }).then(() => {
              this.$refs.editable.setActiveRow(row, false)
              this.updateRowEvent(activeInfo.row)
            }).catch(action => {
              if (action === 'cancel') {
                this.$refs.editable.revert(activeInfo.row)
                this.$refs.editable.setActiveRow(row, false)
                Message({ message: '放弃修改并离开当前行', type: 'warning' })
              } else {
                Message({ message: '停留在当前行编辑', type: 'info' })
              }
            }).then(() => {
              this.isClearActiveFlag = true
            })
          } else {
            this.$refs.editable.setActiveRow(row)
          }
        }
      } else {
        this.$refs.editable.setActiveRow(row)
      }
    },
    cancelRowEvent (row) {
      let activeInfo = this.$refs.editable.getActiveInfo()
      if (activeInfo && activeInfo.isUpdate) {
        MessageBox.confirm('检测到未保存的内容，确定放弃修改?', '温馨提示', {
          confirmButtonText: '放弃更改',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.editable.clearActive()
            this.$refs.editable.revert(row)
          } else {
            this.$refs.editable.setActiveRow(row, false)
          }
        }).catch(e => e)
      } else {
        this.$refs.editable.clearActive()
      }
    },
    removeEvent (row) {
      MessageBox.confirm('确定删除该附件?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.updateRowEvent(row)
      }).catch(e => e)
    },
    clearActiveEvent (row, event) {
      this.updateRowEvent(row)
    },
    updateRowEvent (row) {
      this.$refs.editable.reloadRow(row)
      Message({ message: '保存成功', type: 'success' })
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
          this.$refs.editable.reloadRow(row)
          Message({ message: '保存成功', type: 'success' })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    getInsertEvent () {
      let rest = this.treeList.filter(item => item.isNew)
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    getDataJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve([
          {
            id: 100,
            parentId: null,
            fileName: '一级目录',
            fileSize: null,
            fileType: '0',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 101,
            parentId: 100,
            fileName: '二级目录',
            fileSize: null,
            fileType: '0',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 10100,
            parentId: 101,
            fileName: '文件10100.pdf',
            fileSize: 218,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 10101,
            parentId: 101,
            fileName: '文件10101.excel',
            fileSize: 512,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 102,
            parentId: 100,
            fileName: '文件102.word',
            fileSize: 1024,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 200,
            parentId: null,
            fileName: '我的文件',
            fileSize: null,
            fileType: '0',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 201,
            parentId: 200,
            fileName: '文件201.zip',
            fileSize: 1024,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 202,
            parentId: 200,
            fileName: '文件202.text',
            fileSize: 4096,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 301,
            parentId: null,
            fileName: '文件301.zip',
            fileSize: 1024,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          },
          {
            id: 401,
            parentId: null,
            fileName: '文件401.pdf',
            fileSize: 2048,
            fileType: '1',
            createDate: 1550923830095,
            updateDate: 1550923830095
          }
        ]), 350)
      })
    }
  }
}
</script>

<style scoped>
.my-table11 .error-msg {
  display: block;
  color: #fff;
  background-color: red;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1;
  padding: 10px;
  position: absolute;
  top: calc(100% + 10px);
  left: 10px;
  z-index: 9;
}
.my-table11 .error-msg:before {
  content: "";
  position: absolute;
  border: 4px solid;
  top: -8px;
  left: 20%;
  border-color: transparent transparent red transparent;
}
</style>

<style>
.my-table11 .tree-level_0 .tree-operate-node .cell {
  padding-left: 25px;
}
.my-table11 .tree-level_1 .tree-operate-node .cell {
  padding-left: 40px;
}
.my-table11 .tree-level_2 .tree-operate-node .cell {
  padding-left: 55px;
}
.my-table11 .tree-level_3 .tree-operate-node .cell {
  padding-left: 70px;
}
.my-table11 .tree-level_4 .tree-operate-node .cell {
  padding-left: 85px;
}
.my-table11 .tree-level_5 .tree-operate-node .cell {
  padding-left: 100px;
}
.my-table11 .tree-level_6 .tree-operate-node .cell {
  padding-left: 115px;
}
.my-table11 .tree-level_7 .tree-operate-node .cell {
  padding-left: 130px;
}
.my-table11 .tree-level_8 .tree-operate-node .cell {
  padding-left: 145px;
}
.my-table11 .tree-expand-icon {
  padding-right: 10px;
}
.my-table11 .editable-row .editable-column.editable-col_edit.editable-col_disabled {
  cursor: auto;
}
</style>

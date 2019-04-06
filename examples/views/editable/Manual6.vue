<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">编辑表格树：使用新增即保存方式；至于特殊需求可参考示例自行根据自身业务去实现；</p>

    <div class="manual-table6-oper">
      <el-button type="success" size="mini" @click="insertEvent('0')">新增目录</el-button>
      <el-button type="success" size="mini" @click="insertEvent('1')">新增文件</el-button>
      <el-upload
        class="manual-upload6"
        action="https://jsonplaceholder.typicode.com/posts/"
        :before-upload="handleFileBeforeUpload"
        :on-success="handleFileSuccess"
        :on-error="handleFileError"
        :show-file-list="false">
        <el-button type="primary" size="mini">上传文件</el-button>
      </el-upload>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
    </div>

    <elx-editable
      ref="editable"
      class="manual-table6"
      size="small"
      row-key="id"
      :data.sync="list"
      :row-class-name="treeRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod}"
      @row-click="rowClickEvent"
      style="width: 100%">
      <elx-editable-column prop="showNode" class-name="tree-operate-node" width="160">
        <template v-slot:header>
          <el-checkbox v-model="treeAllCheck" :indeterminate="treeAllIndeterminate" @change="treeAllChange(treeAllCheck)"></el-checkbox>
        </template>
        <template v-slot="scope">
          <i class="tree-expand-icon fa" :class="treeIcons(scope.row)" @click="toggleCollapseNode(scope.row)"></i>
          <el-checkbox v-model="scope.row.isCheck" :indeterminate="scope.row.indeterminate" @change="treeNodeChange(scope.row)"></el-checkbox>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="100"></elx-editable-column>
      <elx-editable-column prop="name" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="修改时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="220">
        <template v-slot="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="info" icon="el-icon-edit" circle @click="openActiveRowEvent(scope.row)"></el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="removeEvent(scope.row)"></el-button>
            <el-button size="mini" type="primary" icon="el-icon-download" circle></el-button>
            <el-button size="mini" type="success" icon="el-icon-share" circle></el-button>
          </template>
        </template>
      </elx-editable-column>
    </elx-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { Loading, Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      isClearActiveFlag: true,
      treeAllCheck: false,
      treeAllIndeterminate: false,
      currentRow: null,
      list: [],
      fileLoading: null,
      treeNode: [],
      treeList: [],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      return XEAjax.doGet('/api/file/list').then(({ data }) => {
        this.initTreeList(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    rowClickEvent (row, column, event) {
      if (['showNode', 'id', 'name', 'createTime', 'updateTime'].includes(column.property)) {
        this.currentRow = this.currentRow === row ? null : row
      }
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue)
    },
    formatColumnSize (row, column, cellValue, index) {
      if (XEUtils.isNumber(cellValue)) {
        let units = ['B', 'KB', 'MB', 'GB', 'TB']
        let unit = ''
        let size = XEUtils.toNumber(cellValue)
        for (let index = 0; index < units.length; index++) {
          unit = units[index]
          if (size >= 1024) {
            size = XEUtils.toFixedNumber(size / 1024, 2)
          } else {
            break
          }
        }
        return `${size} ${unit}`
      }
      return ''
    },
    clearActiveMethod ({ type, row }) {
      if (this.isClearActiveFlag && type === 'out') {
        if (!row.id || this.$refs.editable.hasRowChange(row)) {
          this.$refs.editable.clearActive()
          this.saveRowEvent(row)
          return true
        }
      }
      return this.isClearActiveFlag
    },
    handleFileBeforeUpload (file) {
      this.fileLoading = Loading.service({
        lock: true,
        text: '上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      return true
    },
    handleFileSuccess (response, file, fileList) {
      this.insertEvent('1', file, true)
      if (this.fileLoading) {
        this.fileLoading.close()
      }
    },
    handleFileError (err, file, fileList) {
      if (err) {

      }
      if (this.fileLoading) {
        this.fileLoading.close()
      }
    },
    insertEvent (type, file, isSave) {
      if (!this.$refs.editable.checkValid().error) {
        let selectRow = this.currentRow
        let isAppand = false
        let index = selectRow ? XEUtils.findIndexOf(this.list, item => item.id === selectRow.id) : -1
        let data = Object.assign({
          id: '',
          type: type,
          name: type === '0' ? '新建文件夹' : '新建文件.txt',
          size: type === '1' ? 0 : null,
          parentId: null,
          treeLevel: 0,
          treeIndex: 0,
          expandNode: false,
          showNode: true,
          isCheck: false,
          indeterminate: false
        }, file)
        if (selectRow) {
          if (selectRow.type === '0') {
            // 如果选中目录
            isAppand = true
            index += this.getChildren(selectRow).length
          } else {
            // 如果选中文件
            if (this.treeList[selectRow.parentId]) {
              index += this.getChildren(this.treeList[selectRow.parentId]).length
            } else {
              index = -1
            }
          }
          if (isAppand) {
            selectRow.expandNode = true
            data.parentId = selectRow.id
            data.treeLevel = selectRow.treeLevel + 1
          } else {
            data.parentId = selectRow.parentId
            data.treeLevel = selectRow.treeLevel
          }
        }
        let row = this.$refs.editable.insertAt(data, index)
        // 默认选中新增行
        this.currentRow = row
        this.$nextTick(() => {
          this.treeList.push(row)
          this.reloedTreeList(this.treeList)
          if (isSave) {
            // 异步保存，局部更新
            this.$refs.editable.clearActive()
            XEAjax.doPost('/api/file/add', row).then(({ data }) => {
              XEUtils.destructuring(row, data[0])
              this.$refs.editable.reloadRow(row)
              Message({ message: '保存成功', type: 'success' })
            })
          } else {
            // 默认聚焦到 name 列
            this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
          }
        })
      }
    },
    openActiveRowEvent (row) {
      this.$nextTick(() => {
        let activeInfo = this.$refs.editable.getActiveRow()
        if (activeInfo && activeInfo.isUpdate) {
          this.isClearActiveFlag = false
          MessageBox.confirm('检测到未保存的内容，请确认操作?', '温馨提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存数据',
            cancelButtonText: '取消修改',
            type: 'warning'
          }).then(() => {
            this.$refs.editable.setActiveRow(row)
            this.saveRowEvent(activeInfo.row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs.editable.revert(activeInfo.row)
              this.$refs.editable.setActiveRow(row)
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
        } else {
          this.$refs.editable.setActiveRow(row)
        }
      })
    },
    cancelRowEvent (row) {
      if (!row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
          confirmButtonText: '移除数据',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            XEUtils.remove(this.treeList, item => item === row) // 从缓存树中移除
            this.reloedTreeList(this.treeList)
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else if (this.$refs.editable.hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('检测到未保存的内容，是否取消修改?', '温馨提示', {
          confirmButtonText: '取消修改',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.editable.clearActive()
            this.$refs.editable.revert(row)
          } else {
            this.$refs.editable.setActiveRow(row)
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.editable.clearActive()
      }
    },
    removeEvent (row) {
      this.isClearActiveFlag = false
      MessageBox.confirm('确定删除该文件?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        XEAjax.doDelete(`/api/file/delete/${row.id}`).then(({ data }) => {
          this.removeOwnAllChilds(row)
          this.reloedTreeList(this.treeList)
          if (this.currentRow && !this.treeList.includes(this.currentRow)) {
            this.currentRow = null
          }
          this.loading = false
          Message({ message: '删除成功', type: 'success' })
        }).catch(e => {
          this.loading = false
        })
      }).catch(e => e).then(() => {
        this.isClearActiveFlag = true
      })
    },
    deleteSelectedEvent () {
      let removeRecords = this.treeList.filter(item => item.isCheck)
      if (removeRecords.length) {
        let msg = '您确定删除所选的文件？'
        if (removeRecords.some(item => item.type === '0')) {
          msg = '您确定删除所选目录及所有文件？'
        }
        MessageBox.confirm(msg, '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          XEAjax.doPost('/api/file/save', { removeRecords }).then(({ data }) => {
            Message({
              type: 'success',
              message: '删除成功!'
            })
            // 如果删除包含目录，级联删除子级
            this.currentRow = null
            removeRecords.forEach(item => this.removeOwnAllChilds(item))
            this.treeAllChange(false)
            this.reloedTreeList(this.treeList)
            this.loading = false
          }).catch(e => {
            this.loading = false
          })
        }).catch(e => e)
      } else {
        Message({
          type: 'info',
          message: '请至少选择一个文件！'
        })
      }
    },
    saveRowEvent (row) {
      // 如果是新增或已改动直接保存
      if (!row.id || this.$refs.editable.hasRowChange(row)) {
        this.$refs.editable.validateRow(row, valid => {
          if (valid) {
            let url = '/api/file/add'
            if (row.id) {
              url = '/api/file/update'
            }
            // 异步保存，局部刷新
            this.loading = true
            this.$refs.editable.clearActive()
            XEAjax.doPost(url, row).then(({ data }) => {
              XEUtils.destructuring(row, data[0])
              this.$refs.editable.reloadRow(row)
              this.loading = false
              Message({ message: '保存成功', type: 'success' })
            }).catch(e => {
              this.loading = false
            })
          }
        })
      } else {
        this.$refs.editable.clearActive()
      }
    },
    /** 树表格相关的函数处理 start */
    getChildren (row) {
      return this.treeList.filter(item => item.parentId === row.id)
    },
    getAllChilds (row) {
      let result = []
      let getChilds = (parent) => {
        this.treeList.forEach(item => {
          if (item.parentId && item.parentId === parent.id) {
            result.push(item)
            getChilds(item)
          }
        })
      }
      getChilds(row)
      return result
    },
    hasDirectory (row) {
      return this.getChildren(row).length > 0
    },
    // 移除自己以及所有子级
    removeOwnAllChilds (row) {
      let allChilds = this.getAllChilds(row)
      XEUtils.remove(this.treeList, item => row === item || allChilds.includes(item))
    },
    reloedTreeList (data) {
      this.initTreeList(data, true)
    },
    initTreeList (data, isReload) {
      let treeNode = XEUtils.toArrayTree(data, { strict: true, key: 'id', parentKey: 'parentId', children: 'children' })
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
        if (row.type === '0') {
          clsName = 'fa-folder'
        } else {
          let type = (row.name || '').split('.').pop()
          switch (type) {
            case 'xlsx':
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
            case 'mp4':
              clsName = 'fa-file-video-o'
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
      if (!value) {
        this.treeAllCheck = false
      }
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
      parent.expandNode = !!(expand && children.length)
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
        clsName += ' selected-row'
      }
      return clsName
    },
    toggleCollapseNode (row) {
      this.treeCollapseNode(row, !row.expandNode)
      this.loadTree()
    }
    /** 树表格相关的函数处理 end */
  }
}
</script>

<style>
.manual-upload6 {
  display: inline-block;
  margin: 0 10px;
}
.manual-table6-oper {
  margin-bottom: 18px;
}
.manual-table6 .tree-level_0 .tree-operate-node .cell {
  padding-left: 25px;
}
.manual-table6 .tree-level_1 .tree-operate-node .cell {
  padding-left: 40px;
}
.manual-table6 .tree-level_2 .tree-operate-node .cell {
  padding-left: 55px;
}
.manual-table6 .tree-level_3 .tree-operate-node .cell {
  padding-left: 70px;
}
.manual-table6 .tree-level_4 .tree-operate-node .cell {
  padding-left: 85px;
}
.manual-table6 .tree-level_5 .tree-operate-node .cell {
  padding-left: 100px;
}
.manual-table6 .tree-level_6 .tree-operate-node .cell {
  padding-left: 115px;
}
.manual-table6 .tree-level_7 .tree-operate-node .cell {
  padding-left: 130px;
}
.manual-table6 .tree-level_8 .tree-operate-node .cell {
  padding-left: 145px;
}
.manual-table6 .tree-expand-icon {
  padding-right: 10px;
}
.manual-table6 .el-table__body .el-table__row.selected-row {
   background-color: #f0f9eb;
}
.manual-table6 .el-table__body .el-table__row:hover>td {
  background-color: inherit;
}
.manual-table6 .editable-row .editable-column.editable-col_edit.editable-col_disabled {
  cursor: auto;
}
.manual-table6 .error-msg {
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
.manual-table6 .error-msg:before {
  content: "";
  position: absolute;
  border: 4px solid;
  top: -8px;
  left: 20%;
  border-color: transparent transparent red transparent;
}
</style>

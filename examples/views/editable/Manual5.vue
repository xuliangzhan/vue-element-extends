<template>
  <div>
    <p style="color: red;font-size: 12px;">对于一个页面有多个表格，建议再封装一层使用更简单</p>

    <div v-loading="roleLoading">
      <div class="manual-table5-oper">
        <el-button type="success" size="mini" @click="insertEvent('editable1')">新增</el-button>
        <el-button type="danger" size="mini" @click="deleteSelectedEvent('editable1')">删除选中</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable1', {filename: '显示数据.csv'})">导出显示数据</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable1', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
      </div>

      <elx-editable
        ref="editable1"
        class="manual-table7"
        size="mini"
        border
        height="260"
        :data.sync="roleList"
        :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod1}"
        style="width: 100%">
        <elx-editable-column type="selection" width="55"></elx-editable-column>
        <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
        <elx-editable-column prop="name" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="describe" label="描述" :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></elx-editable-column>
        <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column label="操作" width="160">
          <template v-slot="scope">
            <template v-if="$refs.editable1.hasActiveRow(scope.row)">
              <el-button size="mini" type="success" @click="saveRowEvent('editable1', scope.row)">保存</el-button>
              <el-button size="mini" type="warning" @click="cancelRowEvent('editable1', scope.row)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="openActiveRowEvent('editable1', scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="removeEvent('editable1', scope.row)">删除</el-button>
            </template>
          </template>
        </elx-editable-column>
      </elx-editable>

      <el-pagination
        class="manual-table5-pagination"
        @size-change="handleSizeChange1"
        @current-change="handleCurrentChange1"
        :current-page="rolePageVO.currentPage"
        :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
        :page-size="rolePageVO.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rolePageVO.totalResult">
      </el-pagination>
    </div>

    <div v-loading="userLoading">
      <div class="manual-table5-oper">
        <el-button type="success" size="mini" @click="insertEvent('editable2')">新增</el-button>
        <el-button type="danger" size="mini" @click="deleteSelectedEvent('editable2')">删除选中</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable2', {filename: '显示数据.csv'})">导出显示数据</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable2', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
      </div>

      <elx-editable
        ref="editable2"
        size="mini"
        border
        height="260"
        :data.sync="userList"
        :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod2}"
        style="width: 100%">
        <elx-editable-column type="selection" width="55"></elx-editable-column>
        <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
        <elx-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
        <elx-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></elx-editable-column>
        <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></elx-editable-column>
        <elx-editable-column prop="role" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="describe" label="文本域" show-overflow-tooltip :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></elx-editable-column>
        <elx-editable-column prop="date" label="日期" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd'}}"></elx-editable-column>
        <elx-editable-column prop="flag" label="是否启用" :formatter="formatterFlag" :edit-render="{name: 'ElSwitch'}"></elx-editable-column>
        <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column label="操作" width="150">
          <template v-slot="scope">
            <template v-if="$refs.editable2.hasActiveRow(scope.row)">
              <el-button size="mini" type="success" @click="saveRowEvent('editable2', scope.row)">保存</el-button>
              <el-button size="mini" type="warning" @click="cancelRowEvent('editable2', scope.row)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="openActiveRowEvent('editable2', scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="removeEvent('editable2', scope.row)">删除</el-button>
            </template>
          </template>
        </elx-editable-column>
      </elx-editable>

      <el-pagination
        class="manual-table5-pagination"
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange2"
        :current-page="userPageVO.currentPage"
        :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
        :page-size="userPageVO.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userPageVO.totalResult">
      </el-pagination>
    </div>

    <div v-loading="fileLoading">
      <div class="manual-table5-oper">
        <el-button type="success" size="mini" @click="insertEvent('editable3')">新增</el-button>
        <el-button type="danger" size="mini" @click="deleteSelectedEvent('editable3')">删除选中</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable3', {filename: '显示数据.csv'})">导出显示数据</el-button>
        <el-button type="success" size="mini" @click="customExportCsvEvent('editable3', {filename: '实际数据.csv', original: true})">导出实际数据</el-button>
      </div>

      <elx-editable
        ref="editable3"
        size="mini"
        border
        height="260"
        :data.sync="fileList"
        :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod: clearActiveMethod3}"
        style="width: 100%">
        <elx-editable-column type="selection" width="55"></elx-editable-column>
        <elx-editable-column prop="id" label="ID" width="100"></elx-editable-column>
        <elx-editable-column prop="name" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></elx-editable-column>
        <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column prop="updateTime" label="修改时间" width="160" :formatter="formatterDate"></elx-editable-column>
        <elx-editable-column label="操作" width="160">
          <template v-slot="scope">
            <template v-if="$refs.editable3.hasActiveRow(scope.row)">
              <el-button size="mini" type="success" @click="saveRowEvent('editable3', scope.row)">保存</el-button>
              <el-button size="mini" type="warning" @click="cancelRowEvent('editable3', scope.row)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="mini" type="primary" @click="openActiveRowEvent('editable3', scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="removeEvent('editable3', scope.row)">删除</el-button>
            </template>
          </template>
        </elx-editable-column>
      </elx-editable>

      <el-pagination
        class="manual-table5-pagination"
        @size-change="handleSizeChange3"
        @current-change="handleCurrentChange3"
        :current-page="filePageVO.currentPage"
        :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
        :page-size="filePageVO.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filePageVO.totalResult">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      sexList: [],
      regionList: [],
      roleList: [],
      roleLoading: false,
      rolePageVO: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      userList: [],
      userLoading: false,
      userPageVO: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      fileList: [],
      fileLoading: false,
      filePageVO: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      isClearActiveFlag: true
    }
  },
  created () {
    this.findSexList()
    this.findRegionList()
    this.findRoleList()
    this.findUserList()
    this.findFileList()
  },
  methods: {
    findRoleList () {
      this.roleLoading = true
      XEAjax.doGet(`/api/role/page/list/${this.rolePageVO.pageSize}/${this.rolePageVO.currentPage}`).then(response => {
        let { page, result } = response.data
        this.roleList = result
        this.rolePageVO.totalResult = page.totalResult
        this.roleLoading = false
      })
    },
    findUserList () {
      this.userLoading = true
      XEAjax.doGet(`/api/user/page/list/${this.userPageVO.pageSize}/${this.userPageVO.currentPage}`).then(response => {
        let { page, result } = response.data
        this.userList = result
        this.userPageVO.totalResult = page.totalResult
        this.userLoading = false
      })
    },
    findFileList () {
      this.fileLoading = true
      XEAjax.doGet(`/api/file/page/list/${this.filePageVO.pageSize}/${this.filePageVO.currentPage}`).then(response => {
        let { page, result } = response.data
        this.fileList = result
        this.filePageVO.totalResult = page.totalResult
        this.fileLoading = false
      })
    },
    findSexList () {
      XEAjax.doGet('/api/conf/sex/list').then(({ data }) => {
        this.sexList = data
      })
    },
    findRegionList () {
      XEAjax.doGet('/api/conf/region/list').then(({ data }) => {
        this.regionList = data
      })
    },
    handleSizeChange1 (pageSize) {
      this.rolePageVO.pageSize = pageSize
      this.findRoleList()
    },
    handleCurrentChange1 (currentPage) {
      this.rolePageVO.currentPage = currentPage
      this.findRoleList()
    },
    handleSizeChange2 (pageSize) {
      this.userPageVO.pageSize = pageSize
      this.findUserList()
    },
    handleCurrentChange2 (currentPage) {
      this.userPageVO.currentPage = currentPage
      this.findUserList()
    },
    handleSizeChange3 (pageSize) {
      this.filePageVO.pageSize = pageSize
      this.findFileList()
    },
    handleCurrentChange3 (currentPage) {
      this.filePageVO.currentPage = currentPage
      this.findFileList()
    },
    formatterFlag (row, column, cellValue, index) {
      return cellValue ? '是' : '否'
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
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
    insertEvent (name) {
      let activeInfo = this.$refs[name].getActiveRow()
      let { insertRecords } = this.$refs[name].getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        this.$refs[name].insert().then(({ row }) => {
          this.$refs[name].setActiveRow(row)
        })
      }
    },
    customExportCsvEvent (name, opts) {
      this.$refs[name].exportCsv(opts)
    },
    clearActiveMethod1 ({ type, row, rowIndex }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkSaveData('editable1', row) : this.isClearActiveFlag
    },
    clearActiveMethod2 ({ type, row, rowIndex }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkSaveData('editable2', row) : this.isClearActiveFlag
    },
    clearActiveMethod3 ({ type, row, rowIndex }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkSaveData('editable3', row) : this.isClearActiveFlag
    },
    // 判断多表格切换时是否有数据没有保存
    checkSaveData (name, row) {
      if (this.$refs[name].hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('您离开了表格，检测未保存的内容，是否在离开前保存修改?', '温馨提示', {
          closeOnClickModal: false,
          distinguishCancelAndClose: true,
          confirmButtonText: '保存',
          cancelButtonText: '放弃修改',
          type: 'warning'
        }).then(() => {
          this.$refs[name].clearActive()
          this.saveRowEvent(name, row)
        }).catch(action => {
          if (action === 'cancel') {
            this.$refs[name].revert(row)
            this.$refs[name].clearActive()
            Message({ message: '放弃修改并离开当前行', type: 'warning' })
          } else {
            this.$refs[name].setActiveRow(row)
            Message({ message: '停留在当前行编辑', type: 'info' })
          }
        }).then(() => {
          this.isClearActiveFlag = true
        })
        return false
      }
      return this.isClearActiveFlag
    },
    openActiveRowEvent (name, row) {
      this.$nextTick(() => {
        let activeInfo = this.$refs[name].getActiveRow()
        // 如果当前行正在编辑中，禁止编辑其他行
        if (activeInfo) {
          if (activeInfo.row === row || !this.$refs[name].checkValid().error) {
            if (activeInfo.isUpdate) {
              this.isClearActiveFlag = false
              MessageBox.confirm('检测到未保存的内容，是否在离开前保存修改?', '温馨提示', {
                closeOnClickModal: false,
                distinguishCancelAndClose: true,
                confirmButtonText: '保存',
                cancelButtonText: '放弃修改',
                type: 'warning'
              }).then(() => {
                this.$refs[name].setActiveRow(row)
                this.saveRowEvent(name, activeInfo.row)
              }).catch(action => {
                if (action === 'cancel') {
                  this.$refs[name].revert(activeInfo.row)
                  this.$refs[name].setActiveRow(row)
                  Message({ message: '放弃修改并离开当前行', type: 'warning' })
                } else {
                  Message({ message: '停留在当前行编辑', type: 'info' })
                }
              }).then(() => {
                this.isClearActiveFlag = true
              })
            } else {
              this.$refs[name].setActiveRow(row)
            }
          }
        } else {
          this.$refs[name].setActiveRow(row)
        }
      })
    },
    removeEvent (name, row) {
      if (row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          switch (name) {
            case 'editable1':
              this.roleLoading = true
              XEAjax.doDelete(`/api/role/delete/${row.id}`).then(({ data }) => {
                this.findRoleList()
              }).catch(e => {
                this.roleLoading = false
              })
              break
            case 'editable2':
              this.userLoading = true
              XEAjax.doDelete(`/api/user/delete/${row.id}`).then(({ data }) => {
                this.findUserList()
              }).catch(e => {
                this.userLoading = false
              })
              break
            case 'editable3':
              this.fileLoading = true
              XEAjax.doDelete(`/api/file/delete/${row.id}`).then(({ data }) => {
                this.findFileList()
              }).catch(e => {
                this.fileLoading = false
              })
              break
          }
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs[name].remove(row)
      }
    },
    deleteSelectedEvent (name) {
      let removeRecords = this.$refs[name].getSelecteds()
      if (removeRecords.length) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定删除所选数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          switch (name) {
            case 'editable1':
              this.roleLoading = true
              XEAjax.doPost('/api/role/save', { removeRecords }).then(({ data }) => {
                Message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.findRoleList()
              }).catch(e => {
                this.roleLoading = false
              })
              break
            case 'editable2':
              this.userLoading = true
              XEAjax.doPost('/api/user/save', { removeRecords }).then(({ data }) => {
                Message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.findUserList()
              }).catch(e => {
                this.userLoading = false
              })
              break
            case 'editable3':
              this.fileLoading = true
              XEAjax.doPost('/api/file/save', { removeRecords }).then(({ data }) => {
                Message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.findFileList()
              }).catch(e => {
                this.fileLoading = false
              })
              break
          }
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    saveRowEvent (name, row) {
      this.$refs[name].validateRow(row, valid => {
        if (valid) {
          let url
          switch (name) {
            case 'editable1':
              url = '/api/role/add'
              if (row.id) {
                url = '/api/role/update'
              }
              this.roleLoading = true
              this.$refs[name].clearActive()
              XEAjax.doPost(url, row).then(({ data }) => {
                this.findRoleList()
                Message({ message: '保存成功', type: 'success' })
              }).catch(e => {
                this.roleLoading = false
              })
              break
            case 'editable2':
              url = '/api/user/add'
              if (row.id) {
                url = '/api/user/update'
              }
              if (XEUtils.isDate(row.date)) {
                row.date = row.date.getTime()
              }
              this.userLoading = true
              this.$refs[name].clearActive()
              XEAjax.doPost(url, row).then(({ data }) => {
                this.findUserList()
                Message({ message: '保存成功', type: 'success' })
              }).catch(e => {
                this.userLoading = false
              })
              break
            case 'editable3':
              url = '/api/file/add'
              if (row.id) {
                url = '/api/file/update'
              }
              this.fileLoading = true
              this.$refs[name].clearActive()
              XEAjax.doPost(url, row).then(({ data }) => {
                this.findFileList()
                Message({ message: '保存成功', type: 'success' })
              }).catch(e => {
                this.fileLoading = false
              })
              break
          }
        }
      })
    },
    cancelRowEvent (name, row) {
      let activeInfo = this.$refs[name].getActiveRow()
      if (activeInfo && activeInfo.isUpdate) {
        this.isClearActiveFlag = false
        MessageBox.confirm('检测到未保存的内容，确定放弃修改?', '温馨提示', {
          closeOnClickModal: false,
          confirmButtonText: '放弃更改',
          cancelButtonText: '返回',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs[name].clearActive()
            this.$refs[name].revert(row)
          } else {
            this.$refs[name].setActiveRow(row)
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs[name].clearActive()
      }
    }
  }
}
</script>

<style>
.manual-table5-oper {
  margin-bottom: 18px;
}
.manual-table5-pagination {
  margin-top: 18px;
  text-align: right;
}
</style>

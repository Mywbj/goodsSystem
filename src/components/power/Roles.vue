<template>
  <div>
    <!-- 面包屑 -->
    <crumbs :arr-data="['权限管理', '角色列表']"></crumbs>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <!-- 按钮 -->
          <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
          <!-- 显示添加角色 -->
          <el-dialog title="添加角色"
            :visible.sync="addRolesDialogVisible" width="40%">
            <el-form ref="addRolesRef" :model="addRolesForm" label-width="80px">
              <el-form-item label="角色名称">
                <el-input v-model="addRolesForm.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述">
                <el-input v-model="addRolesForm.roleDesc"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer">
              <el-button @click="addRolesDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
          </el-dialog>          
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id"
            :class="['bdbottom', index1 !== 0 ? 'bdbottom':'bdtop']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRolesId(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row v-for="(item2,index2) in item1.children" :key="item2.id"
                :class="[index2 !== 0 ? 'bdtop' : '' ]">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRolesId(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id"
                    type="warning" closable @close="removeRolesId(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="redactRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deteleRoles(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="allotRoles(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑角色框 -->
      <el-dialog title="修改角色"
        :visible.sync="redactRolesDialogVisible" width="40%">
        <el-form ref="redactRolesRef" :model="redactRolesForm" label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="redactRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="redactRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="redactRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="redactRoles">确 定</el-button>
        </span>
      </el-dialog>
        <!-- 分配权限框 -->
      <el-dialog title="分配权限"
        :visible.sync="allotDialogVisible" width="30%">
        <el-tree ref="treeRef" :data="getAllotList" :props="treeProps" show-checkbox node-key="id"
        default-expand-all :default-checked-keys="defKeys"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="allotDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRolesPower">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import {CrumbsMixin} from '../../common/mixin'
export default {
  name: 'Roles',
  mixins: [CrumbsMixin],
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 添加角色数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 是否显示添加角色框
      addRolesDialogVisible: false,
      // 是否显示编辑角色框
      redactRolesDialogVisible: false,
      // 修改角色数据
      redactRolesForm: {
        id: null,
        roleName: '',
        roleDesc: ''
      },
      // 是否显示分配权限框
      allotDialogVisible: false,
      // 获取权限列表
      getAllotList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认展开的节点的 key 的数组
      defKeys: [],
      rowsId: ''
    }
  },
  methods: {
    getRolesList() {
      this.$axios({
        url: 'roles'
      }).then(({data:res}) => {
        this.rolesList = res.data
      })
    },
    // 添加用户
    addRoles() {
      this.$axios({
        url: 'roles',
        method: 'post',
        params: this.addRolesForm
      }).then(({data:{data, meta}}) => {
        if(meta.status !== 201) return this.$message.error({message: '添加角色失败！', center: true})
        this.$message.success({message: meta.msg, center: true})
        this.getRolesList()
        this.addRolesDialogVisible = false
      })
    },
    // 编辑用户
    redactRole(id) {
      this.$axios({
        url: 'roles/' + id,
      }).then(({data:res}) => {
        this.redactRolesDialogVisible = true
        this.redactRolesForm.id = res.data.roleId
        this.redactRolesForm.roleName = res.data.roleName
        this.redactRolesForm.roleDesc = res.data.roleDesc
      })
    },
    // 确定修改
    redactRoles() {
      this.$axios({
        url: 'roles/' + this.redactRolesForm.id,
        method: 'put',
        params: {
          roleName:this.redactRolesForm.roleName,
          roleDesc:this.redactRolesForm.roleDesc
        }
      }).then(({data:{data, meta}}) => {
        if(meta.status !== 200) return this.$message.error({message: '修改失败！', center: true})
        this.$message.success({message: meta.msg, center: true})
        this.getRolesList()
        this.redactRolesDialogVisible = false
      })
    },
    deteleRoles(id) {
      this.$messageBox('是否永久删除该角色 ?',  '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$axios({
          url: 'roles/' + id,
          method: 'delete'
        }).then(({data:{meta}}) => {
          if(meta.status !== 200) return this.$message.error({message: meta.msg, center: true})
            this.$message.success({message: meta.msg, center: true})
            this.getRolesList()
        })
      }).catch(err => {
        this.$message.info({message: '已取消',center: true})
      })      
    },
    // 根据id来删除角色指定权限
    removeRolesId(role, rightId) {
      this.$messageBox('是否永久删除该权限 ?',  '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$axios({
          url: `roles/${role.id}/rights/${rightId}`,
          method: 'delete'
        }).then(({data:{data,meta}}) => {
          if(meta.status !== 200) return this.$message.error({message: meta.msg, center: true})
            this.$message.success({message: meta.msg, center: true})
            role.children = data
        })
      }).catch(err => {
        this.$message.info({message: '已取消',center: true})
      })       
    },
    // 分配权限
    allotRoles(rows) {
      this.rowsId = rows.id
      this.$axios({
        url: 'rights/tree'
      }).then(({data:res}) => {
        console.log(res)
        this.getAllotList = res.data
      })
      this.defKeys = []
      this.getListKeys(rows,this.defKeys)
      this.allotDialogVisible = true
    },
    // 递归遍历三级权限
    getListKeys(node, arr) {
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getListKeys(item, arr))
    },
    // 确定选中的权限
    allotRolesPower() {
      const keysId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const strId = keysId.join(',')
      this.$axios({
        url: `roles/${this.rowsId}/rights`,
        method: 'post',
        params: {rids: strId}
      }).then(({data:{meta}}) => {
        if(meta.status !== 200) return this.$message.error('更新权限失败！')
        this.$message.success('更新权限成功！')
        this.getRolesList()
        this.allotDialogVisible = false
      })
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }
  .el-row {
    padding: 10px 0;
    display: flex;
    align-items: center;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
</style>
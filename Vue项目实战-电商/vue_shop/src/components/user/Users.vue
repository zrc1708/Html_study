<template>
    <div>
        <!-- 面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getUserList'>
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表 -->
            <el-table :data="userlist" border stripe> 
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" >
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" @click="setRole(scope.row)" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主题区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主题区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" ></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile" ></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoledialogVisible" width="50%" @close="serRoleDialogClosed">
            <div>
                <p>当前用户：{{userinfo.username}}</p>
                <p>当前角色：{{userinfo.role_name}}</p>
                <p>分配新角色:
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoledialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        //验证邮箱的规则
        var checkEmail = (rule,value,cb)=>{
            const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
            if(regEmail.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
        }
        // 验证手机号的规则
        var checkMobile = (rule,value,cb)=>{
            const regMobile = /^1[3456789]\d{9}$/
            if(regMobile.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的手机号'))
        }

        return {
            // 获取用户列表的参数对象
            queryInfo:{
                query:'',
                // 当前的页数
                pagenum:1,
                // 当前每页显示多少条数据
                pagesize:2
            },
            userlist:[],
            total:0,
            // 控制添加用户对话框的显示和隐藏
            addDialogVisible:false,
            // 添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加表单的验证规则对象
            addFormRules:{
                username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ],
                email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator:checkEmail, trigger: 'blur' }
                    ],
                mobile: [
                        { required: true, message: '请输入手机', trigger: 'blur' },
                        { validator:checkMobile, trigger: 'blur' }
                    ],
            },
            // 控制修改用户对话框的显示
            editDialogVisible:false,
            // 查询到的用户信息对象
            editForm:{},
            // 修改的校验规则
            editFormRules:{
                email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator:checkEmail, trigger: 'blur' }
                    ],
                mobile: [
                        { required: true, message: '请输入手机', trigger: 'blur' },
                        { validator:checkMobile, trigger: 'blur' }
                    ],
            },
            // 控制分配角色对话框的显示与隐藏
            setRoledialogVisible:false,
            // 要被分配权限的用户信息
            userinfo:{},
            // 所有角色的数据列表
            rolesList:[],
            // 被选中的角色id
            selectedRoleId:''
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList(){
            const {data:res} = await this.$http.get('users',{
                params:this.queryInfo
            })
            if(res.meta.status!==200) return this.$message.error('获取用户列表失败')
            this.userlist = res.data.users
            this.total = res.data.total
            // console.log(res.data)
        },
        // 监听pagesize改变的组件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听switch状态的改变
        async userStateChanged(userinfo){
            // console.log(userinfo)
            const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status!==200) {
                userinfo.mg_state = !userinfo.mg_state
                return  this.$message.error('更新用户状态失败')
            }  
            this.$message.success('更新用户状态成功')
        },
        // 监听关闭添加用户对话框
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 添加用户
        addUser(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return
                // 发起请求
                const {data:res} = await this.$http.post('users',this.addForm)
                if(res.meta.status!==201) {
                    this.$message.error('添加用户失败')
                }  
                this.$message.success('添加用户成功')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                // 重新获取数据
                this.getUserList()
            })
        },
        // 展示编辑用户对话框
        async showEditDialog(id){
            const {data:res} = await this.$http.get(`users/${id}`)
            if(res.meta.status!==200){
                this.$message.error('查询用户信息失败')
            } 
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 监听关闭修改用户对话框
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户提交
        editUserInfo(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return
                // 发起修改用户信息的请求
                const {data:res} = await this.$http.put(`users/${this.editForm.id}`,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                if(res.meta.status!==200) {
                    this.$message.error('修改用户失败')
                }  
                this.$message.success('修改用户成功')
                // 隐藏修改用户的对话框
                this.editDialogVisible = false
                // 重新获取数据
                this.getUserList()
            })
        },
        // 根据id删除
        async removeUserById(id){
            // 弹框询问用户是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => {
                // 如果用户取消删除，返回cancel
                return err
            })
            // 如果用户却认删除，返回confirm字符串
            if(confirmResult!='confirm'){
                return this.$message.info('已经取消删除')
            }
            const {data:res} = await this.$http.delete(`users/${id}`)
            if(res.meta.status!==200) {
                    this.$message.error('删除用户失败')
                }  
            this.$message.success('删除用户成功')
            this.getUserList()
        },
        // 展示分配角色的对话框
        async setRole(userInfo){
            this.userinfo = userInfo
            // 展示对话框之前获取所有角色列表
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status!==200) return this.$message.error('获取角色列表失败')
            this.rolesList = res.data
            this.setRoledialogVisible = true
        },
        // 点击按钮分配角色
        async saveRoleInfo(){
            if(!this.selectedRoleId){
                return this.$message.error('请选择要分配的角色')
            }
            const {data:res} = await this.$http.put(`users/${this.userinfo.id}/role`,{
                rid:this.selectedRoleId
            })
            if(res.meta.status!==200) return this.$message.error('更新角色失败')
            this.$message.success('更新角色成功')
            this.getUserList()
            this.setRoledialogVisible = false
        },
        // 关闭分配角色
        serRoleDialogClosed(){
            this.selectedRoleId = ''
            this.userinfo = {}
        }
    },
}
</script>
<style lang="less" scoped>

</style>
<template>
    <div>
        <!-- 面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showaddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table class="treetable" :data="cateList" :columns="columns" :selection-type="false" 
            :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序  -->
                <template slot="order" slot-scope="scope">
                    <el-tag size ="mini" v-if="scope.row.cat_level=== 0">一级</el-tag>
                    <el-tag type = 'success' size ="mini" v-else-if="scope.row.cat_level=== 1">二级</el-tag>
                    <el-tag type = 'warning' size ="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作  -->
                <template slot="opt" >
                    <el-button type="primary" icon="el-icon-edit" size ="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size ="mini">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options指定数据源 props指定配置对象-->
                    <el-cascader v-model="selectedKeys"  :options="parentCateList" :props="cascaderProps" 
                    @change="parentCateChanged" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template> 
<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            // 商品分类数据列表
            cateList:[],
            //总数据条数
            total:0,
            // 为table指定列的定义
            columns:[{
                label:'分类名称',
                prop:'cat_name'
            },{
                label: '是否有效',
                // 表示将当前列定义为模板
                type: 'template',
                // 这一列使用模板名称
                template: 'isok',
            },{
                label: '排序',
                type: 'template',
                template: 'order',
            },{
                label: '操作',
                type: 'template',
                template: 'opt',
            },],
            // 添加分类对话框
            addCateDialogVisible:false,
            // 添加分类表单数据对象
            addCateForm:{
                //将要添加的分类的名称
                cat_name:'',
                // 父级分类的id
                cat_pid:0,
                // 分类的等级，默认要添加的是一级分类
                cat_level:0
            },
            // 添加分类表单的验证规则对象
            addCateFormRules:{
                cat_name:[
                    { required: true, message: '请输入分类名', trigger: 'blur' }
                ]
            },
            // 父级分类的列表
            parentCateList:[],
            // 级联选择器配置对象
            cascaderProps:{
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children',
                checkStrictly:true
            },
            // 选中的父级分类的id数组
            selectedKeys:[]
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类
        async getCateList(){
            const {data:res} = await this.$http.get(`categories`,{params:this.queryInfo})
            if(res.meta.status!==200) return this.$message.error('获取分类列表失败')
            this.cateList = res.data.result
            // 总数据条数
            this.total = res.data.total
        },
        // 监听pagesize改变
        handleSizeChange(newsize){
            this.queryInfo.pagesize = newsize
            this.getCateList()
        },
        // 监听pagenum改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 点击按钮展示添加分类
        showaddCateDialog(){
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        // 获取父级分类的数据
        async getParentCateList(){
            const {data:res} = await this.$http.get(`categories`,{params:{type:2}})
            if(res.meta.status!==200) return this.$message.error('获取父级分类失败')
            this.parentCateList = res.data
        },
        // 选择项发生变化触发这个函数
        parentCateChanged(){
            if(this.selectedKeys.length>0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                // 为当前分类等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            }else{
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮添加分类
        async addCate(){
            this.$refs.addCateFormRef.validate( async valid => {
                if(!valid) return
            })
            const {data:res} = await this.$http.post(`categories`,this.addCateForm)
            console.log(res)
            if(res.meta.status!==201) return this.$message.error('添加分类失败')
            this.$message.success('添加分类成功')
            this.getCateList()
            this.addCateDialogVisible = false
        },
        // 关闭对话框
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        }
    },
}
</script>
<style lang="less" scoped>
    .treetable{
        margin-top: 15px;
    }
    
</style> 
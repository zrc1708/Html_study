<template>
    <div>
        <!-- 面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容"  clearable>
                        <el-button slot="append" icon="el-icon-search" ></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表数据 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template >
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" background></el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <!-- 地址选择表单 -->
            <el-form :model="addressForm" :rules="addressFormrules" ref="addressFormRef" label-width="100px" label-position="top">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 展示物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progessVisible" width="50%" >
            <!-- 时间线 -->
            <el-timeline >
                <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>
<script>
import cityData from './citydata.js'

export default {
    data() {
        return {
            // 查询参数对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10,
            },
            orderList:[],
            total:0,
            addressVisible:false,
            addressForm:{
                address1:'',
                address2:''
            },
            addressFormrules:{
                address1:[
                    { required: true, message: '请选择省市区/县', trigger: 'blur' }
                ],
                address2:[
                    { required: true, message: '请填写详细地址', trigger: 'blur' }
                ]
            },
            cityData,
            progessVisible:false,
            progressInfo:[]
        }
    },
    created() {
        this.gerOrderList()
    },
    methods: {
        async gerOrderList(){
            const {data:res} = await this.$http.get(`orders`,{params:this.queryInfo})   
            if(res.meta.status!==200) return this.$message.error('获取订单列表失败')
            this.orderList = res.data.goods
            this.total = res.data.total
        },
        // 分页变化
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.gerOrderList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.gerOrderList()
        },
        // 展示修改地址的对话框
        showBox(){
            this.addressVisible = true
        },
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        async showProgressBox(){
            // const {data:res} = await this.$http.get(`/kuaidi/`)   
            // if(res.meta.status!==200) return this.$message.error('获取物流进度失败')
            // this.progressInfo = res.data
            this.progressInfo = {
                "data": [
                    {
                    "time": "2018-05-10 09:39:00",
                    "ftime": "2018-05-10 09:39:00",
                    "context": "已签收,感谢使用顺丰,期待再次为您服务",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 08:23:00",
                    "ftime": "2018-05-10 08:23:00",
                    "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 07:32:00",
                    "ftime": "2018-05-10 07:32:00",
                    "context": "快件到达 [北京海淀育新小区营业点]",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 02:03:00",
                    "ftime": "2018-05-10 02:03:00",
                    "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                    "location": ""
                    },
                    {
                    "time": "2018-05-09 23:05:00",
                    "ftime": "2018-05-09 23:05:00",
                    "context": "快件到达 [北京顺义集散中心]",
                    "location": ""
                    },
                    {
                    "time": "2018-05-09 21:21:00",
                    "ftime": "2018-05-09 21:21:00",
                    "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                    "location": ""
                    },
                    {
                    "time": "2018-05-09 13:07:00",
                    "ftime": "2018-05-09 13:07:00",
                    "context": "顺丰速运 已收取快件",
                    "location": ""
                    },
                    {
                    "time": "2018-05-09 12:25:03",
                    "ftime": "2018-05-09 12:25:03",
                    "context": "卖家发货",
                    "location": ""
                    },
                    {
                    "time": "2018-05-09 12:22:24",
                    "ftime": "2018-05-09 12:22:24",
                    "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                    "location": ""
                    },
                    {
                    "time": "2018-05-08 21:36:04",
                    "ftime": "2018-05-08 21:36:04",
                    "context": "商品已经下单",
                    "location": ""
                    }
                ],
                "meta": { "status": 200, "message": "获取物流信息成功！" }
            }.data

            this.progessVisible = true
            console.log(this.progressInfo);
        }
    },
}
</script>
<style lang="less" scoped>
    @import '../../plugins/timeline/timeline.css';
    @import '../../plugins/timeline-item/timeline-item.css';
</style>
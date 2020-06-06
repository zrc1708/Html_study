// procuct的默认子路由组件
import React, { Component } from 'react'
import {Card,Select,Input,Button,Table} from 'antd'
import {PlusOutlined} from '@ant-design/icons'
import LinkButton from '../../components/link-button/link-button'
import {reqProducts} from '../../api/index'
import {PAGE_SIZE} from '../../utils/constants'

export default class ProductHome extends Component {
    state={
        total:0,    //商品的总数量
        products:[],    //商品的数组
        loading:false,   //是否正在加载中
    }
    
    componentWillMount(){
        this.initColumns()
    }

    componentDidMount(){
        this.getProducts(1)
    }

    // 初始化table的列表数组
    initColumns=()=>{
        this.columns = [
            {
              title: '商品名称',
              dataIndex: 'name',
            },
            {
              title: '商品描述',
              dataIndex: 'desc',
            },
            {
              title: '价格',
              dataIndex: 'price',
              render:(price)=>'￥'+ price
            },
            {
                width:100,
                title: '状态',
                dataIndex: 'status',
                render:(status)=>{
                    return (
                        <span>
                            <Button type='primary'>下架</Button>
                            <span>在售</span>
                        </span>
                    )
                }
            },
            {
                title: '操作',
                render:(product)=>{
                    return (
                        <span>
                            <LinkButton>详情</LinkButton>
                            <LinkButton>修改</LinkButton>
                        </span>
                    )
                }
            },
          ];
    }

    // 获取指定页码的列表数据显示
    getProducts = async (pageNum)=>{
        this.setState({loading:true})
        const result = await reqProducts(pageNum,PAGE_SIZE)
        this.setState({loading:false})
        if(result.status===0){
            const {total,list} = result.data
            this.setState({
                total,
                products:list
            })
        }
    }

    render() {
        // 去除状态数据
        const {products,total,loading} = this.state

        const title = (
            <span>
                <Select value='1' style={{width:150}}>
                    <Select.Option value="1">按名称搜索</Select.Option>
                    <Select.Option value="2">按描述搜索</Select.Option>
                </Select>
                <Input placeholder="关键字" style={{width:150,margin:'0 15px'}}/>
                <Button type="primary">搜索</Button>
            </span>
        )
        const extra = (
            <Button type="primary">
                <PlusOutlined />
                添加商品
            </Button>
        )

        return (
            <Card title={title} extra={extra}>
                <Table 
                rowKey='_id'
                bordered
                loading={loading}
                dataSource={products} 
                columns={this.columns}
                pagination={{
                    efaultPageSize:PAGE_SIZE,
                    showQuickJumper:true,
                    total:total,
                    onChange:(page)=>this.getProducts(page)}} />
            </Card>
        )
    }
}

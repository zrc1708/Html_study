// procuct的默认子路由组件
import React, { Component } from 'react'
import {Card,Select,Input,Button,Table, message} from 'antd'
import {PlusOutlined} from '@ant-design/icons'
import LinkButton from '../../components/link-button/link-button'
import {reqProducts,reqSearchProducts,reqUpdateStatus} from '../../api/index'
import {PAGE_SIZE} from '../../utils/constants'

export default class ProductHome extends Component {
    state={
        total:0,    //商品的总数量
        products:[],    //商品的数组
        loading:false,   //是否正在加载中
        searchName:'',   //搜索的关键字
        searchType:'productName',  //根据那个字段搜索
    }
    
    componentWillMount(){
        this.initColumns()
    }

    componentDidMount(){
        this.getProducts(1)
    }

    // 更新指定商品的状态
    updateStatus = async (productId,status)=>{
        console.log(productId,status)
        const result = await reqUpdateStatus(productId,status)
        if(result.status ===0){
            message.success('更新商品成功')
            this.getProducts(this.pageNum)
        }
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
                // dataIndex: 'status',
                render:(product)=>{
                    const {status,_id} = product
                    return (
                        <span>
                            <Button 
                            type='primary' 
                            onClick={()=>this.updateStatus(_id,status===1?2:1)}>
                                {status===1 ?'下架':'上架'}
                            </Button>
                            <span>{status===1 ?'在售':'已下架'}</span>
                        </span>
                    )
                }
            },
            {
                title: '操作',
                render:(product)=>{
                    return (
                        <span>
                            <LinkButton onClick={()=>this.props.history.push('/product/detail',{product})}>详情</LinkButton>
                            <LinkButton onClick={()=>this.props.history.push('/product/addupdate',product)}>修改</LinkButton>
                        </span>
                    )
                }
            },
          ];
    }

    // 获取指定页码的列表数据显示
    getProducts = async (pageNum)=>{
        this.pageNum = pageNum  //保存pageNum让其他方法可以看到
        this.setState({loading:true})
        const {searchName,searchType} = this.state
        let result
        // 如果搜索关键字有值，进行搜索分页
        if(searchName){
            result = await reqSearchProducts({pageNum,pageSize:PAGE_SIZE,searchName,searchType})
            console.log({pageNum,pageSize:PAGE_SIZE,searchName,searchType})
        }else{
            // 一般分页
            result = await reqProducts(pageNum,PAGE_SIZE)
        }
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
        const {products,total,loading,searchType,searchName} = this.state

        const title = (
            <span>
                <Select 
                value={searchType} 
                style={{width:150}} 
                onChange={value=>this.setState({searchType:value})}>
                    <Select.Option value="productName">按名称搜索</Select.Option>
                    <Select.Option value="productDesc">按描述搜索</Select.Option>
                </Select>
                <Input placeholder="关键字" 
                style={{width:150,margin:'0 15px'}} 
                value={searchName}
                onChange={event=>this.setState({searchName:event.target.value})}/>
                <Button type="primary" onClick={()=>this.getProducts(1)}>搜索</Button>
            </span>
        )
        const extra = (
            <Button type="primary" onClick={()=>this.props.history.push('/product/addupdate')}>
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
                    defaultPageSize:PAGE_SIZE,
                    showQuickJumper:true,
                    total:total,
                    onChange:(page)=>this.getProducts(page)}} />
            </Card>
        )
    }
}

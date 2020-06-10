import React, { Component } from 'react'
import {Card,List} from 'antd'
import {ArrowLeftOutlined} from '@ant-design/icons';
import Item from 'antd/lib/list/Item';
import LinkButton from '../../components/link-button/link-button'
import {BASE_IMG_URL} from '../../utils/constants'
import {reqCategory} from '../../api/index'

export default class Detail extends Component {
    state = {
        cName1:'',
        cName2:'',
    }

    async componentDidMount(){
        // 得到当前商品分类ID
        const {pCategoryId,categoryId} = this.props.location.state.product
        if(pCategoryId==='0'){
            // 一级分类下的商品
            const result = await reqCategory(categoryId)
            const cName1 = result.data.name
            this.setState({cName1})
        }else{
            // 二级分类下的商品
            // const result1 = await reqCategory(pCategoryId)
            // const result2 = await reqCategory(categoryId)
            // const cName1 = result1.data.name
            // const cName2 = result2.data.name
            const results = await Promise.all([reqCategory(pCategoryId),reqCategory(categoryId)])
            const cName1 = results[0].data.name
            const cName2 = results[1].data.name
            this.setState({
                cName1,cName2
            })
        }
    }

    render() {
        // 读取携带过来的state数据
        const {product} = this.props.location.state
        const {cName1,cName2} = this.state

        const title = (
            <span>
                <LinkButton>
                    <ArrowLeftOutlined style={{marginRight:15,fontSize:20}}
                    onClick={()=>this.props.history.goBack()} />
                </LinkButton>
                <span>商品详情</span>
            </span>
        )

        return (
            <Card title={title} className="product-detail">
                <List>
                    <Item>
                        <span className="left">商品名称：</span>
                        <span>{product.name}</span>
                    </Item>
                    <Item>
                        <span className="left">商品描述：</span>
                        <span>{product.desc}</span>
                    </Item>
                    <Item>
                        <span className="left">商品价格：</span>
                        <span>{product.price}元</span>
                    </Item>
                    <Item>
                        <span className="left">所属分类：</span>
                        <span>{cName1}{cName2?'-->'+cName2:''}</span>
                    </Item>
                    <Item>
                        <span className="left">商品图片：</span>
                        <span>
                            {product.imgs.map(img=>(
                                <img 
                                key={img}
                                src={BASE_IMG_URL+img}
                                alt="img" 
                                className='product-img'/>
                            ))}
                        </span>
                    </Item>
                    <Item>
                        <span className="left">商品介绍：</span>
                        <span dangerouslySetInnerHTML={{__html:product.detail}}></span>
                    </Item>
                </List>
            </Card>
        )
    }
}

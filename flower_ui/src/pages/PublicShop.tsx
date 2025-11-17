import React from 'react'
import { Card, Typography, Button, Row, Col, Tag, Image } from 'antd'
import { ShopOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Meta } = Card

const PublicShop: React.FC = () => {
  // 模拟商品数据
  const mockProducts = [
    {
      id: 1,
      name: '红玫瑰花束',
      description: '11朵精选红玫瑰，象征爱情与浪漫',
      price: 99,
      originalPrice: 128,
      image: '/api/placeholder/flower-rose.jpg',
      tags: ['热销', '经典'],
      inStock: true
    },
    {
      id: 2,
      name: '向日葵花束',
      description: '阳光灿烂的向日葵，传递温暖与希望',
      price: 68,
      originalPrice: 88,
      image: '/api/placeholder/flower-sunflower.jpg',
      tags: ['清新', '阳光'],
      inStock: true
    },
    {
      id: 3,
      name: '百合花篮',
      description: '优雅的百合花篮，适合各种场合',
      price: 158,
      originalPrice: 188,
      image: '/api/placeholder/flower-lily.jpg',
      tags: ['高端', '优雅'],
      inStock: false
    },
    {
      id: 4,
      name: '康乃馨花束',
      description: '温馨的康乃馨，表达感恩与祝福',
      price: 78,
      originalPrice: 98,
      image: '/api/placeholder/flower-carnation.jpg',
      tags: ['感恩', '温馨'],
      inStock: true
    }
  ]

  return (
    <div className="shop-container">
      <div className="shop-header">
        <Title level={1} className="shop-title">🌺 花言花语</Title>
        <Paragraph className="shop-subtitle" style={{ fontSize: 18 }}>
          用鲜花传递心意，让每一束花都有故事
        </Paragraph>
      </div>

      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={3}>热门商品</Title>
        <Paragraph style={{ maxWidth: '600px', margin: '0 auto', color: '#666' }}>
          精选优质花材，专业花艺师制作，为您的特别时刻增添浪漫色彩
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {mockProducts.map((product) => (
          <Col xs={24} sm={12} md={6} key={product.id}>
            <Card
              hoverable
              className="product-card"
              cover={
                <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShopOutlined style={{ fontSize: 48, color: '#ccc' }} />
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  disabled={!product.inStock}
                  block
                >
                  {product.inStock ? '立即购买' : '暂时售罄'}
                </Button>
              ]}
              bodyStyle={{ height: '200px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Title level={5} style={{ margin: '0 0 8px 0', lineHeight: 1.2 }}>{product.name}</Title>
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: 14,
                    color: '#666',
                    flexGrow: 1
                  }}
                >
                  {product.description}
                </Paragraph>
                <div style={{ marginBottom: 12 }}>
                  {product.tags.map((tag) => (
                    <Tag key={tag} color="volcano" style={{ marginRight: 4, marginBottom: 4 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: '#ff6b6b' }}>
                      ¥{product.price}
                    </span>
                    {product.originalPrice && (
                      <span style={{ fontSize: 14, color: '#999', textDecoration: 'line-through', marginLeft: 8 }}>
                        ¥{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: product.inStock ? '#52c41a' : '#ff4d4f' }}>
                    {product.inStock ? '有货' : '缺货'}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: '48px', textAlign: 'center', padding: '32px 0', borderTop: '1px solid #f0f0f0' }}>
        <Title level={4}>🌸 联系我们</Title>
        <Row gutter={[16, 16]} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Col span={12}>
            <Text>📍 门店地址：请到店选购</Text>
          </Col>
          <Col span={12}>
            <Text>📞 联系电话：到店咨询</Text>
          </Col>
          <Col span={12}>
            <Text>⏰ 营业时间：09:00 - 21:00</Text>
          </Col>
          <Col span={12}>
            <Text>🌐 配送范围：10km内</Text>
          </Col>
        </Row>
        <div style={{ marginTop: '24px' }}>
          <Button size="large" type="primary" onClick={() => window.open('/admin/login', '_blank')}>
            管理员登录
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PublicShop
# 🌺 【花言花语】鲜花售卖系统

## 项目简介
为【花言花语】花店开发的在线销售平台，扩展10km范围内的线上销售渠道，实现从纯线下门店到线上线下结合的经营模式升级。

## 技术栈

### 后端技术
- **Spring Boot 3.2.0** - 现代化Java Web框架
- **MyBatis-Plus 3.5.5** - 增强版MyBatis（Spring Boot 3兼容）
- **MySQL 8.0+** - 关系型数据库
- **Java 21** - 最新LTS版本
- **Maven 3.9+** - 项目构建管理

### 前端技术（计划中）
- **React 18.2+** - 现代化UI框架
- **TypeScript 5.0+** - 类型安全
- **Ant Design 5.0+** - UI组件库
- **Zustand 4.4+** - 状态管理

## 项目结构

```
flower-shop/
├── src/
│   ├── main/
│   │   ├── java/com/flower/shop/
│   │   │   ├── FlowerShopApplication.java      # 启动类
│   │   │   ├── controller/                    # 控制器层
│   │   │   ├── service/                       # 服务层
│   │   │   ├── mapper/                        # MyBatis-Plus映射器
│   │   │   ├── entity/                        # 实体类
│   │   │   ├── dto/                           # 数据传输对象
│   │   │   ├── config/                        # 配置类
│   │   │   └── util/                          # 工具类
│   │   └── resources/
│   │       ├── application.yml                # 配置文件
│   │       └── db/                           # 数据库脚本
│   └── test/                                  # 测试代码
├── pom.xml                                    # Maven配置
├── application.yml                            # 配置文件
└── 数据库初始化脚本.sql                        # 数据库脚本
```

## 快速开始

### 环境要求
- JDK 21+
- Maven 3.9+
- MySQL 8.0+

### 数据库准备
1. 启动MySQL服务
2. 执行数据库初始化脚本：
```bash
mysql -u root < 数据库初始化脚本.sql
```

### 启动项目
1. 克隆项目到本地
2. 进入项目目录：
```bash
cd flower-shop
```
3. 安装依赖：
```bash
mvn clean install
```
4. 启动项目：
```bash
mvn spring-boot:run
```

### 测试接口
项目启动成功后，可以访问以下测试接口：

1. **健康检查**：
```
GET http://localhost:8080/api/test/health
```

2. **数据库连接测试**：
```
GET http://localhost:8080/api/test/db
```

3. **系统信息**：
```
GET http://localhost:8080/api/test/info
```

### 默认账号
- **管理员账号**：admin
- **密码**：admin123

## 核心功能模块

### 第一期：基础销售流程
- [x] 后台管理系统
- [x] 商品管理
- [x] 商品展示
- [ ] 游客下单流程

### 第二期：完善订单管理
- [ ] 购物车功能
- [ ] 订单处理
- [ ] 库存管理
- [ ] 配送管理

### 第三期：用户体验优化
- [ ] 用户系统
- [ ] 场景分类
- [ ] 界面美化

## 数据库设计

### 核心表结构
- **categories** - 商品分类（花材分类 + 包装分类，使用type字段区分：FLOWER/PACKAGING）
- **products** - 商品信息（关联categories表，status字段：0-下架，1-上架，featured字段：0-不推荐，1-推荐）
- **inventory** - 库存管理（stock_quantity字段：库存数量，low_stock_threshold字段：预警阈值）
- **orders** - 订单主表（status字段：PENDING,PAID,PREPARING,DELIVERING,COMPLETED,CANCELLED，通过delivery_address_id关联配送地址）
- **order_items** - 订单详情（记录商品购买数量和价格快照）
- **users** - 用户（管理员）
- **delivery_addresses** - 配送地址（记录每笔订单的配送地址，支持省市区分层存储）

### 枚举值设计
所有枚举值使用大写：
- 订单状态：PENDING, PAID, PREPARING, DELIVERING, COMPLETED, CANCELLED
- 支付方式：ALIPAY, WECHAT, CASH, MOCK
- 用户角色：ADMIN, CUSTOMER
- 商品状态：0(下架), 1(上架)
- 商品推荐：0(不推荐), 1(推荐)
- 分类状态：0(禁用), 1(启用)

## 配置说明

### 数据库配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/flower_shop?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password:
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### MyBatis-Plus配置
```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
```

## 开发规范

### 代码规范
- 遵循阿里巴巴Java开发手册
- 使用Lombok简化代码
- 统一异常处理
- RESTful API设计

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

## 部署说明

### 本地开发
- 使用Spring Boot内置Tomcat
- 支持热重载（spring-boot-devtools）
- 日志输出到控制台和文件

### 生产环境（待定）
- 支持Docker容器化部署
- 云服务器部署方案待定
- SSL证书配置待定

## 联系信息

- 项目名称：花言花语
- 开发模式：单人开发
- 技术支持：基于官方文档和开源社区

## 更新日志

### v1.0.0 (2025-11-16)
- ✅ 完成数据库设计和初始化
- ✅ 搭建Spring Boot项目结构
- ✅ 实现基础测试接口
- ✅ 配置数据库连接
- 🔄 正在进行：核心业务功能开发
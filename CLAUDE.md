# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

【花言花语】鲜花售卖系统 - 为花店开发的在线销售平台，扩展10km范围内的线上销售渠道，实现从纯线下门店到线上线下结合的经营模式升级。

## 技术架构

```
Frontend (React 18 + TypeScript + Vite)
    ↓ HTTP/REST API
Backend (Spring Boot 3.2 + MyBatis-Plus)
    ↓ JDBC
Database (MySQL 8.0)
```

## 开发命令

### 前端开发 (flower_ui/)
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 后端开发 (flower_server/)
```bash
# 编译项目
mvn compile

# 运行测试
mvn test

# 打包项目
mvn clean package

# 运行应用
java -jar target/flower-shop-1.0.0.jar

# 跳过测试打包
mvn clean package -DskipTests
```

## 项目结构

### 前端结构 (flower_ui/)
- React 18 + TypeScript + Vite
- Material UI (MUI) 7.3.5 组件库
- Zustand 状态管理
- Axios HTTP客户端
- React Router 6.15+ 路由管理

### 后端结构 (flower_server/)
- Spring Boot 3.2 + Java 21
- MyBatis-Plus 3.5.5 数据访问层
- Spring Security + JWT 认证
- MySQL 8.0 数据库
- Maven 构建工具

## 核心功能模块

### 1. 后台管理系统（老板端）
- 管理员登录和认证
- 商品管理（上架/下架花束和花篮）
- 库存管理（模拟"挂牌子"方式）
- 订单处理和配送管理
- 店铺设置

### 2. 线上商品展示模块
- 按花材分类：玫瑰、百合、夜来香、康乃馨、向日葵
- 按包装分类：花束、花篮
- 按场景分类：生日、情人节、纪念日、看望病人
- 库存状态显示

### 3. 游客下单模块
- 无需注册购买
- 地址验证（10km范围）
- 配送时间选择
- 在线支付

### 4. 购物车模块
- 多商品购买
- 实时价格计算
- 库存检查

### 5. 订单跟踪模块
- 订单状态管理
- 客户订单查询
- 新订单提醒

## 关键业务规则

### 商品管理
- 5种花材：玫瑰、百合、夜来香、康乃馨、向日葵
- 2种包装：花束、花篮
- 花篮价格高于花束
- 库存按具体商品管理

### 配送规则
- 仅限10km范围内配送
- 地址自动验证
- 配送前电话确认

### 订单流程
- 支付成功后扣减库存
- 新订单立即通知
- 订单状态：已付款→准备中→配送中→已完成

## 开发注意事项

### MyBatis-Plus兼容性
- 必须使用 `mybatis-plus-spring-boot3-starter`（Spring Boot 3.x专用）
- 不能使用 `mybatis-plus-boot-starter`（仅适用于Spring Boot 2.x）

### 前端开发
- 使用TypeScript进行类型安全开发
- 遵循Material UI设计规范
- 使用Zustand进行状态管理，保持简洁

### 后端开发
- 使用阿里巴巴Java开发手册规范
- RESTful API设计
- 统一的JSON响应结构
- 全局异常处理

### 数据库设计
- 字段命名使用下划线分隔
- 注意MyBatis-Plus的实体类映射
- 支持事务管理

## 开发环境要求

### 前端
- Node.js 18.0+
- npm 9.0+

### 后端
- Java 21
- Maven 3.9+

### 数据库
- MySQL 8.0+

## 支付方案

当前为模拟支付，点击支付后直接返回"支付成功"，订单进入"已付款"状态。待营业执照办理后接入真实支付。
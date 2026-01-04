# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 快速启动命令

### 前端开发 (flower_ui/)
```bash
cd ~/Projects/flower_shop/flower_ui && npm install
cd ~/Projects/flower_shop/flower_ui && npm run dev
cd ~/Projects/flower_shop/flower_ui && npm run build
cd ~/Projects/flower_shop/flower_ui && npm run preview
```

### 后端开发 (flower_server/)
```bash
# 本地开发（必须设置环境变量）
UPLOAD_PATH=uploads/ mvn spring-boot:run

# 编译测试打包
cd ~/Projects/flower_shop/flower_server && mvn compile
cd ~/Projects/flower_shop/flower_server && mvn test
cd ~/Projects/flower_shop/flower_server && mvn clean package
cd ~/Projects/flower_shop/flower_server && mvn clean package -DskipTests

# 生产运行
java -jar target/flower-shop-1.0.0.jar
```

### Docker 部署
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 技术栈版本

### 前端 (flower_ui/)
- React 18.2.0 + TypeScript 5.9.3 + Vite 5.0.0
- Material UI 7.3.5
- Zustand 4.5.7 状态管理
- React Router 6.15.0
- Axios 1.5.0

### 后端 (flower_server/)
- Spring Boot 3.2.0 + Java 21
- MyBatis-Plus 3.5.5 (Spring Boot 3专用版本)
- Spring Security + JWT
- MySQL 8.0

## 目录结构

```
flower_shop/
├── flower_ui/              # 前端项目
│   ├── src/
│   │   ├── api/           # API接口封装
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面
│   │   │   ├── admin/     # 管理端
│   │   │   └── shop/      # 客户端
│   │   └── store/         # Zustand状态管理
│   └── package.json
├── flower_server/          # 后端项目
│   ├── src/main/java/com/flower/shop/
│   │   ├── controller/    # 控制器
│   │   ├── service/       # 服务层
│   │   ├── mapper/        # MyBatis映射
│   │   ├── entity/        # 实体类
│   │   ├── dto/           # 数据传输对象
│   │   ├── config/        # 配置类
│   │   └── util/          # 工具类
│   ├── uploads/           # 本地开发时的上传文件目录
│   └── pom.xml
├── docker/                # Docker部署配置
│   ├── frontend/Dockerfile
│   ├── backend/Dockerfile
│   └── frontend/nginx.conf
├── docker-compose.yml
└── README.md
```

## 重要配置说明

### 环境变量
- `UPLOAD_PATH`: 文件上传路径
  - 本地开发: `uploads/` (相对于项目根目录)
  - Docker: `/app/uploads/` (容器内路径)
- `BASE_URL`: 图片访问基础URL
- `SPRING_DATASOURCE_*`: 数据库连接配置

### 后端服务地址
- 本地开发: `http://localhost:8080/api`
- 生产环境: 根据配置而定

### 跨域配置
已配置允许 `http://localhost:5173` 和 `http://localhost:3000`

## 代码规范

### 后端开发
- 遵循阿里巴巴Java开发手册
- RESTful API设计
- 统一JSON响应结构
- 全局异常处理
- 实体类字段使用驼峰命名，数据库字段使用下划线

### 前端开发
- TypeScript类型安全
- Material UI设计规范
- Zustand状态管理
- 组件化开发

## 关键业务规则

### 商品分类
- 花材: 玫瑰、百合、夜来香、康乃馨、向日葵
- 包装: 花束、花篮
- 花篮价格 > 花束价格

### 配送规则
- 限制10km范围
- 地址自动验证

### 订单状态流转
PENDING → PAID → PREPARING → DELIVERING → COMPLETED

## MyBatis-Plus兼容性
⚠️ Spring Boot 3.x 必须使用 `mybatis-plus-spring-boot3-starter`

## 提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `refactor`: 重构
- `docs`: 文档更新
- `style`: 格式调整

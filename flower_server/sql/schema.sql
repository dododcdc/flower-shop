-- =====================================================
-- 【花言花语】鲜花售卖系统 - 数据库建表脚本
-- 版本：v2.0
-- 更新日期：2026-01-04
-- 说明：本文件仅包含建表语句，初始化数据请参见 init_data.sql
-- =====================================================

-- =====================================================
-- 1. 用户表（无依赖）
-- =====================================================
create table users
(
    id         bigint auto_increment comment '用户ID'
        primary key,
    username   varchar(50)                                                    not null comment '用户名',
    password   varchar(255)                                                   not null comment '密码(加密)',
    email      varchar(100)                                                   null comment '邮箱',
    phone      varchar(20)                                                    null comment '电话',
    role       enum ('ROLE_ADMIN', 'ROLE_CUSTOMER') default 'ROLE_CUSTOMER'   null comment '角色',
    is_active  tinyint(1)                           default 1                 null comment '是否启用',
    last_login timestamp                                                      null comment '最后登录时间',
    created_at timestamp                            default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at timestamp                            default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint username
        unique (username)
)
    comment '用户表' engine = InnoDB;

-- =====================================================
-- 2. 商品分类表（无依赖）
-- =====================================================
create table categories
(
    id         bigint auto_increment comment '分类ID'
        primary key,
    name       varchar(50)                          not null comment '分类名称',
    code       varchar(20)                          not null comment '分类代码',
    type       enum ('FLOWER', 'PACKAGING')         not null comment '分类类型：FLOWER-花材，PACKAGING-包装',
    sort_order int        default 0                 null comment '排序顺序',
    status     tinyint(1) default 1                 null comment '分类状态：0-禁用，1-启用',
    created_at timestamp  default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint code
        unique (code)
)
    comment '商品分类表' engine = InnoDB;

-- =====================================================
-- 3. 商品表（依赖categories）
-- =====================================================
create table products
(
    id                  bigint auto_increment comment '商品ID'
        primary key,
    name                varchar(100)                         not null comment '商品名称',
    description         text                                 null comment '商品描述',
    price               decimal(10, 2)                       not null comment '价格',
    original_price      decimal(10, 2)                       null comment '原价',
    flower_language     text                                 null comment '花语寓意',
    care_guide          text                                 null comment '养护指南',
    category_id         bigint                               not null comment '分类ID',
    sort_order          int        default 0                 null comment '排序顺序',
    stock_quantity      int        default 0                 not null comment '库存数量',
    low_stock_threshold int        default 5                 null comment '低库存预警阈值',
    status              tinyint(1) default 1                 null comment '商品状态：0-下架，1-上架',
    featured            tinyint(1) default 0                 null comment '是否推荐：0-不推荐，1-推荐',
    created_at          timestamp  default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at          timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint products_ibfk_1
        foreign key (category_id) references categories (id)
)
    comment '商品表' engine = InnoDB;

create index idx_product_category
    on products (category_id);

create index idx_product_created_at
    on products (created_at desc);

create index idx_product_status
    on products (status);

create index idx_products_category_id
    on products (category_id);

create index idx_products_is_active
    on products (status);

create index idx_products_low_stock_threshold
    on products (low_stock_threshold);

create index idx_products_sort_order
    on products (sort_order);

create index idx_products_stock_quantity
    on products (stock_quantity);

-- =====================================================
-- 4. 商品图片表（依赖products）
-- =====================================================
create table product_images
(
    id         bigint auto_increment
        primary key,
    product_id bigint                              not null comment '商品ID',
    image_path varchar(500)                        not null comment '图片路径',
    image_type tinyint   default 2                 null comment '图片类型: 1-主图, 2-副图',
    sort_order int       default 0                 null comment '排序',
    created_at timestamp default CURRENT_TIMESTAMP null,
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint product_images_ibfk_1
        foreign key (product_id) references products (id)
            on delete cascade
)
    comment '商品图片表' engine = InnoDB;

create index idx_product_image_product_type
    on product_images (product_id, image_type);

-- =====================================================
-- 5. 订单表（依赖users）
-- =====================================================
create table orders
(
    id                  bigint auto_increment comment '订单ID'
        primary key,
    user_id             bigint                                                                                          null comment '关联的用户ID',
    order_no            varchar(32)                                                                                     not null comment '订单号',
    customer_name       varchar(50)                                                                                     not null comment '客户姓名',
    customer_phone      varchar(20)                                                                                     not null comment '客户电话',
    total_amount        decimal(10, 2)                                                                                  not null comment '订单总金额',
    delivery_fee        decimal(10, 2)                                                        default 0.00              null comment '配送费',
    final_amount        decimal(10, 2)                                                                                  not null comment '实付金额',
    status              enum ('PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED') default 'PENDING'         not null comment '订单状态: PENDING-待确认, PREPARING-准备中, DELIVERING-配送中, COMPLETED-已完成, CANCELLED-已取消',
    payment_status      enum ('PENDING', 'PAID', 'REFUNDED')                                  default 'PENDING'         null comment '支付状态',
    delivery_time       datetime                                                                                        null comment '期望配送时间',
    notes               text                                                                                            null comment '订单备注',
    created_at          timestamp                                                             default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at          timestamp                                                             default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    card_content        varchar(500)                                                                                    null comment '贺卡内容',
    card_sender         varchar(100)                                                                                    null comment '贺卡署名',
    card_style          varchar(50)                                                                                     null comment '贺卡风格',
    payment_method      enum ('ALIPAY', 'WECHAT', 'ON_DELIVERY')                              default 'ON_DELIVERY'     null comment '支付方式',
    delivery_start_time datetime                                                                                        null comment '配送开始时间',
    delivery_end_time   datetime                                                                                        null comment '配送结束时间',
    constraint order_no
        unique (order_no)
)
    comment '订单表' engine = InnoDB;

create index idx_orders_created_at
    on orders (created_at);

create index idx_orders_customer_phone
    on orders (customer_phone);

create index idx_orders_payment_status
    on orders (payment_status);

create index idx_orders_status
    on orders (status);

-- =====================================================
-- 6. 配送地址表（依赖orders）
-- =====================================================
create table delivery_addresses
(
    id             bigint auto_increment comment '地址ID'
        primary key,
    order_id       bigint                              not null comment '订单ID',
    customer_name  varchar(100)                        not null comment '收货人姓名',
    customer_phone varchar(20)                         not null comment '收货人手机',
    address_text   varchar(500)                        not null comment '完整地址文本',
    created_at     timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    constraint delivery_addresses_ibfk_1
        foreign key (order_id) references orders (id)
            on delete cascade
)
    comment '配送地址表' engine = InnoDB;

create index idx_delivery_addresses_order_id
    on delivery_addresses (order_id);

-- =====================================================
-- 7. 订单详情表（依赖orders, products）
-- =====================================================
create table order_items
(
    id            bigint auto_increment comment '订单项ID'
        primary key,
    order_id      bigint                              not null comment '订单ID',
    product_id    bigint                              not null comment '商品ID',
    product_name  varchar(100)                        not null comment '商品名称(冗余字段)',
    product_price decimal(10, 2)                      not null comment '商品单价(冗余字段)',
    quantity      int                                 not null comment '购买数量',
    total_price   decimal(10, 2)                      not null comment '小计金额',
    created_at    timestamp default CURRENT_TIMESTAMP null comment '创建时间',
    constraint order_items_ibfk_1
        foreign key (order_id) references orders (id)
            on delete cascade,
    constraint order_items_ibfk_2
        foreign key (product_id) references products (id)
)
    comment '订单详情表' engine = InnoDB;

create index idx_order_items_order_id
    on order_items (order_id);

create index idx_order_items_product_id
    on order_items (product_id);

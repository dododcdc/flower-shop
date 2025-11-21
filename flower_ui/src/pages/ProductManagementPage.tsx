import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1B3A2B 0%, #2C5F3C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          商品管理
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          管理您的花卉商品库存和信息
        </Typography>
      </motion.div>

      {/* Action Cards */}
      <Grid container spacing={3}>
        {[
          {
            title: '添加新商品',
            description: '录入新的花卉商品到系统中',
            icon: <AddCircleOutlineIcon />,
            color: 'primary',
          },
          {
            title: '编辑商品',
            description: '修改现有商品的价格、描述等信息',
            icon: <EditIcon />,
            color: 'info',
          },
          {
            title: '库存管理',
            description: '查看和管理商品库存数量',
            icon: <InventoryIcon />,
            color: 'success',
          },
          {
            title: '删除商品',
            description: '移除不再销售的商品',
            icon: <DeleteIcon />,
            color: 'error',
          },
        ].map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(248, 246, 240, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: `${action.color}.main`,
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          sx={{
            mt: 4,
            background: 'rgba(212, 175, 55, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
              📝 功能说明
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
              商品管理功能正在开发中，后续将提供完整的商品增删改查、库存管理、价格调整等功能。
              敬请期待！
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ProductManagementPage;
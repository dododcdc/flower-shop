import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import MapIcon from '@mui/icons-material/Map';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonPinIcon from '@mui/icons-material/PersonPin';

const DeliveryManagementPage: React.FC = () => {
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
          配送管理
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          管理配送员和配送路线
        </Typography>
      </motion.div>

      {/* Delivery Functions */}
      <Grid container spacing={3}>
        {[
          {
            title: '配送员管理',
            description: '管理配送团队信息和排班',
            icon: <PersonPinIcon />,
            color: 'primary',
          },
          {
            title: '路线规划',
            description: '优化配送路线和时间安排',
            icon: <MapIcon />,
            color: 'info',
          },
          {
            title: '配送跟踪',
            description: '实时跟踪配送进度和状态',
            icon: <DirectionsBikeIcon />,
            color: 'success',
          },
          {
            title: '时间安排',
            description: '管理配送时间段和预约系统',
            icon: <ScheduleIcon />,
            color: 'warning',
          },
        ].map((func, index) => (
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
                        bgcolor: `${func.color}.main`,
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {func.icon}
                    </Box>
                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                      {func.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {func.description}
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
              配送管理功能正在开发中，后续将提供完整的配送员管理、路线优化、实时跟踪等功能。
              敬请期待！
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default DeliveryManagementPage;
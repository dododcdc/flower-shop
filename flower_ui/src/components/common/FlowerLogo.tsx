import React from 'react';
import { Box, SvgIcon, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const FlowerLogo: React.FC<{ size?: number | { xs?: number; sm?: number; md?: number; lg?: number } }> = ({ size = 80 }) => {
  const theme = useTheme();

  const getResponsiveSize = (sizeProp: typeof size) => {
    if (typeof sizeProp === 'number') {
      return { xs: sizeProp, sm: sizeProp, md: sizeProp };
    }
    return {
      xs: sizeProp.xs || 70,
      sm: sizeProp.sm || sizeProp.xs || 80,
      md: sizeProp.md || sizeProp.sm || 100,
    };
  };

  const responsiveSize = getResponsiveSize(size);

  return (
    <Box
      component={motion.div}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: responsiveSize,
        height: responsiveSize,
      }}
    >
      {/* Outer Glow */}
      <Box
        component={motion.div}
        animate={{
          boxShadow: [
            `0 0 30px ${theme.palette.primary.main}`,
            `0 0 50px ${theme.palette.primary.light}`,
            `0 0 30px ${theme.palette.primary.main}`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          width: responsiveSize,
          height: responsiveSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light} 0%, transparent 70%)`,
          opacity: 0.3,
        }}
      />

      {/* Main Flower Logo */}
      <SvgIcon
        component={motion.svg}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        viewBox="0 0 100 100"
        sx={{
          width: responsiveSize,
          height: responsiveSize,
          color: theme.palette.primary.main,
          filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.4))',
        }}
      >
        <motion.path
          d="M50 20 C55 15, 65 15, 70 20 C75 25, 75 35, 70 40 C65 45, 55 45, 50 40 C45 45, 35 45, 30 40 C25 35, 25 25, 30 20 C35 15, 45 15, 50 20"
          fill="url(#goldGradient)"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Petal Details */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
          <motion.path
            key={index}
            d="M50 40 C52 35, 58 35, 60 40 C62 45, 60 50, 55 52 C52 53, 48 53, 45 52 C40 50, 38 45, 40 40 C42 35, 48 35, 50 40"
            fill={theme.palette.primary.light}
            opacity={0.7}
            transform={`rotate(${rotation} 50 50)`}
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 0.9, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2
            }}
          />
        ))}

        {/* Center */}
        <circle
          cx="50"
          cy="50"
          r="12"
          fill={theme.palette.secondary.dark}
          stroke={theme.palette.primary.main}
          strokeWidth="2"
        />

        {/* Inner Details */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill={theme.palette.primary.light}
          opacity={0.8}
        />

        <circle
          cx="50"
          cy="50"
          r="4"
          fill={theme.palette.secondary.dark}
        />

        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="50%" stopColor={theme.palette.primary.light} />
            <stop offset="100%" stopColor={theme.palette.primary.dark} />
          </linearGradient>
        </defs>
      </SvgIcon>

      {/* Sparkle Effects */}
      {[1, 2, 3, 4].map((sparkle) => (
        <Box
          key={sparkle}
          component={motion.div}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: sparkle * 0.5,
          }}
          sx={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.light,
            top: `${25 + sparkle * 10}%`,
            left: `${20 + sparkle * 15}%`,
          }}
        />
      ))}
    </Box>
  );
};

export default FlowerLogo;
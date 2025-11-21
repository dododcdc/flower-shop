import React from 'react';
import { Box, useTheme } from '@mui/material';
import LoginForm from './LoginForm';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${theme.palette.primary.main} 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${theme.palette.primary.light} 0%, transparent 50%),
            radial-gradient(circle at 50% 10%, ${theme.palette.secondary.light} 0%, transparent 40%)
          `,
          animation: 'float 20s ease-in-out infinite',
        }}
      />

      {/* Golden Particles Effect */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, ${theme.palette.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 20% 40%, ${theme.palette.primary.light} 1px, transparent 1px),
            radial-gradient(circle at 30% 60%, ${theme.palette.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 40% 30%, ${theme.palette.primary.light} 1px, transparent 1px),
            radial-gradient(circle at 50% 80%, ${theme.palette.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 60% 10%, ${theme.palette.primary.light} 1px, transparent 1px),
            radial-gradient(circle at 70% 50%, ${theme.palette.primary.main} 1px, transparent 1px),
            radial-gradient(circle at 80% 90%, ${theme.palette.primary.light} 1px, transparent 1px),
            radial-gradient(circle at 90% 25%, ${theme.palette.primary.main} 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          animation: 'sparkle 15s linear infinite',
        }}
      />

      {/* Main Content Container */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 500,
          mx: 3,
        }}
      >
        <LoginForm />
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(20px) rotate(-1deg); }
        }

        @keyframes sparkle {
          0% { transform: translateY(0px) translateX(0px); }
          100% { transform: translateY(-100px) translateX(-50px); }
        }
      `}</style>
    </Box>
  );
};

export default LoginPage;

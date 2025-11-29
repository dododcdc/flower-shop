import React from 'react';
import { Box, Container, ContainerProps, Typography } from '@mui/material';

interface PageContainerProps extends Omit<ContainerProps, 'children'> {
  children: React.ReactNode;
  title?: string;
  maxWidth?: ContainerProps['maxWidth'];
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  maxWidth = 'lg',
  ...containerProps
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
        ...containerProps.sx,
      }}
      {...containerProps}
    >
      {title && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              color: '#1B3A2B',
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '28px', sm: '36px', md: '42px' },
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      {children}
    </Container>
  );
};

export default PageContainer;
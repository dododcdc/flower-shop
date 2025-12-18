import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider
} from '@mui/material';
import { Person, PersonOutline, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface WelcomeDialogProps {
    open: boolean;
    onClose: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const { setGuestId } = useAuthStore();

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleRegister = () => {
        onClose();
        navigate('/register');
    };

    const handleGuest = () => {
        // 生成一个随机的游客ID，例如：游客8572
        const randomId = Math.floor(1000 + Math.random() * 9000); // 4位随机数
        setGuestId(`游客${randomId}`);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleGuest} // 点击遮罩层默认按游客处理
            aria-labelledby="welcome-dialog-title"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    minWidth: 320,
                    bgcolor: '#fafafa'
                }
            }}
        >
            <DialogTitle id="welcome-dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1B3A2B' }}>
                🌸 欢迎来到花言花语
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', mb: 3 }}>
                    请选择您的访问身份
                </DialogContentText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Login />}
                        onClick={handleLogin}
                        sx={{
                            bgcolor: '#1B3A2B',
                            color: '#F4E4C1',
                            py: 1.5,
                            '&:hover': { bgcolor: '#14291F' }
                        }}
                    >
                        登录已有账号
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={handleRegister}
                        sx={{
                            borderColor: '#1B3A2B',
                            color: '#1B3A2B',
                            py: 1.5,
                            '&:hover': { borderColor: '#14291F', bgcolor: 'rgba(27, 58, 43, 0.05)' }
                        }}
                    >
                        注册新账号
                    </Button>

                    <Divider sx={{ my: 1 }}>或者</Divider>

                    <Button
                        variant="text"
                        startIcon={<PersonOutline />}
                        onClick={handleGuest}
                        sx={{
                            color: '#666',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' }
                        }}
                    >
                        以游客身份浏览
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default WelcomeDialog;

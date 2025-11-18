import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './App.css'

// 创建Material UI主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // 绿色主题，符合花店主题
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#ed6c02', // 橙色主题
      light: '#ff9800',
      dark: '#e65100',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <header className="app-header">
          <h1>🌺 花言花语</h1>
          <p>前端项目初始化成功</p>
          <p>React 19 + Material UI 7.3.5 + TypeScript</p>
        </header>
      </div>
    </ThemeProvider>
  )
}

export default App

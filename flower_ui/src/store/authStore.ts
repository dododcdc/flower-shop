import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthStore, LoginRequest, User } from '../types/auth'
import { STORAGE_KEYS } from '../types/auth'
import { authAPI } from '../services/authAPI'

// 创建认证状态管理Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * 用户登录
       */
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })

        try {
          // 调用登录API
          const response = await authAPI.login(credentials)

          if (response.code === 200) {
            const { token, ...user } = response.data

            // 更新状态
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })

            // 设置axios默认请求头
            import('axios').then((axios) => {
              axios.default.defaults.headers.common['Authorization'] = `Bearer ${token}`
            })

            console.log('登录成功:', user)
          } else {
            // 登录失败
            set({
              error: response.message || '登录失败，请检查用户名和密码',
              isLoading: false,
            })
          }
        } catch (error) {
          // 处理网络或API错误
          const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试'
          set({
            error: errorMessage,
            isLoading: false,
          })
          console.error('登录错误:', error)
        }
      },

      /**
       * 用户登出
       */
      logout: () => {
        const currentState = get()

        // 清除认证状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })

        // 清除localStorage中的认证数据
        localStorage.removeItem(STORAGE_KEYS.AUTH)

        // 清除axios默认请求头
        import('axios').then((axios) => {
          delete axios.default.defaults.headers.common['Authorization']
        })

        console.log('用户已登出:', currentState.user?.username)
      },

      /**
       * 清除错误信息
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * 设置加载状态
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      /**
       * 检查认证状态（应用启动时调用）
       */
      checkAuth: () => {
        const { token, user } = get()

        if (token && user) {
          // 验证token是否仍然有效
          set({ isLoading: true })

          authAPI.verifyToken()
            .then((isValid) => {
              if (isValid) {
                // Token有效，设置认证状态
                set({
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                })

                // 设置axios请求头
                import('axios').then((axios) => {
                  axios.default.defaults.headers.common['Authorization'] = `Bearer ${token}`
                })

                console.log('认证检查通过:', user.username)
              } else {
                // Token无效，清除认证状态
                get().logout()
              }
            })
            .catch((error) => {
              console.error('Token验证失败:', error)
              get().logout()
            })
        } else {
          // 没有token或用户信息，设置为未认证状态
          set({
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      /**
       * 更新用户信息
       */
      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData }
          })
        }
      },

      /**
       * 刷新token（如果支持的话）
       */
      refreshToken: async () => {
        const { user } = get()
        if (!user) return

        try {
          // 这里可以调用刷新token的API（如果后端支持）
          const response = await authAPI.getCurrentUser()

          if (response.code === 200) {
            // 更新用户信息
            set({ user: response.data })
          }
        } catch (error) {
          console.error('刷新token失败:', error)
          // 刷新失败，可能需要重新登录
          get().logout()
        }
      },
    }),
    {
      // 持久化配置
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),

      // 只持久化这些字段，不包括loading和error状态
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),

      // 版本控制，如果数据结构发生变化，可以更新版本号
      version: 1,

      // 迁移函数，处理版本升级
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 从版本0迁移到版本1的逻辑
          return {
            ...persistedState,
            // 可以在这里添加新的字段或修改现有字段
          }
        }
        return persistedState
      },

      // 在存储前调用
      onRehydrateStorage: () => (state) => {
        console.log('认证状态已从存储中恢复:', state)

        // 恢复后自动检查认证状态
        if (state) {
          setTimeout(() => {
            state.checkAuth()
          }, 100)
        }
      },
    }
  )
)

// 导出辅助函数
export const authActions = {
  // 获取当前用户
  getCurrentUser: () => useAuthStore.getState().user,

  // 检查是否已认证
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,

  // 获取token
  getToken: () => useAuthStore.getState().token,

  // 检查是否为管理员
  isAdmin: () => {
    const { user, isAuthenticated } = useAuthStore.getState()
    return isAuthenticated && user?.role === 'ADMIN'
  },

  // 登录辅助函数（带验证）
  loginWithValidation: async (username: string, password: string) => {
    const { login } = useAuthStore.getState()

    // 前端验证
    if (!username.trim()) {
      throw new Error('用户名不能为空')
    }
    if (username.trim().length < 3) {
      throw new Error('用户名至少需要3个字符')
    }
    if (!password) {
      throw new Error('密码不能为空')
    }
    if (password.length < 6) {
      throw new Error('密码至少需要6个字符')
    }

    // 调用登录
    return login({ username: username.trim(), password })
  },
}

// 导出默认的store hook
export default useAuthStore
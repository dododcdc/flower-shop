export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; userId: number; username: string; role: string; email?: string; phone?: string; lastLogin?: string; }

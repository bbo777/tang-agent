// 第一步：必须在文件最顶部声明 'use client'
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// 确保 supabase 客户端初始化文件路径正确
import { createClient } from '@/lib/supabase/client'
// 确保 shadcn 组件已正确安装并可导入
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// 确保 Toast 组件正确实现
import { useToast, ToastProvider, ToastViewport, Toast } from '@/components/ui/toast'

// 修复 Toast 组件（如果缺失需补充）
function ToastComponent() {
  return (
    <ToastViewport>
      <Toast>
        <div className="toast-content" />
      </Toast>
    </ToastViewport>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) return
    if (!supabase) {
      toast({
        title: '配置错误',
        description: '请先配置 Supabase 环境变量',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: '登录失败',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: '登录成功',
          description: '正在跳转到仪表盘',
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      toast({
        title: '系统错误',
        description: '请稍后再试',
        variant: 'destructive',
      })
      console.error('登录错误:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-destructive">配置缺失</CardTitle>
            <CardDescription>需要配置 Supabase 环境变量才能使用登录功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                请在项目根目录创建 <code className="bg-background px-1 py-0.5 rounded">.env.local</code> 文件，并添加以下内容：
              </p>
              <pre className="mt-2 text-xs bg-background p-3 rounded overflow-x-auto">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
              </pre>
              <p className="mt-2 text-sm text-muted-foreground">
                你可以从 <a href="https://supabase.com/dashboard" target="_blank" className="text-primary underline">Supabase 仪表板</a> 项目设置中获取这些信息。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>使用您的邮箱和密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            还没有账号？{' '}
            <Link href="/register" className="text-primary hover:underline">
              注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    // 确保 ToastProvider 完整包裹，且包含必要的视口组件
    <ToastProvider>
      <LoginForm />
      <ToastComponent />
    </ToastProvider>
  )
}
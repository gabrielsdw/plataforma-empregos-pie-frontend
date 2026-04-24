import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/20 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Entrar
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Não tem conta?{" "}
              </p>

              <div className="grid grid-cols-1 gap-2">
                <Link href="/signup/seeker" className="w-full">
                  <Button variant="outline" className="w-full" type="button">
                    Cadastrar como candidato
                  </Button>
                </Link>
                <Link href="/signup/business" className="w-full">
                  <Button variant="outline" className="w-full" type="button">
                    Cadastrar como empresa
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

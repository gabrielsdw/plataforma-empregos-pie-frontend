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

export type SignupVariant = "seeker" | "business"

type SignupFormProps = React.ComponentProps<typeof Card> & {
  variant?: SignupVariant
}

export function SignupForm({ variant = "seeker", className, ...props }: SignupFormProps) {
  const isBusiness = variant === "business"

  return (
    <Card className={className} {...props}>
      <CardHeader className="gap-2">
        <CardTitle>
          {isBusiness ? "Criar conta de Empresa" : "Criar conta de Candidato"}
        </CardTitle>
        <CardDescription>
          {isBusiness
            ? "Preencha os dados da sua organização para começar a publicar vagas."
            : "Preencha os campos abaixo para começar sua jornada."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-5">
          {isBusiness ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName">Nome da empresa</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="Ex: Arquitetura & Cia"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="companyEmail">E-mail corporativo</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="rh@empresa.com.br"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="industry">Setor de atuação</Label>
                <select
                  id="industry"
                  name="industry"
                  required
                  className="h-10 w-full border border-transparent border-b-input bg-transparent px-0 py-1 text-sm text-foreground outline-none transition-[color,border-color] focus-visible:border-b-ring"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione um setor
                  </option>
                  <option value="administrativo">Administrativo</option>
                  <option value="comercial">Comercial</option>
                  <option value="construcao">Construção</option>
                  <option value="educacao">Educação</option>
                  <option value="saude">Saúde</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail profissional</Label>
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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cv">Currículo (PDF)</Label>
                <div className="rounded-none border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                  <input
                    id="cv"
                    name="cv"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                  />
                  <label
                    htmlFor="cv"
                    className="cursor-pointer text-sm font-medium text-foreground"
                  >
                    Upload CV
                  </label>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full">
            {isBusiness ? "Criar conta da empresa" : "Criar minha conta"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {isBusiness ? (
              <>
                É um candidato?{" "}
                <Link
                  className="text-foreground underline underline-offset-4"
                  href="/signup/seeker"
                >
                  Cadastro de Candidato
                </Link>
              </>
            ) : (
              <>
                É uma empresa?{" "}
                <Link
                  className="text-foreground underline underline-offset-4"
                  href="/signup/business"
                >
                  Cadastro de Empresa
                </Link>
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

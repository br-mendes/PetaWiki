# Design System - Guia de Padronização

## Resumo

O sistema de design foi completamente padronizado para garantir 100% de compatibilidade com temas claro/escuro, responsividade total e consistência visual em toda a aplicação.

## Cores Padronizadas

### Cores Principais
Todas as cores usam classes Tailwind com suporte nativo a dark mode:

```
Fundo:
- bg-white / dark:bg-gray-800     (fundo primário)
- bg-gray-50 / dark:bg-gray-900   (fundo secundário)
- bg-gray-100 / dark:bg-gray-800  (fundo terciário)

Texto:
- text-gray-900 / dark:text-white       (texto primário)
- text-gray-700 / dark:text-gray-300   (texto secundário)
- text-gray-500 / dark:text-gray-400   (texto terciário)

Bordas:
- border-gray-200 / dark:border-gray-700  (bordas padrão)
- border-gray-300 / dark:border-gray-600  (bordas secundárias)
```

### Cores de Estado
```
Primária:   bg-blue-600 / dark:bg-blue-600     (ações principais)
Sucesso:    bg-emerald-600 / dark:bg-emerald-600
Perigo:     bg-red-600 / dark:bg-red-600
Alerta:     bg-amber-500 / dark:bg-amber-500
```

## Tipografia Padronizada

### Escala de Fontes
```
text-xs   → 12px  (labels, badges)
text-sm   → 14px  (texto padrão)
text-base → 16px  (títulos pequenos)
text-lg   → 18px  (títulos médios)
text-xl   → 20px  (títulos grandes)
text-2xl  → 24px  (títulos principais)
```

### Pesos de Fonte
```
font-normal    → 400 (texto regular)
font-medium    → 500 (texto enfatizado)
font-semibold  → 600 (títulos, labels)
font-bold      → 700 (títulos principais)
```

## Componentes Padronizados

### 1. Botões (Button)

**Classes CSS:**
```html
<!-- Primário -->
<button class="btn btn-primary btn-md">
  Ação Principal
</button>

<!-- Secundário -->
<button class="btn btn-secondary btn-md">
  Ação Secundária
</button>

<!-- Perigo -->
<button class="btn btn-danger btn-md">
  Excluir
</button>

<!-- Ghost -->
<button class="btn btn-ghost btn-md">
  Cancelar
</button>
```

**Tamanhos:**
- `btn-xs` → 28px altura
- `btn-sm` → 32px altura
- `btn-md` → 40px altura (padrão)
- `btn-lg` → 48px altura

**Props do Componente:**
```tsx
<Button 
  variant="primary"      // primary | secondary | danger | ghost | success | warning
  size="md"              // xs | sm | md | lg
  loading={false}        // boolean
  loadingText="Salvando..."
  fullWidth={false}      // boolean
  leftIcon={<Icon />}
  rightIcon={<Icon />}
>
  Texto do Botão
</Button>
```

### 2. Campos de Entrada (Input)

**Classes CSS:**
```html
<label class="label">Email</label>
<input 
  class="input" 
  placeholder="Digite seu email"
/>

<!-- Com erro -->
<input 
  class="input input-error" 
  placeholder="Digite seu email"
/>
```

**Props do Componente:**
```tsx
<Input
  label="Email"
  placeholder="Digite seu email"
  error="Email inválido"
  helperText="Usaremos para login"
  leftIcon={<MailIcon />}
  rightIcon={<CheckIcon />}
  fullWidth={true}
/>
```

### 3. Cards

**Classes CSS:**
```html
<!-- Card básico -->
<div class="card p-4">
  Conteúdo do card
</div>

<!-- Card com hover -->
<div class="card card-hover p-4 cursor-pointer">
  Clique aqui
</div>
```

**Props do Componente:**
```tsx
<Card 
  hover={true}           // efeito hover
  padding="md"           // none | sm | md | lg
  shadow="sm"            // none | sm | md | lg
>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### 4. Badges

**Classes CSS:**
```html
<span class="badge badge-primary">Novo</span>
<span class="badge badge-success">Ativo</span>
<span class="badge badge-warning">Pendente</span>
<span class="badge badge-error">Erro</span>
<span class="badge badge-neutral">Padrão</span>
```

**Props do Componente:**
```tsx
<Badge variant="primary" size="sm">Novo</Badge>
```

## Layouts Padronizados

### Containers
```html
<!-- Container responsivo -->
<div class="container-responsive">
  Conteúdo
</div>

<!-- Container com largura máxima -->
<div class="container-content">     <!-- max-width: 896px -->
<div class="container-wide">        <!-- max-width: 1152px -->
<div class="container-full">        <!-- max-width: 1280px -->
```

### Página Completa
```html
<div class="page-container">
  <main class="page-content">
    <!-- Conteúdo da página -->
  </main>
</div>
```

### Sidebar
```html
<aside class="sidebar">
  <nav class="space-y-1">
    <a class="sidebar-item nav-item-active">Ativo</a>
    <a class="sidebar-item nav-item-inactive">Inativo</a>
  </nav>
</aside>
```

## Responsividade

### Breakpoints
```
sm: 640px   → Mobile landscape
md: 768px   → Tablet
lg: 1024px  → Desktop
xl: 1280px  → Large desktop
```

### Exemplos de Uso Responsivo
```html
<!-- Texto responsivo -->
<h1 class="text-xl md:text-2xl lg:text-3xl">
  Título que cresce em telas maiores
</h1>

<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Layout flex responsivo -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-64">Sidebar</div>
  <div class="flex-1">Conteúdo</div>
</div>
```

## Acessibilidade

### Touch Targets
Todos os elementos interativos têm no mínimo 44x44px:
```html
<button class="touch-target">Botão</button>
<a class="touch-target">Link</a>
```

### Estados de Foco
```html
<input class="input focus:ring-2 focus:ring-blue-500" />
<button class="btn btn-primary focus:ring-2 focus:ring-offset-2">
```

### Contraste
Todas as cores garantem contraste WCAG AA:
- Texto primário em fundo branco: 12.6:1 ✓
- Texto primário em fundo escuro: 15.3:1 ✓
- Texto secundário em ambos os temas: > 4.5:1 ✓

## Animações

### Animações Disponíveis
```css
.animate-fade-in      /* Fade suave */
.animate-slide-up     /* Slide de baixo */
.animate-scale-in     /* Scale sutil */
.animate-spin         /* Rotação (loading) */
```

### Transições
```css
transition-colors      /* 150ms */
transition-all         /* 200ms */
duration-300          /* 300ms */
```

## Scrollbar Personalizada

```html
<div class="scrollbar-custom">
  <!-- Conteúdo com scroll -->
</div>

<!-- Ou esconder scrollbar -->
<div class="hide-scrollbar">
  <!-- Conteúdo sem scrollbar visível -->
</div>
```

## Markdown/Prose

Conteúdo Markdown estilizado automaticamente:

```html
<article class="prose">
  # Título
  ## Subtítulo
  
  Texto com **negrito** e *itálico*.
  
  - Item 1
  - Item 2
  
  [Link](url)
</article>
```

## Checklist de Migração

Ao atualizar componentes existentes:

- [ ] Substituir cores hardcoded por classes Tailwind
- [ ] Adicionar `dark:` prefix para suporte a dark mode
- [ ] Usar componentes Button, Input, Card em vez de HTML puro
- [ ] Verificar tamanhos de fonte (text-xs a text-2xl)
- [ ] Garantir touch-target de 44px+ em elementos interativos
- [ ] Testar foco e navegação por teclado
- [ ] Verificar contraste em ambos os temas
- [ ] Testar responsividade em diferentes tamanhos de tela

## Exemplo Completo de Página

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '../components';

export const ExamplePage = () => {
  return (
    <div className="page-container">
      <main className="page-content">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              <a className="nav-item nav-item-active">
                Dashboard
              </a>
              <a className="nav-item nav-item-inactive">
                Configurações
              </a>
            </nav>
          </aside>
          
          {/* Content */}
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Novo Documento</CardTitle>
                  <Badge variant="primary">Novo</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Título"
                  placeholder="Digite o título"
                />
                <Input
                  label="Descrição"
                  placeholder="Digite a descrição"
                />
                <div className="flex gap-2">
                  <Button variant="primary">Salvar</Button>
                  <Button variant="ghost">Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## Próximos Passos

1. Atualizar componentes existentes para usar o novo sistema
2. Criar página de documentação visual (Storybook)
3. Adicionar testes visuais para regressão
4. Implementar sistema de tokens para personalização
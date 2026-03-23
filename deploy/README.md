# Deploy Kubernetes (deploy-kit)

Mesma stack do restante dos apps: **Woodpecker** + imagem `registry.tmsol.app/deploy-kit` + **Kaniko** + manifests gerados a partir destes YAMLs.

## Relação com Docker Compose

| Compose | Deploy K8s |
|---------|------------|
| `quotes-widget` na porta **80** | `port: 80` em `definition.yml` |
| Traefik `Host(\`quotes.thiagosol.com\`)` | `domain` em `definition.prod.yml` |
| Limite ~50M | `resources.limits.memory: 64Mi` (mínimo razoável no cluster) |
| Redes `external-sol-apis` / Loki | No cluster: Service + Ingress Traefik (sem labels Docker) |

Não há variáveis de ambiente nem secrets para este app (só arquivos estáticos no nginx).

## Arquivos

- `definition.yml` — nome do serviço, porta, probes, recursos
- `definition.prod.yml` — namespace + domínio de produção
- `definition.dev.yml` — namespace + domínio de dev (altere se quiser outro host)

## Pipeline

Na raiz do repo: `.woodpecker.yml` (branches `main` e `dev`), igual ao padrão do [deploy-kit](https://github.com/thiagosol/scripts/tree/main/k8s/deploy-kit/examples).

**DNS:** aponte o `domain` do ambiente para o IP do cluster (mesmo fluxo dos outros Ingresses Traefik).

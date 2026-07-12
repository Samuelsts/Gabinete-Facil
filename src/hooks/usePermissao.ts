import { useSessao } from "@/contexts/SessaoContext";

// Centraliza a regra de "quem pode o quê" num único lugar. Se um dia
// a regra mudar (ex: Editor passar a poder excluir também), só este
// arquivo precisa ser tocado — nenhum componente que já usa o hook
// precisa saber o que mudou.
export function usePermissao() {
  const { usuario } = useSessao();
  const perfil = usuario?.perfil;

  return {
    podeCriar: perfil === "ADMINISTRADOR" || perfil === "EDITOR",
    podeEditar: perfil === "ADMINISTRADOR" || perfil === "EDITOR",
    podeExcluir: perfil === "ADMINISTRADOR",
  };
}
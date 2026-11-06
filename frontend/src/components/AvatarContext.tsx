import { useAuth } from "./AuthContext";

/**
 * La foto de perfil ahora vive en el usuario (AuthContext), así persiste
 * entre sesiones. Se mantiene este hook para no cambiar a quien lo usa.
 */
export function useAvatar() {
  const { usuario, actualizarUsuario } = useAuth();
  return {
    avatarUri: usuario?.foto ?? null,
    setAvatarUri: (uri: string | null) => {
      actualizarUsuario({ foto: uri }).catch(() => {});
    },
  };
}

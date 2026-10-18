import { createContext, useContext, useState, type ReactNode } from "react";

type AvatarContextValue = {
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
};

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  return (
    <AvatarContext.Provider value={{ avatarUri, setAvatarUri }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);

  if (!context) {
    throw new Error("useAvatar debe usarse dentro de AvatarProvider");
  }

  return context;
}

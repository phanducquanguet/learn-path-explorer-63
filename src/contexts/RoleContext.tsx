import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "teacher" | "admin";

type RoleCtx = {
  role: Role;
  setRole: (r: Role) => void;
};

const Ctx = createContext<RoleCtx | null>(null);
const KEY = "unicom.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = window.localStorage.getItem(KEY);
    if (v === "teacher" || v === "student" || v === "admin") setRoleState(v);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, r);
  };

  return <Ctx.Provider value={{ role, setRole }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) return { role: "student" as Role, setRole: () => {} };
  return c;
}

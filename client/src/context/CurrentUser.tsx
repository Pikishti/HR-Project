import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePeople } from "../api/people";

type CurrentUserContextValue = {
  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUserId: null,
  setCurrentUserId: () => {},
});

const STORAGE_KEY = "hr-project.currentUserId";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { data: people } = usePeople();
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  useEffect(() => {
    if (!currentUserId && people && people.length > 0) {
      setCurrentUserIdState(people[0].id);
    }
  }, [currentUserId, people]);

  function setCurrentUserId(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setCurrentUserIdState(id);
  }

  return (
    <CurrentUserContext.Provider value={{ currentUserId, setCurrentUserId }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

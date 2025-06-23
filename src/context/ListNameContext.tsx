"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getListById } from "@/app/actions/prismaActions";

type ListNameContextType = {
  listName: string;
  setListName: (name: string) => void;
};

const ListNameContext = createContext<ListNameContextType | undefined>(undefined);

export function ListNameProvider({
  children,
  listId,
}: {
  children: React.ReactNode;
  listId: string;
}) {
  const [listName, setListName] = useState("");

  useEffect(() => {
    const fetchListName = async () => {
      try {
        const result = await getListById(parseInt(listId));
        if (result && result.listName) {
          setListName(result.listName);
        }
      } catch (error) {
        console.error("Error fetching list name:", error);
      }
    };

    fetchListName();
  }, [listId]);

  return (
    <ListNameContext.Provider value={{ listName, setListName }}>
      {children}
    </ListNameContext.Provider>
  );
}

export function useListName() {
  const context = useContext(ListNameContext);
  if (context === undefined) {
    throw new Error("useListName must be used within a ListNameProvider");
  }
  return context;
}

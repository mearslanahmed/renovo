import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import { fetchSubscriptions, createSubscription, updateSubscription as apiUpdateSubscription, deleteSubscription as apiDeleteSubscription } from '@/lib/api';
import { icons } from '@/constants/icons';
import type { ImageSourcePropType } from 'react-native';

// Map subscription names to local icon assets
const ICON_MAP: Record<string, ImageSourcePropType> = {
  netflix: icons.netflix,
  spotify: icons.spotify,
  notion: icons.notion,
  dropbox: icons.dropbox,
  openai: icons.openai,
  chatgpt: icons.openai,
  adobe: icons.adobe,
  figma: icons.figma,
  github: icons.github,
  claude: icons.claude,
  canva: icons.canva,
  medium: icons.medium,
};

function resolveIcon(name?: string): ImageSourcePropType {
  if (!name) return icons.wallet;
  const key = name.toLowerCase().trim();
  // Check for partial match (e.g. "Adobe Creative Cloud" matches "adobe")
  for (const [iconKey, iconValue] of Object.entries(ICON_MAP)) {
    if (key.includes(iconKey)) return iconValue;
  }
  return icons.wallet;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  entertainment: "#f5a2a2",
  productivity: "#b8e8d0",
  education: "#e8def8",
  health: "#b8e8d0",
  finance: "#f5c542",
  ai: "#b8d4e3",
  music: "#d0a2f5",
  cloud: "#a2c4f5",
  other: "#fff8e7",
};

function resolveColor(item: any): string {
  if (item.color && item.color !== "#e0e0e0" && item.color !== "#ffffff") {
    return item.color;
  }
  const nameKey = item.name ? item.name.toLowerCase().trim() : "";
  if (nameKey.includes("netflix")) return "#f5a2a2";
  if (nameKey.includes("spotify")) return "#d0a2f5";
  if (nameKey.includes("chatgpt") || nameKey.includes("openai") || nameKey.includes("claude")) return "#b8d4e3";
  if (nameKey.includes("github")) return "#e8def8";
  if (nameKey.includes("adobe")) return "#f5c542";
  if (nameKey.includes("canva") || nameKey.includes("notion")) return "#b8e8d0";
  if (nameKey.includes("dropbox")) return "#a2c4f5";

  const catKey = item.category ? item.category.toLowerCase().trim() : "other";
  return CATEGORY_COLOR_MAP[catKey] || "#fff8e7";
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, sub: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (isLoaded && isSignedIn) {
        try {
          setIsLoading(true);
          const token = await getToken();
          const data = await fetchSubscriptions(token);
          
          // Map MongoDB _id to frontend id and resolve icon & color
          const mappedData = data.map((item: any) => ({
            ...item,
            id: item._id,
            icon: item.icon || resolveIcon(item.name),
            color: resolveColor(item),
          }));
          
          setSubscriptions(mappedData);
        } catch (error) {
          console.error("Failed to load subscriptions", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSubscriptions();
  }, [isLoaded, isSignedIn]);

  const addSubscription = async (sub: Omit<Subscription, 'id'>) => {
    try {
      const token = await getToken();
      const newSub = await createSubscription(token, sub);
      
      // Map MongoDB _id to frontend id and resolve icon & color
      const mappedSub = { 
        ...newSub, 
        id: newSub._id, 
        icon: newSub.icon || resolveIcon(newSub.name),
        color: resolveColor(newSub),
      };
      
      setSubscriptions((prev) => [mappedSub, ...prev]);
    } catch (error) {
      console.error("Failed to add subscription", error);
      throw error;
    }
  };

  const updateSubscription = async (id: string, subData: Partial<Subscription>) => {
    try {
      const token = await getToken();
      const updatedSub = await apiUpdateSubscription(token, id, subData);
      
      const mappedSub = {
        ...updatedSub,
        id: updatedSub._id || id,
        icon: updatedSub.icon || resolveIcon(updatedSub.name),
        color: resolveColor(updatedSub),
      };
      
      setSubscriptions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...mappedSub } : item))
      );
    } catch (error) {
      console.error("Failed to update subscription", error);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const token = await getToken();
      await apiDeleteSubscription(token, id);
      setSubscriptions((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete subscription", error);
      throw error;
    }
  };

  const refreshSubscriptions = async () => {
    if (isLoaded && isSignedIn) {
      try {
        const token = await getToken();
        const data = await fetchSubscriptions(token);
        const mappedData = data.map((item: any) => ({
          ...item,
          id: item._id,
          icon: item.icon || resolveIcon(item.name),
          color: resolveColor(item),
        }));
        setSubscriptions(mappedData);
      } catch (error) {
        console.error("Failed to refresh subscriptions", error);
      }
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        refreshSubscriptions,
        isLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}

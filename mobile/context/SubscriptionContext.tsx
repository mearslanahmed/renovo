import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/expo';
import { fetchSubscriptions, createSubscription } from '@/lib/api';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
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
          
          // Map MongoDB _id to frontend id
          const mappedData = data.map((item: any) => ({
            ...item,
            id: item._id,
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
      
      // Map MongoDB _id to frontend id
      const mappedSub = { ...newSub, id: newSub._id };
      
      setSubscriptions((prev) => [mappedSub, ...prev]);
    } catch (error) {
      console.error("Failed to add subscription", error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, isLoading }}>
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

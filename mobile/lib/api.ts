const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchSubscriptions = async (token: string | null) => {
  if (!token) return [];
  
  try {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch subscriptions: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data; // Our backend returns { success: true, data: [...] }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

export const createSubscription = async (token: string | null, subscriptionData: any) => {
  if (!token) throw new Error('Not authenticated');
  
  try {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create subscription');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

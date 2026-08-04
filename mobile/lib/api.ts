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
      const errorText = await response.text();
      console.error(`Create Subscription API Error (${response.status}):`, errorText);
      let errorMessage = 'Failed to create subscription';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const sub = data.data?.subscription || data.data;
    return sub;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (token: string | null, id: string, subscriptionData: any) => {
  if (!token) throw new Error('Not authenticated');
  
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Update Subscription API Error (${response.status}):`, errorText);
      throw new Error('Failed to update subscription');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (token: string | null, id: string) => {
  if (!token) throw new Error('Not authenticated');
  
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Delete Subscription API Error (${response.status}):`, errorText);
      throw new Error('Failed to delete subscription');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

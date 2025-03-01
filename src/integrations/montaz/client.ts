
// Montaz API Integration
const MONTAZ_API_URL = "https://crs.montaz.id/api/login";
const MONTAZ_API_KEY = "CRSMonT4z4pp$2o24";

export async function loginWithMontaz(username: string, password: string) {
  try {
    const response = await fetch(MONTAZ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MONTAZ_API_KEY}`
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login with Montaz');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Montaz login error:', error);
    throw error;
  }
}

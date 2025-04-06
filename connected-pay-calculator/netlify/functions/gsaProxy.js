import fetch from 'node-fetch';

export const handler = async function(event, context) {
  // Get parameters from query string
  const { city, state, zip, year, month } = event.queryStringParameters;

  console.log('GSA Proxy received params:', { city, state, zip, year, month });

  // Define the GSA API endpoint based on the provided parameters
  let apiUrl = `https://api.gsa.gov/travel/perdiem/v2/rates/city/${city}/state/${state}/year/${year}`;

  // If a ZIP code is provided, use it to form the URL
  if (zip) {
    apiUrl = `https://api.gsa.gov/travel/perdiem/v2/rates/zip/${zip}/year/${year}`;
  }

  console.log('Calling GSA API:', apiUrl);

  try {
    // Fetch data from the GSA API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.GSA_API_KEY,
      }
    });

    const data = await response.json();
    console.log('GSA API Response:', data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch data from GSA API", error: error.message }),
    };
  }
}; 
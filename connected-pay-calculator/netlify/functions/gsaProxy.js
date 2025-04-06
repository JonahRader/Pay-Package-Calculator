const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Get parameters from query string
  const { city, state, zip, year, month } = event.queryStringParameters;

  console.log('GSA Proxy received params:', { city, state, zip, year, month });
  console.log('Using GSA API Key:', process.env.GSA_API_KEY ? 'Present' : 'Missing');

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

    if (!response.ok) {
      console.error('GSA API Error:', {
        status: response.status,
        statusText: response.statusText
      });
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`GSA API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GSA API Response:', data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: "Failed to fetch data from GSA API", 
        error: error.message,
        params: { city, state, zip, year, month }
      }),
    };
  }
}; 
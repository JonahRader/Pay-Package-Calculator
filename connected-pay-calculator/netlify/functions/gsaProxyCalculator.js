const fetch = require('node-fetch@2');

exports.handler = async function(event, context) {
  // Get parameters from query string
  const { city, state, zip, year } = event.queryStringParameters;

  console.log('Received parameters:', { city, state, zip, year });

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

    // Parse the response JSON
    const data = await response.json();

    // Log the full response for debugging
    console.log('Full GSA API Response:', JSON.stringify(data, null, 2));

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
        params: { city, state, zip, year }
      }),
    };
  }
};

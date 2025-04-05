interface GSAResponse {
  rate: number;
  meals: number;
  incidental: number;
  zipCode: string;
  city: string;
  state: string;
  county: string;
  standardRate: boolean;
}

interface GSARate {
  lodging: number;
  meals: number;
}

export async function fetchGSARate(
  city: string,
  state: string,
  zipCode: string | undefined,
  month: string,
  year: string
): Promise<GSARate> {
  // Convert month name to number (Jan = 1, Feb = 2, etc.)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthNumber = monthNames.indexOf(month) + 1;

  // Construct the API URL
  let proxyUrl = "";
  if (zipCode) {
    proxyUrl = `/.netlify/functions/gsaProxy?zip=${zipCode}&year=${year}&month=${monthNumber}`;
  } else if (city && state) {
    proxyUrl = `/.netlify/functions/gsaProxy?city=${city}&state=${state}&year=${year}&month=${monthNumber}`;
  } else {
    throw new Error("Please provide either a ZIP code or both city and state.");
  }

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch GSA rates: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result || !result.rates || result.rates.length === 0) {
      // If no rates found, return standard rates
      return {
        lodging: 96,  // Standard lodging rate
        meals: 59     // Standard M&IE rate
      };
    }

    const rate = result.rates[0];
    const matchedRate = rate.rate.find((r: any) => {
      const monthMatch = r.months.month.find((monthObj: any) => monthObj.short === month);
      return monthMatch;
    });

    if (matchedRate) {
      const monthData = matchedRate.months.month.find((m: any) => m.short === month);
      return {
        lodging: monthData?.value || matchedRate.rate || 96,
        meals: matchedRate.mie || matchedRate.meals || 59
      };
    } else {
      // If no matching month found, return standard rates
      return {
        lodging: 96,
        meals: 59
      };
    }
  } catch (error) {
    console.error('Error fetching GSA rate:', error);
    // Return standard rates on error
    return {
      lodging: 96,
      meals: 59
    };
  }
}

async function fetchGSARateByZip(zipCode: string): Promise<number> {
  try {
    const baseUrl = 'https://api.gsa.gov/travel/perdiem/v2/rates/zip/';
    const apiKey = 'YOUR_GSA_API_KEY';
    
    const url = `${baseUrl}${zipCode}/year/2024?api_key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return 96; // Standard rate if zip code not found
    }

    const data: GSAResponse = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Error fetching GSA rate by zip:', error);
    return 96; // Return standard rate if there's an error
  }
} 
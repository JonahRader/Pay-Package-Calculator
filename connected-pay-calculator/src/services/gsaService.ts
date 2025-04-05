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
    const result = await response.json();

    if (!result || !result.rates || result.rates.length === 0) {
      throw new Error("No data found for this location/year.");
    }

    const rate = result.rates[0];
    // Extract matching rate for the selected month
    const matchedRate = rate.rate.find((r: any) => {
      const monthMatch = r.months.month.find((monthObj: any) => monthObj.short === month);
      return monthMatch;
    });

    if (matchedRate) {
      const monthData = matchedRate.months.month.find((m: any) => m.short === month);
      return {
        lodging: monthData?.value || matchedRate.rate || 0,
        meals: matchedRate.mie || matchedRate.meals || 0
      };
    } else {
      throw new Error(`No data found for the selected month (${month}).`);
    }
  } catch (error) {
    console.error('Error fetching GSA rate:', error);
    throw error;
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
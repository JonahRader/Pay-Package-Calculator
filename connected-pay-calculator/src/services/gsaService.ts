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
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthNumber = monthNames.indexOf(month) + 1;

  let proxyUrl = "";
  if (zipCode) {
    proxyUrl = `/.netlify/functions/gsaProxyCalculator?zip=${zipCode}&year=${year}&month=${monthNumber}`;
  } else if (city && state) {
    proxyUrl = `/.netlify/functions/gsaProxyCalculator?city=${city}&state=${state}&year=${year}&month=${monthNumber}`;
  } else {
    throw new Error("Please provide either a ZIP code or both city and state.");
  }

  try {
    const response = await fetch(proxyUrl);
    const result = await response.json();

    if (!result || !result.rates || result.rates.length === 0) {
      return {
        lodging: 96,
        meals: 59
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
    }

    // Add default return if no match found
    return {
      lodging: 96,
      meals: 59
    };
  } catch (error) {
    console.error('Error fetching GSA rate:', error);
    return {
      lodging: 96,
      meals: 59
    };
  }
}

// Remove or comment out unused function
// async function fetchGSARateByZip(zipCode: string): Promise<number> { ... } 
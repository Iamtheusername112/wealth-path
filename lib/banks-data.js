// Comprehensive list of major banks worldwide
// In production, this would come from a banking API like Plaid, TrueLayer, or your own database

export const worldwideBanks = [
  // United States
  { id: 1, name: "Chase Bank", country: "United States", code: "CHASE", currency: "USD", logo: "🏦" },
  { id: 2, name: "Bank of America", country: "United States", code: "BOA", currency: "USD", logo: "🏛️" },
  { id: 3, name: "Wells Fargo", country: "United States", code: "WF", currency: "USD", logo: "🏢" },
  { id: 4, name: "Citibank", country: "United States", code: "CITI", currency: "USD", logo: "🏦" },
  { id: 5, name: "U.S. Bank", country: "United States", code: "USB", currency: "USD", logo: "🏛️" },
  { id: 6, name: "PNC Bank", country: "United States", code: "PNC", currency: "USD", logo: "🏢" },
  { id: 7, name: "Capital One", country: "United States", code: "CAPO", currency: "USD", logo: "🏦" },
  { id: 8, name: "TD Bank", country: "United States", code: "TD", currency: "USD", logo: "🏛️" },
  
  // United Kingdom
  { id: 101, name: "Barclays", country: "United Kingdom", code: "BARC", currency: "GBP", logo: "🏦" },
  { id: 102, name: "HSBC UK", country: "United Kingdom", code: "HSBC", currency: "GBP", logo: "🏛️" },
  { id: 103, name: "Lloyds Bank", country: "United Kingdom", code: "LLOY", currency: "GBP", logo: "🏢" },
  { id: 104, name: "NatWest", country: "United Kingdom", code: "NATW", currency: "GBP", logo: "🏦" },
  { id: 105, name: "Santander UK", country: "United Kingdom", code: "SANT", currency: "GBP", logo: "🏛️" },
  { id: 106, name: "TSB Bank", country: "United Kingdom", code: "TSB", currency: "GBP", logo: "🏢" },
  { id: 107, name: "Metro Bank", country: "United Kingdom", code: "METR", currency: "GBP", logo: "🏦" },
  
  // Canada
  { id: 201, name: "Royal Bank of Canada (RBC)", country: "Canada", code: "RBC", currency: "CAD", logo: "🏦" },
  { id: 202, name: "TD Canada Trust", country: "Canada", code: "TD", currency: "CAD", logo: "🏛️" },
  { id: 203, name: "Bank of Montreal (BMO)", country: "Canada", code: "BMO", currency: "CAD", logo: "🏢" },
  { id: 204, name: "Scotiabank", country: "Canada", code: "SCOT", currency: "CAD", logo: "🏦" },
  { id: 205, name: "CIBC", country: "Canada", code: "CIBC", currency: "CAD", logo: "🏛️" },
  
  // Germany
  { id: 301, name: "Deutsche Bank", country: "Germany", code: "DB", currency: "EUR", logo: "🏦" },
  { id: 302, name: "Commerzbank", country: "Germany", code: "COBA", currency: "EUR", logo: "🏛️" },
  { id: 303, name: "DZ Bank", country: "Germany", code: "DZ", currency: "EUR", logo: "🏢" },
  { id: 304, name: "KfW", country: "Germany", code: "KFW", currency: "EUR", logo: "🏦" },
  
  // France
  { id: 401, name: "BNP Paribas", country: "France", code: "BNPP", currency: "EUR", logo: "🏦" },
  { id: 402, name: "Crédit Agricole", country: "France", code: "CA", currency: "EUR", logo: "🏛️" },
  { id: 403, name: "Société Générale", country: "France", code: "SG", currency: "EUR", logo: "🏢" },
  { id: 404, name: "Crédit Mutuel", country: "France", code: "CM", currency: "EUR", logo: "🏦" },
  
  // Spain
  { id: 501, name: "Santander", country: "Spain", code: "SANT", currency: "EUR", logo: "🏦" },
  { id: 502, name: "BBVA", country: "Spain", code: "BBVA", currency: "EUR", logo: "🏛️" },
  { id: 503, name: "CaixaBank", country: "Spain", code: "CAIX", currency: "EUR", logo: "🏢" },
  
  // Italy
  { id: 601, name: "Intesa Sanpaolo", country: "Italy", code: "ISP", currency: "EUR", logo: "🏦" },
  { id: 602, name: "UniCredit", country: "Italy", code: "UC", currency: "EUR", logo: "🏛️" },
  { id: 603, name: "Banco BPM", country: "Italy", code: "BPM", currency: "EUR", logo: "🏢" },
  
  // Netherlands
  { id: 701, name: "ING Bank", country: "Netherlands", code: "ING", currency: "EUR", logo: "🏦" },
  { id: 702, name: "ABN AMRO", country: "Netherlands", code: "ABN", currency: "EUR", logo: "🏛️" },
  { id: 703, name: "Rabobank", country: "Netherlands", code: "RABO", currency: "EUR", logo: "🏢" },
  
  // Switzerland
  { id: 801, name: "UBS", country: "Switzerland", code: "UBS", currency: "CHF", logo: "🏦" },
  { id: 802, name: "Credit Suisse", country: "Switzerland", code: "CS", currency: "CHF", logo: "🏛️" },
  { id: 803, name: "Julius Baer", country: "Switzerland", code: "JB", currency: "CHF", logo: "🏢" },
  
  // Australia
  { id: 901, name: "Commonwealth Bank", country: "Australia", code: "CBA", currency: "AUD", logo: "🏦" },
  { id: 902, name: "Westpac", country: "Australia", code: "WBC", currency: "AUD", logo: "🏛️" },
  { id: 903, name: "ANZ Bank", country: "Australia", code: "ANZ", currency: "AUD", logo: "🏢" },
  { id: 904, name: "NAB", country: "Australia", code: "NAB", currency: "AUD", logo: "🏦" },
  
  // Japan
  { id: 1001, name: "Mitsubishi UFJ Financial", country: "Japan", code: "MUFG", currency: "JPY", logo: "🏦" },
  { id: 1002, name: "Sumitomo Mitsui Banking", country: "Japan", code: "SMBC", currency: "JPY", logo: "🏛️" },
  { id: 1003, name: "Mizuho Bank", country: "Japan", code: "MIZUHO", currency: "JPY", logo: "🏢" },
  
  // China
  { id: 1101, name: "Industrial and Commercial Bank of China", country: "China", code: "ICBC", currency: "CNY", logo: "🏦" },
  { id: 1102, name: "China Construction Bank", country: "China", code: "CCB", currency: "CNY", logo: "🏛️" },
  { id: 1103, name: "Agricultural Bank of China", country: "China", code: "ABC", currency: "CNY", logo: "🏢" },
  { id: 1104, name: "Bank of China", country: "China", code: "BOC", currency: "CNY", logo: "🏦" },
  
  // India
  { id: 1201, name: "State Bank of India", country: "India", code: "SBI", currency: "INR", logo: "🏦" },
  { id: 1202, name: "HDFC Bank", country: "India", code: "HDFC", currency: "INR", logo: "🏛️" },
  { id: 1203, name: "ICICI Bank", country: "India", code: "ICICI", currency: "INR", logo: "🏢" },
  { id: 1204, name: "Axis Bank", country: "India", code: "AXIS", currency: "INR", logo: "🏦" },
  { id: 1205, name: "Kotak Mahindra Bank", country: "India", code: "KOTAK", currency: "INR", logo: "🏛️" },
  
  // Brazil
  { id: 1301, name: "Banco do Brasil", country: "Brazil", code: "BB", currency: "BRL", logo: "🏦" },
  { id: 1302, name: "Itaú Unibanco", country: "Brazil", code: "ITAU", currency: "BRL", logo: "🏛️" },
  { id: 1303, name: "Bradesco", country: "Brazil", code: "BRAD", currency: "BRL", logo: "🏢" },
  { id: 1304, name: "Santander Brasil", country: "Brazil", code: "SANT", currency: "BRL", logo: "🏦" },
  
  // South Africa
  { id: 1401, name: "Standard Bank", country: "South Africa", code: "SBSA", currency: "ZAR", logo: "🏦" },
  { id: 1402, name: "FirstRand Bank", country: "South Africa", code: "FRB", currency: "ZAR", logo: "🏛️" },
  { id: 1403, name: "Absa Bank", country: "South Africa", code: "ABSA", currency: "ZAR", logo: "🏢" },
  { id: 1404, name: "Nedbank", country: "South Africa", code: "NED", currency: "ZAR", logo: "🏦" },
  
  // Nigeria
  { id: 1501, name: "First Bank of Nigeria", country: "Nigeria", code: "FBN", currency: "NGN", logo: "🏦" },
  { id: 1502, name: "Zenith Bank", country: "Nigeria", code: "ZENITH", currency: "NGN", logo: "🏛️" },
  { id: 1503, name: "GTBank", country: "Nigeria", code: "GTB", currency: "NGN", logo: "🏢" },
  { id: 1504, name: "Access Bank", country: "Nigeria", code: "ACCESS", currency: "NGN", logo: "🏦" },
  { id: 1505, name: "UBA", country: "Nigeria", code: "UBA", currency: "NGN", logo: "🏛️" },
  
  // Kenya
  { id: 1601, name: "Kenya Commercial Bank", country: "Kenya", code: "KCB", currency: "KES", logo: "🏦" },
  { id: 1602, name: "Equity Bank", country: "Kenya", code: "EQUITY", currency: "KES", logo: "🏛️" },
  { id: 1603, name: "Cooperative Bank", country: "Kenya", code: "COOP", currency: "KES", logo: "🏢" },
  
  // Singapore
  { id: 1701, name: "DBS Bank", country: "Singapore", code: "DBS", currency: "SGD", logo: "🏦" },
  { id: 1702, name: "OCBC Bank", country: "Singapore", code: "OCBC", currency: "SGD", logo: "🏛️" },
  { id: 1703, name: "UOB", country: "Singapore", code: "UOB", currency: "SGD", logo: "🏢" },
  
  // Hong Kong
  { id: 1801, name: "HSBC Hong Kong", country: "Hong Kong", code: "HSBC", currency: "HKD", logo: "🏦" },
  { id: 1802, name: "Hang Seng Bank", country: "Hong Kong", code: "HSB", currency: "HKD", logo: "🏛️" },
  { id: 1803, name: "Bank of China (Hong Kong)", country: "Hong Kong", code: "BOCHK", currency: "HKD", logo: "🏢" },
  
  // UAE
  { id: 1901, name: "Emirates NBD", country: "United Arab Emirates", code: "ENBD", currency: "AED", logo: "🏦" },
  { id: 1902, name: "First Abu Dhabi Bank", country: "United Arab Emirates", code: "FAB", currency: "AED", logo: "🏛️" },
  { id: 1903, name: "Dubai Islamic Bank", country: "United Arab Emirates", code: "DIB", currency: "AED", logo: "🏢" },
  
  // Saudi Arabia
  { id: 2001, name: "Al Rajhi Bank", country: "Saudi Arabia", code: "ARBI", currency: "SAR", logo: "🏦" },
  { id: 2002, name: "Saudi National Bank", country: "Saudi Arabia", code: "SNB", currency: "SAR", logo: "🏛️" },
  { id: 2003, name: "Riyad Bank", country: "Saudi Arabia", code: "RIYAD", currency: "SAR", logo: "🏢" },
  
  // Mexico
  { id: 2101, name: "BBVA México", country: "Mexico", code: "BBVA", currency: "MXN", logo: "🏦" },
  { id: 2102, name: "Banamex", country: "Mexico", code: "BANA", currency: "MXN", logo: "🏛️" },
  { id: 2103, name: "Santander México", country: "Mexico", code: "SANT", currency: "MXN", logo: "🏢" },
  
  // Argentina
  { id: 2201, name: "Banco Nación", country: "Argentina", code: "BNA", currency: "ARS", logo: "🏦" },
  { id: 2202, name: "Banco Galicia", country: "Argentina", code: "GALI", currency: "ARS", logo: "🏛️" },
  { id: 2203, name: "BBVA Argentina", country: "Argentina", code: "BBVA", currency: "ARS", logo: "🏢" },
  
  // South Korea
  { id: 2301, name: "KB Kookmin Bank", country: "South Korea", code: "KB", currency: "KRW", logo: "🏦" },
  { id: 2302, name: "Shinhan Bank", country: "South Korea", code: "SHIN", currency: "KRW", logo: "🏛️" },
  { id: 2303, name: "Woori Bank", country: "South Korea", code: "WOOR", currency: "KRW", logo: "🏢" },
  
  // Turkey
  { id: 2401, name: "İş Bankası", country: "Turkey", code: "ISBANK", currency: "TRY", logo: "🏦" },
  { id: 2402, name: "Garanti BBVA", country: "Turkey", code: "GARAN", currency: "TRY", logo: "🏛️" },
  { id: 2403, name: "Akbank", country: "Turkey", code: "AKBANK", currency: "TRY", logo: "🏢" },
  
  // Indonesia
  { id: 2501, name: "Bank Mandiri", country: "Indonesia", code: "MAND", currency: "IDR", logo: "🏦" },
  { id: 2502, name: "Bank Rakyat Indonesia", country: "Indonesia", code: "BRI", currency: "IDR", logo: "🏛️" },
  { id: 2503, name: "Bank Central Asia", country: "Indonesia", code: "BCA", currency: "IDR", logo: "🏢" },
]

// Get unique countries for filtering
export const countries = [...new Set(worldwideBanks.map(bank => bank.country))].sort()

// Search banks by name or country
export function searchBanks(query) {
  const lowerQuery = query.toLowerCase().trim()
  
  if (!lowerQuery) return worldwideBanks
  
  return worldwideBanks.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.country.toLowerCase().includes(lowerQuery) ||
    bank.code.toLowerCase().includes(lowerQuery)
  )
}

// Get banks by country
export function getBanksByCountry(country) {
  return worldwideBanks.filter(bank => bank.country === country)
}


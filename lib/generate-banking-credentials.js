// Generate banking credentials for a user

/**
 * Generates a SWIFT/BIC code
 * Format: CPTHUS33XXX (CapitalPath + Country + Location + Branch)
 */
export function generateSwiftCode(userCountry = 'US') {
  const countryCode = userCountry.toUpperCase().slice(0, 2)
  const locationCode = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const branchCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `CPTH${countryCode}${locationCode}${branchCode}`
}

/**
 * Generates an IBAN (International Bank Account Number)
 * Format: US64CPTH0001234567890 (Country + Check + Bank + Account)
 */
export function generateIBAN(accountNumber, country = 'US') {
  const countryCode = country.toUpperCase().slice(0, 2)
  const checkDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const bankCode = 'CPTH'
  const accountPart = accountNumber.replace(/[^0-9]/g, '').padStart(15, '0').slice(0, 15)
  return `${countryCode}${checkDigits}${bankCode}${accountPart}`
}

/**
 * Generates a US Routing Number (ABA)
 * Format: 9-digit number
 */
export function generateRoutingNumber() {
  // Use a recognizable prefix for CapitalPath (274 = fictional routing)
  const prefix = '274'
  const middle = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `${prefix}${middle}`
}

/**
 * Generates a UK Sort Code
 * Format: 12-34-56
 */
export function generateSortCode() {
  const part1 = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const part2 = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const part3 = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${part1}-${part2}-${part3}`
}

/**
 * Generates complete banking credentials for a user
 */
export function generateBankingCredentials(accountNumber, userCountry = 'US') {
  return {
    swift_code: generateSwiftCode(userCountry),
    iban: generateIBAN(accountNumber, userCountry),
    routing_number: generateRoutingNumber(),
    sort_code: generateSortCode(),
    bank_branch: 'CapitalPath Main Branch',
    bank_address: '1 CapitalPath Plaza, Financial District, New York, NY 10004'
  }
}


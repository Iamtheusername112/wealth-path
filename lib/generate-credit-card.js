/**
 * Generate realistic credit card details
 */

// Luhn algorithm to generate valid card numbers
function luhnCheck(cardNumber) {
  const digits = cardNumber.split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

function generateValidCardNumber(prefix, length = 16) {
  // Generate digits up to length - 1 (we'll add check digit)
  let cardNumber = prefix
  
  // Generate remaining digits
  for (let i = cardNumber.length; i < length - 1; i++) {
    cardNumber += Math.floor(Math.random() * 10)
  }

  // Calculate check digit using Luhn algorithm
  let sum = 0
  let isEven = true

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return cardNumber + checkDigit
}

function generateCVV(digits = 3) {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return Math.floor(min + Math.random() * (max - min + 1)).toString()
}

function generateExpiryDate() {
  const now = new Date()
  const year = now.getFullYear() + 3 // 3 years validity
  const month = Math.floor(Math.random() * 12) + 1
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
}

export function generateCreditCard(cardHolderName, cardType = 'platinum', cardNetwork = 'visa') {
  // Card network prefixes
  const networkPrefixes = {
    visa: '4',
    mastercard: '5',
    amex: '37',
    discover: '6011',
  }

  const prefix = networkPrefixes[cardNetwork] || networkPrefixes.visa
  
  // Amex cards are 15 digits, others are 16
  const cardLength = cardNetwork === 'amex' ? 15 : 16

  const cardNumber = generateValidCardNumber(prefix, cardLength)
  const cvv = cardNetwork === 'amex' ? generateCVV(4) : generateCVV(3) // Amex has 4-digit CVV
  const expiryDate = generateExpiryDate()

  // Format card number with spaces
  let formattedCardNumber
  if (cardNetwork === 'amex') {
    // Amex format: XXXX XXXXXX XXXXX
    formattedCardNumber = cardNumber.match(/.{1,4}|.{1,6}|.{1,5}/g).join(' ')
    formattedCardNumber = `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 10)} ${cardNumber.slice(10)}`
  } else {
    // Standard format: XXXX XXXX XXXX XXXX
    formattedCardNumber = cardNumber.match(/.{1,4}/g).join(' ')
  }

  return {
    cardNumber: formattedCardNumber,
    cardHolderName: cardHolderName.toUpperCase(),
    cvv,
    expiryDate,
    cardType,
    cardNetwork,
  }
}

// Helper to mask card number for display
export function maskCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\s/g, '')
  return `**** **** **** ${digits.slice(-4)}`
}




export function getNextQuoteVersion(currentQuoteNumber: string): {
  nextQuoteNumber: string
  versionNumber: number
  versionLabel: string
} {
  if (!currentQuoteNumber) {
    return {
      nextQuoteNumber: "Q-001-V2",
      versionNumber: 2,
      versionLabel: "Version 2",
    }
  }

  const match = currentQuoteNumber.match(/^(.*?)(?:[-_ ]?[vV](\d+))$/)
  if (match) {
    const base = match[1]
    const currentVer = parseInt(match[2], 10) || 1
    const nextVer = currentVer + 1
    return {
      nextQuoteNumber: `${base}-V${nextVer}`,
      versionNumber: nextVer,
      versionLabel: `Version ${nextVer}`,
    }
  }

  return {
    nextQuoteNumber: `${currentQuoteNumber}-V2`,
    versionNumber: 2,
    versionLabel: "Version 2",
  }
}

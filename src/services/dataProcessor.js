/**
 * Data Processor & Resilience Engine
 * Cleans real-world messy data, normalizes dates/sectors, handles missing values,
 * and generates data quality scorecards for Monday.com datasets.
 */

// Sector Taxonomy Mapping
export const SECTOR_TAXONOMY = {
  ENERGY: ['Renewables', 'Powerline', 'Solar', 'Wind', 'Energy', 'Power'],
  MINING: ['Mining', 'Coal', 'Iron', 'Minerals'],
  RAILWAYS: ['Railways', 'Rail', 'Metro'],
  CONSTRUCTION: ['Construction', 'Real Estate', 'Infrastructure'],
  OTHERS: ['Others', 'DSP', 'Tender', 'Manufacturing', 'Security and Surveillance', 'Aviation']
};

export function normalizeSector(sectorStr) {
  if (!sectorStr || sectorStr === 'None' || sectorStr === 'null') return 'Others';
  const clean = String(sectorStr).trim();
  
  for (const [category, keywords] of Object.entries(SECTOR_TAXONOMY)) {
    if (keywords.some(k => clean.toLowerCase().includes(k.toLowerCase()))) {
      if (category === 'ENERGY') return 'Energy (Renewables & Power)';
      if (category === 'MINING') return 'Mining & Resources';
      if (category === 'RAILWAYS') return 'Railways & Transport';
      if (category === 'CONSTRUCTION') return 'Construction & Infra';
      return category;
    }
  }
  return clean;
}

export function parseDate(dateStr) {
  if (!dateStr || dateStr === 'None' || dateStr === 'null' || dateStr === 'undefined') return null;
  const str = String(dateStr).trim();
  
  // Try standard date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return {
      formatted: `${yyyy}-${mm}-${dd}`,
      year: yyyy,
      quarter: `Q${Math.floor(d.getMonth() / 3) + 1} ${yyyy}`,
      dateObj: d
    };
  }
  return null;
}

export function cleanDeal(deal) {
  const normalizedSector = normalizeSector(deal.sector);
  const isEnergy = normalizedSector.includes('Energy');
  
  // Value imputation check
  const hasValue = deal.maskedDealValue && deal.maskedDealValue > 0;
  const cleanValue = hasValue ? Number(deal.maskedDealValue) : 0;
  const prob = deal.closureProbability ? Number(deal.closureProbability) : 0;
  const weightedValue = cleanValue * prob;

  const parsedClose = parseDate(deal.closeDateActual);
  const parsedTentative = parseDate(deal.tentativeCloseDate);
  const parsedCreated = parseDate(deal.createdDate);
  
  const effectiveDate = parsedClose || parsedTentative || parsedCreated;
  const quarter = effectiveDate ? effectiveDate.quarter : 'Unspecified Date';

  // Normalize Stage
  let stage = deal.dealStage || 'Lead Generated';
  if (stage.includes('Won')) stage = 'Project Won';
  else if (stage.includes('Lost')) stage = 'Project Lost';
  else if (stage.includes('Hold')) stage = 'On Hold';
  else if (stage.includes('Proposal')) stage = 'Proposal / Commercials Sent';
  else if (stage.includes('Negotiation')) stage = 'Negotiations';

  return {
    ...deal,
    cleanSector: normalizedSector,
    isEnergySector: isEnergy,
    cleanValue,
    hasValue,
    probability: prob,
    weightedValue,
    effectiveDate: effectiveDate ? effectiveDate.formatted : null,
    quarter,
    cleanStage: stage,
    isWon: deal.dealStatus === 'Won' || stage.includes('Won'),
    isOpen: deal.dealStatus === 'Open' || (!stage.includes('Won') && !stage.includes('Lost')),
    isDead: deal.dealStatus === 'Dead' || stage.includes('Lost')
  };
}

export function cleanWorkOrder(wo) {
  const normalizedSector = normalizeSector(wo.sector);
  
  // Normalize Status Typos
  let billingStatus = wo.billingStatus || 'Pending';
  if (billingStatus.toLowerCase() === 'billed') billingStatus = 'Billed';
  
  let execStatus = wo.executionStatus || 'Not Started';
  if (execStatus === 'Executed until current month') execStatus = 'Ongoing';
  if (execStatus === 'Pause / struck') execStatus = 'Paused / Stuck';
  if (execStatus === 'Partial Completed') execStatus = 'Partially Completed';

  const amountExcl = Number(wo.amountExclGst || 0);
  const amountIncl = Number(wo.amountInclGst || 0);
  const billedExcl = Number(wo.billedValueExclGst || 0);
  const billedIncl = Number(wo.billedValueInclGst || 0);
  const collectedIncl = Number(wo.collectedAmountInclGst || 0);

  const amountToBeBilledExcl = Number(wo.amountToBeBilledExclGst || (amountExcl - billedExcl > 0 ? amountExcl - billedExcl : 0));
  const receivable = Number(wo.amountReceivable || (billedIncl - collectedIncl > 0 ? billedIncl - collectedIncl : 0));

  const parsedStart = parseDate(wo.probableStartDate);
  const parsedEnd = parseDate(wo.probableEndDate);
  const parsedDelivery = parseDate(wo.dataDeliveryDate);

  const effectiveDate = parsedDelivery || parsedEnd || parsedStart;
  const quarter = effectiveDate ? effectiveDate.quarter : 'Unspecified Date';

  // Revenue leakage flag: Completed execution but not fully billed
  const isUnbilledLeakage = (execStatus === 'Completed' || execStatus === 'Partially Completed') && billingStatus !== 'Billed' && amountToBeBilledExcl > 0;

  return {
    ...wo,
    cleanSector: normalizedSector,
    isEnergySector: normalizedSector.includes('Energy'),
    cleanBillingStatus: billingStatus,
    cleanExecStatus: execStatus,
    amountExcl,
    amountIncl,
    billedExcl,
    billedIncl,
    collectedIncl,
    amountToBeBilledExcl,
    receivable,
    quarter,
    isUnbilledLeakage
  };
}

export function computeDataQualityScorecard(deals, workOrders) {
  const totalDeals = deals.length;
  const missingDealValueCount = deals.filter(d => !d.hasValue).length;
  const missingCloseDateCount = deals.filter(d => !d.closeDateActual && !d.tentativeCloseDate).length;
  const unassignedOwnerCount = deals.filter(d => !d.ownerCode || d.ownerCode === 'Unassigned').length;

  const totalWO = workOrders.length;
  const woMissingDeliveryDate = workOrders.filter(w => !w.dataDeliveryDate).length;
  const woMissingBillingStatus = workOrders.filter(w => !w.billingStatus || w.billingStatus === 'Pending').length;

  // Quality index formula
  const dealHealth = Math.round(100 - ((missingDealValueCount * 0.5 + missingCloseDateCount * 0.3) / totalDeals) * 100);
  const woHealth = Math.round(100 - ((woMissingDeliveryDate * 0.4 + woMissingBillingStatus * 0.4) / totalWO) * 100);
  const overallHealth = Math.round((dealHealth + woHealth) / 2);

  return {
    overallHealth: Math.max(10, Math.min(100, overallHealth)),
    dealHealth,
    woHealth,
    caveats: [
      `${missingDealValueCount} out of ${totalDeals} deals (${Math.round((missingDealValueCount/totalDeals)*100)}%) lack explicit deal value; pipeline values use available estimates.`,
      `${missingCloseDateCount} deals lack target close dates; quarter allocation relies on tentative dates or creation timestamps.`,
      `${woMissingDeliveryDate} work orders have missing execution delivery dates.`,
      `Billing status typos (e.g. 'BIlled') and status variations ('Pause / struck') were auto-corrected during ingestion.`
    ]
  };
}

// PrintPal Workshop Operational Truth Engine
// Deterministic physical, electrical, geometric, and statutory gating for signage & fabrication workshops.

export interface ElectricalCheckResult {
  connectedWatts: number;
  designWattsRequired: number; // 1.25x derating law (80% continuous rule)
  currentAmps: number;
  wireRunFeet: number;
  wireAwg: number;
  voltageDrop: number;
  voltageAtSign: number;
  wireSafe: boolean;
  recommendedSmpsWatts: number;
  recommendedSmpsModel: string;
  loadFactorPercent: number;
  parallelFeedRequired: boolean;
  warnings: string[];
}

export interface SheetGeometryResult {
  flatWidthFeet: number;
  flatHeightFeet: number;
  fitsNormal: boolean;
  fitsRotated: boolean;
  fitsSingleSheet: boolean;
  recommendedRotationDeg: number;
  seamRequired: boolean;
  seamSplitCoordinates?: { panel1Width: number; panel2Width: number; height: number; seamAxis: "width" | "height" };
  kerfLossMm: number;
  strokeWidthCheck?: { strokeMm: number; moduleMm: number; fits: boolean; recommendation: string };
  warnings: string[];
}

export interface DispatchGateResult {
  orderTotal: number;
  gstAmount: number;
  hsnCode: string;
  ewayBillRequired: boolean;
  tokenAdvanceRequired: number; // 50%
  dispatchTokenRequired: number; // 40%
  handoverBalance: number; // 10%
  paymentStatus: "cleared" | "cheque_unverified" | "pending";
  dispatchGatePassed: boolean;
  warnings: string[];
}

export interface OverheadMarginResult {
  directCogs: number;
  overheadPercent: number;
  shopOverheadAmount: number;
  trueCogs: number;
  quotedPrice: number;
  grossProfit: number;
  realizedMarginPercent: number;
  naiveMarkupPercent: number;
  marginLeakagePercent: number;
  warnings: string[];
}

export interface WorkshopMachineJob {
  jobId: string;
  jobName: string;
  machineType: "cnc" | "laser" | "3d_printer";
  machineName: string;
  totalDurationSeconds: number;
  elapsedSeconds: number;
  feedrateMpm?: number;
  spindleRpm?: number;
  extruderTempC?: number;
  bedTempC?: number;
  chillerTempC?: number;
  materialEfficiencyPercent: number;
  status: "idle" | "running" | "paused" | "completed" | "error";
  currentStep: string;
  steps: string[];
}

export class WorkshopEngine {
  // ── 1. Electrical Derating Law & DC Voltage Drop (Truth Anchor #1) ─────────
  // Continuous load requires 1.25x headroom (80% rule).
  // DC Wire Resistance (Copper): 18 AWG = 6.385 mΩ/ft, 14 AWG = 2.525 mΩ/ft.
  static checkElectricalLoad(
    moduleCount: number,
    wattsPerModule = 1.2,
    wireRunFeet = 20,
    wireAwg = 18
  ): ElectricalCheckResult {
    const safeModules = Math.max(1, isNaN(moduleCount) ? 1 : Math.round(moduleCount));
    const safeWatts = Math.max(0.1, isNaN(wattsPerModule) ? 1.2 : wattsPerModule);
    const connectedWatts = Math.round(safeModules * safeWatts * 10) / 10;
    const designWattsRequired = Math.round(connectedWatts * 1.25 * 10) / 10;
    const currentAmps = Math.round((connectedWatts / 12.0) * 100) / 100;

    // Copper resistance per 1000 ft (Ohms)
    const awgRes: Record<number, number> = { 12: 1.588, 14: 2.525, 16: 4.016, 18: 6.385 };
    const rPerFoot = (awgRes[wireAwg] ?? 6.385) / 1000;
    const roundTripFeet = wireRunFeet * 2;
    const voltageDrop = Math.round(currentAmps * (roundTripFeet * rPerFoot) * 100) / 100;
    const voltageAtSign = Math.max(0, Math.round((12.0 - voltageDrop) * 100) / 100);
    const wireSafe = voltageDrop <= 0.6; // 5% maximum permissible drop on 12V

    const smpsTiers = [
      { watts: 60, model: "MeanWell LPV-60-12" },
      { watts: 100, model: "MeanWell LPV-100-12" },
      { watts: 150, model: "MeanWell LPV-150-12" },
      { watts: 250, model: "MeanWell LPV-250-12" },
      { watts: 350, model: "MeanWell LPV-350-12" },
      { watts: 400, model: "MeanWell LPV-400-12" },
    ];

    const chosenTier = smpsTiers.find((t) => t.watts >= designWattsRequired) ?? {
      watts: Math.ceil(designWattsRequired / 350) * 350,
      model: `Multiple MeanWell 350W units (x${Math.ceil(designWattsRequired / 350)})`,
    };

    const loadFactorPercent = Math.round((connectedWatts / chosenTier.watts) * 1000) / 10;
    const parallelFeedRequired = safeModules > 50;
    const warnings: string[] = [];

    if (safeModules > 50) {
      warnings.push(`Module count (${safeModules}) exceeds 50: parallel 18 AWG power feeds required to avoid string voltage drop.`);
    }

    if (!wireSafe) {
      warnings.push(`DC wire drop (${voltageDrop}V over ${wireRunFeet}ft ${wireAwg} AWG) exceeds 5% limit (${voltageAtSign}V reaching sign). Upgrade to 14 AWG or shorten run.`);
    }

    if (loadFactorPercent > 80) {
      warnings.push(`Load factor (${loadFactorPercent}%) violates the 80% continuous electrical rule. Thermal burnout hazard.`);
    }

    return {
      connectedWatts,
      designWattsRequired,
      currentAmps,
      wireRunFeet,
      wireAwg,
      voltageDrop,
      voltageAtSign,
      wireSafe,
      recommendedSmpsWatts: chosenTier.watts,
      recommendedSmpsModel: chosenTier.model,
      loadFactorPercent,
      parallelFeedRequired,
      warnings,
    };
  }

  // ── 2. 2D Geometry & Sheet Law with Orthogonal Rotation (Truth Anchor #2) ──
  // Standard stock sheet is 8x4 ft. Unfolding a tray: flat = dimension + 2 * (return + flange).
  // Standard router bit kerf = 3.175mm (1/8"). Standard LED module width = 15mm.
  static checkSheetGeometry(
    faceWidthFt: number,
    faceHeightFt: number,
    returnInches = 2.5,
    flangeInches = 0.75,
    minLetterStrokeMm?: number
  ): SheetGeometryResult {
    const safeW = Math.max(0.1, isNaN(faceWidthFt) ? 1 : faceWidthFt);
    const safeH = Math.max(0.1, isNaN(faceHeightFt) ? 1 : faceHeightFt);
    const extraFeet = (2 * (returnInches + flangeInches)) / 12;
    const flatWidthFeet = Math.round((safeW + extraFeet) * 100) / 100;
    const flatHeightFeet = Math.round((safeH + extraFeet) * 100) / 100;

    // 2D Orthogonal Fit Test against 8x4 ft sheet
    const fitsNormal = flatWidthFeet <= 8.0 && flatHeightFeet <= 4.0;
    const fitsRotated = flatWidthFeet <= 4.0 && flatHeightFeet <= 8.0;
    const fitsSingleSheet = fitsNormal || fitsRotated;
    const seamRequired = !fitsSingleSheet;
    const recommendedRotationDeg = fitsRotated && !fitsNormal ? 90 : 0;
    const warnings: string[] = [];

    let seamSplitCoordinates: SheetGeometryResult["seamSplitCoordinates"] = undefined;
    if (seamRequired) {
      if (flatWidthFeet > 8.0) {
        seamSplitCoordinates = {
          panel1Width: 8.0,
          panel2Width: Math.round((flatWidthFeet - 8.0) * 100) / 100,
          height: flatHeightFeet,
          seamAxis: "width",
        };
        warnings.push(
          `Flat cut (${flatWidthFeet}x${flatHeightFeet} ft) exceeds 8x4 ft sheet stock in width. Mandatory seam split placed at 8.0 ft line.`
        );
      } else if (flatHeightFeet > 8.0) {
        seamSplitCoordinates = {
          panel1Width: flatWidthFeet,
          panel2Width: Math.round((flatHeightFeet - 8.0) * 100) / 100,
          height: 8.0,
          seamAxis: "height",
        };
        warnings.push(
          `Flat cut (${flatWidthFeet}x${flatHeightFeet} ft) exceeds 8x4 ft sheet stock in height. Mandatory seam split placed at 8.0 ft line.`
        );
      } else {
        // Both dimensions exceed 4 ft (e.g. 7.54 x 5.54 ft) -> Cannot fit on 8x4 ft in either orientation
        seamSplitCoordinates = {
          panel1Width: flatWidthFeet,
          panel2Width: Math.round((flatHeightFeet - 4.0) * 100) / 100,
          height: 4.0,
          seamAxis: "height",
        };
        warnings.push(
          `Both flat dimensions (${flatWidthFeet}x${flatHeightFeet} ft) exceed 4 ft sheet width. Part CANNOT fit on an 8x4 ft sheet in any orientation. Seam split at 4.0 ft line required.`
        );
      }
    } else if (recommendedRotationDeg === 90) {
      warnings.push(`Sign fits 8x4 ft stock when rotated 90° (${flatHeightFeet}x${flatWidthFeet} ft nested orientation).`);
    }

    let strokeWidthCheck: SheetGeometryResult["strokeWidthCheck"] = undefined;
    if (minLetterStrokeMm !== undefined) {
      const standardModuleMm = 15.0; // Samsung 3-LED module width
      const fits = minLetterStrokeMm >= standardModuleMm;
      strokeWidthCheck = {
        strokeMm: minLetterStrokeMm,
        moduleMm: standardModuleMm,
        fits,
        recommendation: fits
          ? "Letter stroke accommodates standard 65x15mm Samsung 3-LED modules."
          : `Stroke (${minLetterStrokeMm}mm) < 15mm module width. Switch to 9mm mini-modules or edge-lit acrylic.`,
      };
      if (!fits) {
        warnings.push(strokeWidthCheck.recommendation);
      }
    }

    return {
      flatWidthFeet,
      flatHeightFeet,
      fitsNormal,
      fitsRotated,
      fitsSingleSheet,
      recommendedRotationDeg,
      seamRequired,
      seamSplitCoordinates,
      kerfLossMm: 3.175,
      strokeWidthCheck,
      warnings,
    };
  }

  // ── 3. 50/40/10 Milestone Gating & Statutory Tax (Truth Anchors #3 & #5) ──
  // Milestone: 50% Token Advance -> 40% Dispatch Gate -> 10% Handover on Live Test.
  // HSN 9405 illuminated signage @ 18% GST. Consignments > Rs.50,000 mandate E-Way Bill.
  static validateDispatchGate(
    orderSubtotal: number,
    advanceReceived: number,
    dispatchPaymentReceived: number,
    paymentStatus: "cleared" | "cheque_unverified" | "pending" = "cleared"
  ): DispatchGateResult {
    const safeSubtotal = Math.max(0, isNaN(orderSubtotal) ? 0 : orderSubtotal);
    const gstAmount = Math.round(safeSubtotal * 0.18 * 100) / 100;
    const orderTotal = Math.round((safeSubtotal + gstAmount) * 100) / 100;

    const tokenAdvanceRequired = Math.round(orderTotal * 0.5 * 100) / 100;
    const dispatchTokenRequired = Math.round(orderTotal * 0.4 * 100) / 100;
    const handoverBalance = Math.round(orderTotal * 0.1 * 100) / 100;

    const ewayBillRequired = orderTotal > 50000;
    const warnings: string[] = [];

    const advanceCleared = advanceReceived >= tokenAdvanceRequired;
    const dispatchCleared = dispatchPaymentReceived >= dispatchTokenRequired && paymentStatus === "cleared";
    const dispatchGatePassed = advanceCleared && dispatchCleared;

    if (!advanceCleared) {
      warnings.push(`50% Token Advance unverified (Received: ₹${advanceReceived}, Required: ₹${tokenAdvanceRequired}). Production blocked.`);
    }

    if (dispatchPaymentReceived >= dispatchTokenRequired && paymentStatus === "cheque_unverified") {
      warnings.push(`Dispatch Gate LOCKED: Cheque payment of ₹${dispatchPaymentReceived} is UNVERIFIED. Trucks DO NOT leave for unverified cheques (Truth Anchor #3).`);
    } else if (dispatchPaymentReceived < dispatchTokenRequired) {
      warnings.push(`40% Dispatch Token unverified (Received: ₹${dispatchPaymentReceived}, Required: ₹${dispatchTokenRequired}). Factory Floor Exit Locked.`);
    }

    if (ewayBillRequired) {
      warnings.push(`Consignment ₹${orderTotal} > ₹50,000: Mandatory E-Way Bill payload generated under HSN 9405.`);
    }

    return {
      orderTotal,
      gstAmount,
      hsnCode: "9405",
      ewayBillRequired,
      tokenAdvanceRequired,
      dispatchTokenRequired,
      handoverBalance,
      paymentStatus,
      dispatchGatePassed,
      warnings,
    };
  }

  // ── 4. Margin Leakage & Shop Overhead (Truth Anchor #4) ────────────────────
  // Realized Gross Margin != Naive Markup.
  // Direct COGS must always include 10%-15% shop overhead (rent, power, cutter blade wear).
  static calculateTrueGrossMargin(
    directCogs: number,
    quotedPrice: number,
    overheadPercent = 12
  ): OverheadMarginResult {
    const safeCogs = Math.max(0, isNaN(directCogs) ? 0 : directCogs);
    const safePrice = Math.max(0.1, isNaN(quotedPrice) ? 1 : quotedPrice);
    const shopOverheadAmount = Math.round(safeCogs * (overheadPercent / 100) * 100) / 100;
    const trueCogs = Math.round((safeCogs + shopOverheadAmount) * 100) / 100;
    const grossProfit = Math.round((safePrice - trueCogs) * 100) / 100;
    const realizedMarginPercent = Math.round((grossProfit / safePrice) * 1000) / 10;
    const naiveMarkupPercent = Math.round(((safePrice - safeCogs) / safePrice) * 1000) / 10;
    const marginLeakagePercent = Math.round((naiveMarkupPercent - realizedMarginPercent) * 10) / 10;

    const warnings: string[] = [];
    if (marginLeakagePercent > 5) {
      warnings.push(`Shop overhead (${overheadPercent}%) silently erodes margin from ${naiveMarkupPercent}% down to ${realizedMarginPercent}%. Net margin leakage: ${marginLeakagePercent}%.`);
    }
    if (realizedMarginPercent < 25) {
      warnings.push(`Realized gross margin (${realizedMarginPercent}%) is dangerously thin for custom architectural fabrication (<30% benchmark).`);
    }

    return {
      directCogs: safeCogs,
      overheadPercent,
      shopOverheadAmount,
      trueCogs,
      quotedPrice: safePrice,
      grossProfit,
      realizedMarginPercent,
      naiveMarkupPercent,
      marginLeakagePercent,
      warnings,
    };
  }
}

import { Language, PaymentMode, ThermalPaperWidth } from "./types";

export interface TicketData {
  businessName: string;
  tokenCode: string;
  vehicleTypeName: string;
  vehicleNumber: string;
  entryTime: string; // ISO
  amountPaid: number;
  paymentMode?: PaymentMode;
  isMember: boolean;
  language: Language;
  paperWidth: ThermalPaperWidth;
}

const labels = {
  en: {
    type: "Type", number: "Number", in: "In",
    paid: "Paid", member: "Member — No Charge",
    payAtExit: "Pay at exit", cash: "Cash", online: "Online",
    thanks: "Thank you!",
  },
  ta: {
    type: "வகை", number: "எண்", in: "நுழைந்த நேரம்",
    paid: "கட்டணம்", member: "உறுப்பினர் — கட்டணம் இல்லை",
    payAtExit: "வெளியேறும்போது கட்டுங்கள்", cash: "காசு", online: "ஆன்லைன்",
    thanks: "நன்றி!",
  },
};

const vehicleNames: Record<Language, Record<string, string>> = {
  en: { Bike: "Bike", Cycle: "Cycle", Car: "Car" },
  ta: { Bike: "பைக்", Cycle: "சைக்கிள்", Car: "கார்" },
};

function formatEntryTime(iso: string, language: Language): string {
  return new Date(iso).toLocaleString(language === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function printThermalTicket(data: TicketData): void {
  const lbl = labels[data.language];
  const typeName = vehicleNames[data.language][data.vehicleTypeName] ?? data.vehicleTypeName;

  let paymentLine: string;
  if (data.isMember) {
    paymentLine = lbl.member;
  } else if (data.amountPaid > 0 && data.paymentMode) {
    const modeLabel = data.paymentMode === "cash" ? lbl.cash : lbl.online;
    paymentLine = `&#8377;${data.amountPaid} (${modeLabel})`;
  } else {
    paymentLine = lbl.payAtExit;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${data.paperWidth};
    padding: 3mm 4mm 6mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10pt;
    color: #000;
  }
  .business { font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 2mm; }
  .divider { border: none; border-top: 1px dashed #000; margin: 2.5mm 0; }
  .token { font-size: 22pt; font-weight: bold; text-align: center; letter-spacing: 2px; margin: 2mm 0; }
  .row { display: flex; justify-content: space-between; margin: 1.5mm 0; font-size: 9.5pt; }
  .label { color: #555; }
  .payment { text-align: center; font-weight: bold; margin: 1mm 0; }
  .thanks { text-align: center; margin-top: 3mm; font-size: 9pt; }
  @page { size: ${data.paperWidth} auto; margin: 0; }
</style>
</head>
<body>
  <div class="business">${esc(data.businessName)}</div>
  <hr class="divider">
  <div class="token">${esc(data.tokenCode)}</div>
  <hr class="divider">
  <div class="row"><span class="label">${lbl.type}</span><span>${typeName}</span></div>
  ${data.vehicleNumber ? `<div class="row"><span class="label">${lbl.number}</span><span>${esc(data.vehicleNumber)}</span></div>` : ""}
  <div class="row"><span class="label">${lbl.in}</span><span>${formatEntryTime(data.entryTime, data.language)}</span></div>
  <hr class="divider">
  <div class="payment">${paymentLine}</div>
  <div class="thanks">${lbl.thanks}</div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;width:0;height:0;border:none;top:0;left:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }

  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    iframe.contentWindow?.addEventListener("afterprint", () => {
      document.body.removeChild(iframe);
    });
  };
}

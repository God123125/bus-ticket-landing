import { Booking } from "@/lib/booking-data";

/**
 * Formats a date string or timestamp into a readable date.
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Triggers a professional printable / downloadable PDF Invoice invoice for a booking.
 */
export function downloadBookingInvoice(booking: Booking): void {
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups to download or print your invoice.");
    return;
  }

  const outboundSeats = Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats || "");
  const returnSeats = Array.isArray(booking.returnSeats) ? booking.returnSeats.join(", ") : String(booking.returnSeats || "N/A");
  const invoiceDate = formatDate(booking.createdAt || new Date().toISOString());
  const formattedTotal = Number(booking.total || 0).toFixed(2);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${booking.booking_code}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 32px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 22px;
      color: #059669;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-title p {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .code-badge {
      font-family: monospace;
      font-weight: 700;
      font-size: 14px;
      background: #ecfdf5;
      color: #065f46;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 6px;
      border: 1px solid #a7f3d0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .info-box {
      background: #f8fafc;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    .info-box p {
      font-size: 14px;
      color: #334155;
      margin-bottom: 4px;
    }
    .info-box p:last-child {
      margin-bottom: 0;
    }
    .info-box strong {
      color: #0f172a;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 14px;
      font-weight: 600;
    }
    td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #334155;
    }
    .trip-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      display: inline-block;
      margin-bottom: 4px;
    }
    .trip-badge.return {
      background: #fef3c7;
      color: #92400e;
    }
    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .total-box {
      width: 280px;
      background: #f8fafc;
      padding: 18px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 8px;
      color: #64748b;
    }
    .total-row.final {
      border-top: 2px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 10px;
      margin-bottom: 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .total-row.final span:last-child {
      color: #059669;
    }
    .footer {
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      color: #94a3b8;
      font-size: 12px;
    }
    .footer p {
      margin-bottom: 4px;
    }
    .paid-stamp {
      display: inline-block;
      border: 2px solid #059669;
      color: #059669;
      font-weight: 800;
      font-size: 12px;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 4px;
      transform: rotate(-4deg);
      margin-left: 8px;
    }
    @media print {
      body {
        padding: 0;
        background: none;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 780px; margin: 0 auto 20px; display: flex; justify-content: flex-end; gap: 10px;">
    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div class="logo-badge">
        <div class="logo-icon">GB</div>
        <div>
          <div class="brand-title">GreenBus</div>
          <div style="font-size: 12px; color: #64748b;">Cambodia's Intercity Travel Network</div>
        </div>
      </div>
      <div class="invoice-title">
        <h1>Official Receipt</h1>
        <p>Issued on: <strong>${invoiceDate}</strong></p>
        <div class="code-badge">Ref: ${booking.booking_code}</div>
      </div>
    </div>

    <div class="details-grid">
      <div>
        <div class="section-title">Passenger Information</div>
        <div class="info-box">
          <p><strong>Name:</strong> ${booking.passenger.fullName}</p>
          <p><strong>Email:</strong> ${booking.passenger.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${booking.passenger.phone || "N/A"}</p>
        </div>
      </div>

      <div>
        <div class="section-title">Payment Information</div>
        <div class="info-box">
          <p><strong>Status:</strong> ${booking.paymentStatus || "Paid"} <span class="paid-stamp">PAID</span></p>
          <p><strong>Method:</strong> ${booking.paymentMethod || "KHQR"}</p>
          <p><strong>Booking Status:</strong> ${booking.status || "Confirmed"}</p>
        </div>
      </div>
    </div>

    <div class="section-title">Trip & Ticket Details</div>
    <table>
      <thead>
        <tr>
          <th>Journey</th>
          <th>Bus & Operator</th>
          <th>Date & Time</th>
          <th>Seats</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <span class="trip-badge">Outbound</span><br />
            <strong>${booking.from} → ${booking.to}</strong>
          </td>
          <td>
            ${booking.company}<br />
            <span style="font-size: 12px; color: #64748b;">${booking.busName}</span>
          </td>
          <td>
            ${booking.date}<br />
            <span style="font-size: 12px; color: #64748b;">${booking.departureTime}</span>
          </td>
          <td>
            <strong>${outboundSeats}</strong>
          </td>
        </tr>
        ${
          booking.isRoundTrip && booking.returnFrom
            ? `
        <tr>
          <td>
            <span class="trip-badge return">Return</span><br />
            <strong>${booking.returnFrom} → ${booking.returnTo}</strong>
          </td>
          <td>
            ${booking.returnCompany || booking.company}<br />
            <span style="font-size: 12px; color: #64748b;">${booking.returnBusName || booking.busName}</span>
          </td>
          <td>
            ${booking.returnDate || booking.date}<br />
            <span style="font-size: 12px; color: #64748b;">${booking.returnDepartureTime || "Scheduled"}</span>
          </td>
          <td>
            <strong>${returnSeats}</strong>
          </td>
        </tr>
        `
            : ""
        }
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-box">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${formattedTotal}</span>
        </div>
        <div class="total-row">
          <span>Taxes & Fees:</span>
          <span>$0.00</span>
        </div>
        <div class="total-row final">
          <span>Total Paid:</span>
          <span>$${formattedTotal}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing GreenBus for your journey!</p>
      <p>Present this receipt or your booking reference (${booking.booking_code}) at the terminal boarding desk.</p>
      <p>© ${new Date().getFullYear()} GreenBus Inc. All rights reserved.</p>
    </div>
  </div>

  <script>
    // Trigger print dialog automatically after styles render
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

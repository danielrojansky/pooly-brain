const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SaaS Vendor Checkout</title>
<style>
  body { font-family: "Times New Roman", serif; background: #e8e8e8; margin: 0; padding: 20px; }
  .container { background: #f5f5f0; border: 1px solid #999; max-width: 500px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 18px; color: #333; border-bottom: 2px solid #666; padding-bottom: 8px; margin-bottom: 16px; }
  .field-group { margin-bottom: 12px; }
  label { display: block; font-size: 13px; color: #555; margin-bottom: 3px; font-weight: bold; }
  input { width: 100%; padding: 5px 6px; border: 1px solid #aaa; background: #fff; font-family: "Courier New", monospace; font-size: 14px; box-sizing: border-box; }
  .row { display: flex; gap: 12px; }
  .row .field-group { flex: 1; }
  .submit-btn { background: #336699; color: white; border: none; padding: 10px 24px; font-size: 14px; cursor: pointer; margin-top: 8px; font-family: "Times New Roman", serif; }
  .submit-btn:hover { background: #254d73; }
  .secure-note { font-size: 11px; color: #666; margin-top: 12px; border-top: 1px solid #ccc; padding-top: 8px; }
  .product-row { background: #fff; border: 1px solid #ccc; padding: 8px 12px; margin-bottom: 16px; font-size: 13px; }
  .total { font-weight: bold; text-align: right; font-size: 14px; margin-top: 4px; }
</style>
</head>
<body>
<div class="container">
  <h1>SaaS Vendor Checkout</h1>
  <div class="product-row">
    <div>Professional Plan &mdash; Annual Subscription</div>
    <div class="total">$299.00</div>
  </div>
  <form onsubmit="event.preventDefault();">
    <div class="field-group">
      <label for="cc-num">Card Number</label>
      <input id="cc-num" name="card_number" type="text" placeholder="4111 1111 1111 1111" maxlength="19" />
    </div>
    <div class="row">
      <div class="field-group">
        <label for="cc-exp">Expiry (MM/YY)</label>
        <input id="cc-exp" name="cc-exp" type="text" placeholder="12/28" maxlength="5" />
      </div>
      <div class="field-group">
        <label for="cc-cvv">CVV</label>
        <input id="cc-cvv" name="cc-cvv" type="text" placeholder="123" maxlength="4" />
      </div>
    </div>
    <div class="field-group">
      <label for="billing-zip">Billing Zip</label>
      <input id="billing-zip" name="zip" type="text" placeholder="94107" maxlength="10" />
    </div>
    <button type="submit" class="submit-btn">Submit Order</button>
  </form>
  <div class="secure-note">
    Your payment information is encrypted and secure.
    By clicking Submit Order, you agree to our Terms of Service.
  </div>
</div>
</body>
</html>`;

export async function GET() {
  return new Response(HTML, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

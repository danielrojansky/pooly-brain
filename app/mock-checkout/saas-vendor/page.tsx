'use client';

export default function MockCheckoutPage() {
  return (
    <html>
      <head>
        <style>{`
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
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>SaaS Vendor Checkout</h1>
          <div className="product-row">
            <div>Professional Plan — Annual Subscription</div>
            <div className="total">$299.00</div>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="field-group">
              <label htmlFor="cc-num">Card Number</label>
              <input id="cc-num" type="text" placeholder="4111 1111 1111 1111" maxLength={19} />
            </div>
            <div className="row">
              <div className="field-group">
                <label htmlFor="cc-exp">Expiry (MM/YY)</label>
                <input id="cc-exp" type="text" placeholder="12/28" maxLength={5} />
              </div>
              <div className="field-group">
                <label htmlFor="cc-cvv">CVV</label>
                <input id="cc-cvv" type="text" placeholder="123" maxLength={4} />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="billing-zip">Billing Zip</label>
              <input id="billing-zip" type="text" placeholder="94107" maxLength={10} />
            </div>
            <button type="submit" className="submit-btn">Submit Order</button>
          </form>
          <div className="secure-note">
            Your payment information is encrypted and secure.
            By clicking Submit Order, you agree to our Terms of Service.
          </div>
        </div>
      </body>
    </html>
  );
}

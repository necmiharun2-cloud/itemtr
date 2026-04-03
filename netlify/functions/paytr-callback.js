const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || '';
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || '';

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const params = new URLSearchParams(event.body);
    
    const merchantOid = params.get('merchant_oid');
    const status = params.get('status');
    const totalAmount = params.get('total_amount');
    const hash = params.get('hash');

    // Verify hash
    const hashString = `${PAYTR_MERCHANT_KEY}${merchantOid}${totalAmount}${PAYTR_MERCHANT_SALT}`;
    const crypto = require('crypto');
    const expectedHash = crypto.createHash('sha256').update(hashString).digest('base64');

    if (hash !== expectedHash) {
      return {
        statusCode: 400,
        body: 'Hash verification failed'
      };
    }

    // Update payment in Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (status === 'success') {
      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', merchantOid)
        .single();

      if (payment && payment.status === 'pending') {
        // Update payment status
        await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            paytr_order_id: params.get('hash'),
            metadata: { paytr_callback: Object.fromEntries(params) }
          })
          .eq('id', merchantOid);

        // Update user balance
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', payment.user_id)
          .single();

        const newBalance = (profile?.balance || 0) + payment.amount;

        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', payment.user_id);

        // Create wallet transaction
        await supabase
          .from('wallet_transactions')
          .insert({
            user_id: payment.user_id,
            type: 'deposit',
            amount: payment.amount,
            balance_after: newBalance,
            description: `PayTR ile bakiye yükleme - ${merchantOid}`,
            status: 'completed',
          });
      }
    } else {
      // Payment failed
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          metadata: { 
            paytr_callback: Object.fromEntries(params),
            failed_reason: params.get('failed_reason_code')
          }
        })
        .eq('id', merchantOid);
    }

    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('PayTR webhook error:', error);
    return {
      statusCode: 500,
      body: 'Internal error'
    };
  }
};

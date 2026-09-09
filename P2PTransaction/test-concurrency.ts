// test-concurrency.ts
import 'dotenv/config';

// Replace these UUIDs with the generated ones output by your seed script!
const SENDER_WALLET_ID = '40bd8a83-ac98-4ac0-b2a6-884fbba36e94';
const RECIPIENT_WALLET_ID = '5491e1de-023c-4d93-979e-f427cf7e46d2';
const API_URL = 'http://localhost:3000/api/transfers';

async function runConcurrencyTest() {
  const sharedIdempotencyKey = `tx_test_${Date.now()}`;
  const totalParallelRequests = 10;

  console.log(`🚀 Firing ${totalParallelRequests} concurrent requests using Key: ${sharedIdempotencyKey}\n`);

  const payload = JSON.stringify({
    senderWalletId: SENDER_WALLET_ID,
    recipientWalletId: RECIPIENT_WALLET_ID,
    amountInKobo: 500000, // ₦5,000 in kobo
  });

  // Create 10 parallel HTTP requests using Promise.all
  const requests = Array.from({ length: totalParallelRequests }).map((_, index) =>
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': sharedIdempotencyKey,
      },
      body: payload,
    }).then(async (res) => ({
      requestIndex: index + 1,
      status: res.status,
      data: await res.json(),
    }))
  );

  const results = await Promise.all(requests);

  console.log('📊 RESULTS SUMMARY:');
  console.log('--------------------------------------------------');
  results.forEach((r) => {
    console.log(`Request #${r.requestIndex} | Status Code: ${r.status} | Body:`, r.data);
  });
  console.log('--------------------------------------------------');

  // Verify behavior: Exactly 1 request should succeed cleanly with 200, and others should return cached 200 or 409
  const successCount = results.filter((r) => r.status === 200).length;
  console.log(`\n Total HTTP 200 Responses: ${successCount}/${totalParallelRequests}`);
  console.log('✨ If idempotency worked, Alice was charged EXACTLY ONCE (₦5,000), not 10 times!');
}

runConcurrencyTest();
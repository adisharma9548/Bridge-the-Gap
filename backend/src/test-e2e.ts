// E2E Verification Script for Setu Authentication, Profile, and Saved Records

const API = 'http://localhost:4000/api';

async function runTests() {
  console.log('🧪 STARTING SETU E2E VERIFICATION SUITE...\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failCount++;
    }
  }

  const testEmail = `citizen_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  let authToken = '';
  let userId = '';
  let savedDocId = '';

  // 1. REGISTRATION VALIDATIONS
  console.log('--- 1. Testing Registration Validation ---');

  // 1a. Missing password
  const res1 = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Citizen', email: testEmail }),
  });
  const data1 = (await res1.json()) as any;
  const msg1 = data1.error || data1.message || '';
  assert(res1.status === 400 && msg1.toLowerCase().includes('password is required'), 'Registration rejects missing password with 400');

  // 1b. Short password (< 8 chars)
  const res2 = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Citizen', email: testEmail, password: 'short' }),
  });
  const data2 = (await res2.json()) as any;
  const msg2 = data2.error || data2.message || '';
  assert(res2.status === 400 && msg2.toLowerCase().includes('8 characters'), 'Registration rejects short password (< 8 chars) with 400');

  // 1c. Valid registration
  const res3 = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Aarav Sharma', email: testEmail, password: testPassword }),
  });
  const data3 = (await res3.json()) as any;
  assert(res3.status === 201 && data3.user?.email === testEmail, 'Registration succeeds with 201 and returns user object');
  assert(!data3.user?.password && !data3.user?.password_hash, 'Registration response NEVER exposes plain password or hash');

  // 1d. Duplicate registration
  const res4 = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate', email: testEmail, password: testPassword }),
  });
  const data4 = (await res4.json()) as any;
  const msg4 = data4.error || data4.message || '';
  assert(res4.status === 400 && msg4.toLowerCase().includes('already exists'), 'Registration rejects duplicate email with 400');

  // 2. SIGN IN & AUTHENTICATION
  console.log('\n--- 2. Testing Sign In & Authentication ---');

  // 2a. Unknown account
  const res5 = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `unknown_${Date.now()}@example.com`, password: 'anypassword' }),
  });
  const data5 = (await res5.json()) as any;
  const msg5 = data5.error || data5.message || '';
  assert(res5.status === 400 && msg5.toLowerCase().includes('no account found'), 'Sign-in rejects unknown account and does NOT auto-register');

  // 2b. Wrong password
  const res6 = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999!' }),
  });
  const data6 = (await res6.json()) as any;
  const msg6 = data6.error || data6.message || '';
  assert(res6.status === 400 && msg6.toLowerCase().includes('incorrect password'), 'Sign-in rejects wrong password');

  // 2c. Correct credentials
  const res7 = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const data7 = (await res7.json()) as any;
  assert(res7.status === 200 && Boolean(data7.token) && data7.user?.email === testEmail, 'Sign-in succeeds with 200, JWT token, and user info');
  assert(!data7.user?.password && !data7.user?.password_hash, 'Sign-in response NEVER exposes plain password or hash');
  authToken = data7.token;
  userId = data7.user.id;

  // 3. PROFILE MANAGEMENT (DASHBOARD AS PROFILE)
  console.log('\n--- 3. Testing User Profile Updates ---');

  // 3a. Update without token
  const res8 = await fetch(`${API}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Aarav S.' }),
  });
  assert(res8.status === 401, 'Profile update rejects unauthenticated requests with 401');

  // 3b. Update with valid token
  const res9 = await fetch(`${API}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: 'Aarav S. (Verified Citizen)' }),
  });
  const data9 = (await res9.json()) as any;
  assert(res9.status === 200 && data9.user?.name === 'Aarav S. (Verified Citizen)', 'Profile update changes display name successfully');
  assert(!data9.user?.password && !data9.user?.password_hash, 'Profile update response NEVER exposes password or hash');

  // 4. SAVED RECORDS FUNCTIONALITY
  console.log('\n--- 4. Testing Saved Records Functionality ---');

  // 4a. Initial user saved items should be empty
  const res10 = await fetch(`${API}/saved`, {
    headers: {
      'x-session-id': 'sess-test-init',
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data10 = (await res10.json()) as any;
  assert(res10.status === 200 && Array.isArray(data10.items) && data10.items.length === 0, 'Initial saved records empty for new user');

  // 4b. Save a Document Dossier under authenticated user
  const res11 = await fetch(`${API}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': 'sess-test-init',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      kind: 'understand',
      title: 'SARFAESI Section 13(2) Demand Notice Explanation',
      payload: {
        summary: 'Bank demand notice for ₹12.5L home loan with 60 day statutory cure window.',
        action_steps: [{ step_number: 1, action: 'File written objection within 60 days', deadline_or_urgency: '60 days' }]
      }
    }),
  });
  const data11 = (await res11.json()) as any;
  assert((res11.status === 201 || res11.status === 200) && data11.item?.id && data11.item?.user_id === userId, 'Document Dossier saved with user_id attached');
  savedDocId = data11.item?.id;

  // 4c. Save a Civic Resource under authenticated user
  const res12 = await fetch(`${API}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': 'sess-test-init',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      kind: 'resource',
      title: 'NALSA Free Legal Aid and Lok Adalat Mediation',
      payload: { id: 'res-nalsa-legal-aid', title_en: 'NALSA Legal Aid' }
    }),
  });
  const data12 = (await res12.json()) as any;
  assert((res12.status === 201 || res12.status === 200) && data12.item?.user_id === userId, 'Civic Resource saved with user_id attached');

  // 4d. Fetch saved records and verify persistence
  const res13 = await fetch(`${API}/saved`, {
    headers: {
      'x-session-id': 'sess-different-session-id', // Different session ID simulates refresh/new session
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data13 = (await res13.json()) as any;
  assert(res13.status === 200 && data13.items?.length === 2, 'Saved records persist across sessions for authenticated user (length = 2)');

  // 4e. Delete saved record
  const res14 = await fetch(`${API}/saved/${savedDocId}`, {
    method: 'DELETE',
    headers: {
      'x-session-id': 'sess-different-session-id',
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data14 = (await res14.json()) as any;
  assert(res14.status === 200 && data14.success === true, 'Saved record deleted successfully');

  // 4f. Verify count is now 1
  const res15 = await fetch(`${API}/saved`, {
    headers: {
      'x-session-id': 'sess-different-session-id',
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data15 = (await res15.json()) as any;
  assert(res15.status === 200 && data15.items?.length === 1, 'Saved records count reflects deletion (length = 1)');

  // 5. GUEST-TO-USER SESSION RECORD MIGRATION
  console.log('\n--- 5. Testing Guest-to-User Record Migration ---');
  const guestSessionId = `guest_sess_${Date.now()}`;

  // 5a. Guest saves an item anonymously
  const res16 = await fetch(`${API}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': guestSessionId,
    },
    body: JSON.stringify({
      kind: 'resource',
      title: 'Consumer Dispute Resolution Portal',
      payload: { id: 'res-nch-consumer' }
    }),
  });
  const data16 = (await res16.json()) as any;
  assert((res16.status === 201 || res16.status === 200) && data16.item?.session_id === guestSessionId && !data16.item?.user_id, 'Guest record saved under guest session_id without user_id');

  // 5b. When user signs in and sends auth token + previous session ID, backend migrates record
  const res17 = await fetch(`${API}/saved`, {
    headers: {
      'x-session-id': guestSessionId,
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data17 = (await res17.json()) as any;
  const migratedItem = data17.items?.find((i: any) => i.id === data16.item?.id);
  assert(Boolean(migratedItem) && migratedItem?.user_id === userId, 'Guest record automatically migrated to user_id upon sign-in');

  console.log(`\n===========================================`);
  console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`===========================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

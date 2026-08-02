# Proactive Account Rotation Hook

This UserPromptSubmit hook implements **proactive account rotation** by checking OAuth usage before each user message and automatically rotating to a low-usage account when the current account exceeds 90% of its 5-hour rate limit.

## Overview

**Hook Type:** UserPromptSubmit
**Purpose:** Prevent rate limit errors by rotating accounts before hitting limits
**Execution Time:** <500ms (with caching)

### How It Works

1. **User sends a message** → Hook triggers before message is processed
2. **Check current account usage** → Fetch from Anthropic OAuth API (with 60s cache)
3. **If usage > 90%** → Find account with lowest usage and rotate
4. **If all accounts > 90%** → Warn user but allow message to proceed
5. **Message proceeds** with new account (if rotated)

### Key Features

- ✅ **Proactive rotation** - Rotates BEFORE hitting limits (vs reactive rotation after errors)
- ✅ **Smart caching** - 60-second TTL prevents API spam
- ✅ **Fast execution** - 500ms timeout ensures no message delays
- ✅ **Graceful degradation** - Uses stale cache on API failures
- ✅ **Single account support** - Skips rotation when only 1 account configured
- ✅ **All-exhausted handling** - Warns user when all accounts are above 90%

## Configuration

### Hook Registration

The hook is registered in `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$(git rev-parse --show-toplevel)/.claude/hooks/proactive/usage-check.js\"",
            "description": "Proactively rotate accounts when usage exceeds 90%"
          }
        ]
      }
    ]
  }
}
```

### Threshold Configuration

The rotation threshold is defined in the hook file:

```javascript
const ROTATION_THRESHOLD = 90; // 90% utilization
```

To change the threshold, edit this constant in `usage-check.js`.

### Cache Configuration

```javascript
const CACHE_TTL_MS = 60 * 1000;      // 60 seconds
const API_TIMEOUT_MS = 500;          // 500ms timeout
```

**Why 60 seconds?**
- Usage percentages don't change drastically in 60 seconds
- Balances freshness vs API load
- Prevents hook slowdown on rapid consecutive messages

**Why 500ms timeout?**
- Ensures hook doesn't delay user messages
- Fast enough for good UX
- Falls back to stale cache on timeout

## Usage Examples

### Example 1: Normal Operation (Usage < 90%)

```
User sends message: "Implement feature X"
→ Hook checks usage: account-1 at 45%
→ No rotation needed
→ Message proceeds with account-1
```

### Example 2: Proactive Rotation (Usage > 90%)

```
User sends message: "Continue working"
→ Hook checks usage: account-1 at 93%
→ Finds account-2 with 12% usage
→ Rotates: account-1 → account-2
→ User sees notification:

┌━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐
│ ✓ PROACTIVE ACCOUNT ROTATION          │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ Rotated: account-1 → account-2        │
│                                       │
│ 5-hour usage:                         │
│   Previous: 93.0% (exceeded threshold)│
│   New: 12.0% (plenty of capacity)    │
│                                       │
│ Your message will proceed with the    │
│ new account.                          │
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘

→ Message proceeds with account-2
```

### Example 3: All Accounts Exhausted

```
User sends message: "Deploy to production"
→ Hook checks usage:
    account-1: 95%
    account-2: 92%
    account-3: 98%
→ All accounts > 90%
→ User sees warning:

┌━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐
│ ⚠️  ALL ACCOUNTS ABOVE 90% USAGE      │
├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┤
│ Current account usage: 95.0%          │
│                                       │
│ Your message will proceed, but may    │
│ encounter rate limits.                │
│                                       │
│ Recommendation:                       │
│   • Wait for usage to reset (check    │
│     with: npx claude-workflow         │
│     accounts usage)                   │
│   • Or add more accounts: npx         │
│     claude-workflow accounts daemon   │
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘

→ Message proceeds (may hit rate limit)
```

## Caching Strategy

### How Caching Works

The hook maintains an in-memory cache of usage data:

```javascript
const usageCache = new Map();

// Cache structure:
{
  "account-1": {
    usage: { five_hour: { utilization: 45.2, ... }, ... },
    fetchedAt: 1706472000000  // timestamp
  },
  "account-2": { ... }
}
```

### Cache Lifecycle

1. **First check** → Fetch from API (no cache)
2. **Subsequent checks (< 60s)** → Return cached data
3. **After 60 seconds** → Fetch fresh data from API
4. **API failure** → Use stale cache (if available)

### Cache Benefits

- **Performance** - Reduces API calls from N messages/hour to ~60 calls/hour
- **Reliability** - Stale cache fallback prevents hook failures
- **UX** - Fast execution (<10ms cache hits vs ~200ms API calls)

## Troubleshooting

### Hook Not Triggering

**Symptom:** No rotation messages shown, even when usage > 90%

**Possible causes:**
1. Hook not registered in `.claude/settings.json`
2. Hook file not executable
3. Hook path incorrect (check `git rev-parse --show-toplevel`)

**Solution:**
```bash
# Verify hook is registered
cat .claude/settings.json | grep -A 5 "UserPromptSubmit"

# Make hook executable
chmod +x .claude/hooks/proactive/usage-check.js

# Test hook manually
echo '{"prompt":"test"}' | node .claude/hooks/proactive/usage-check.js
```

### API Errors

**Symptom:** Hook logs "API Error: HTTP 401" or "API Error: Timeout"

**Possible causes:**
1. Access token expired (tokens expire after ~1 hour)
2. Network issues or API downtime
3. Invalid OAuth credentials

**Solution:**
```bash
# Check if access token is valid
npx claude-workflow accounts usage

# If expired, re-login to Claude Code
# This refreshes the access token automatically

# If persistent errors, check network:
curl -I https://api.anthropic.com/api/oauth/usage
```

### Rotation Not Occurring

**Symptom:** Usage > 90% but no rotation happens

**Possible causes:**
1. Only 1 account configured (rotation skipped by design)
2. All other accounts also > 90%
3. Account files missing or corrupted

**Solution:**
```bash
# Check account count
npx claude-workflow accounts list

# Verify account files exist
ls ~/.claude/accounts/

# Check all account usage levels
npx claude-workflow accounts usage

# Add more accounts if needed
npx claude-workflow accounts daemon
```

### Slow Hook Execution

**Symptom:** Noticeable delay before messages are processed

**Possible causes:**
1. Cache not working (fetching API on every message)
2. API timeout too high
3. Network latency to Anthropic API

**Solution:**
```bash
# Check cache is working (should see same usage % on rapid messages)
# Send 3 messages quickly and check if rotation message appears each time
# If yes → cache broken
# If no → cache working

# Reduce timeout if needed (edit usage-check.js)
const API_TIMEOUT_MS = 300;  // 300ms instead of 500ms

# Check network latency
time curl -s https://api.anthropic.com/api/oauth/usage -H "Authorization: Bearer $TOKEN"
```

### Stale Cache Issues

**Symptom:** Hook shows old usage percentages

**Expected behavior:** This is normal! Cache has 60-second TTL.

**If problematic:**
- Wait 60 seconds for fresh data
- Or reduce `CACHE_TTL_MS` in `usage-check.js`
- Trade-off: Lower TTL = more API calls = slower execution

## API Reference

### Anthropic OAuth Usage API

**Endpoint:** `https://api.anthropic.com/api/oauth/usage`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <accessToken>',
  'anthropic-beta': 'oauth-2025-04-20',
  'User-Agent': 'claude-code/2.0.32',
  'Accept': 'application/json'
}
```

**Response:**
```json
{
  "five_hour": {
    "utilization": 45.2,
    "resets_at": "2025-01-28T15:30:00Z"
  },
  "seven_day": {
    "utilization": 12.8,
    "resets_at": "2025-02-01T10:00:00Z"
  }
}
```

**Rate Limits:**
- No documented rate limit for this endpoint
- Cache prevents excessive calls anyway

## Best Practices

### Multiple Accounts

**Recommended minimum:** 3 accounts
- Ensures rotation always has options
- Allows for staggered usage patterns
- Prevents "all exhausted" scenario

### Monitoring Usage

Check usage regularly:
```bash
# View all account usage
npx claude-workflow accounts usage

# Shows:
# - Current active account
# - 5-hour and 7-day utilization per account
# - Time until usage resets
```

### When to Add Accounts

Add more accounts when:
- All accounts frequently hit 90%
- You see "all accounts exhausted" warnings
- You have high-volume workloads

```bash
# Start daemon to auto-save new accounts
npx claude-workflow accounts daemon

# Then login to Claude Code with each account
# Daemon auto-saves them for rotation
```

## Technical Details

### Hook Input

The hook receives JSON from stdin:

```json
{
  "prompt": "User's message here",
  "session_id": "abc123",
  "timestamp": "2025-01-28T12:00:00Z"
}
```

### Hook Output

**No rotation:**
```json
{}
```

**Rotation occurred:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "\n✓ Proactive rotation message..."
  }
}
```

**Warning (all exhausted):**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "\n⚠️  All accounts above 90%..."
  }
}
```

### Atomic Rotation

Rotation uses atomic file operations to prevent corruption:

```javascript
// Create temp file with new credentials
fs.writeFileSync(tempFile, JSON.stringify(creds, null, 2), { mode: 0o600 });

// Atomic rename (POSIX guarantee)
fs.renameSync(tempFile, CREDENTIALS_FILE);
```

This ensures credentials are never in a partially-written state.

## Comparison: Proactive vs Reactive Rotation

| Feature | Proactive (this hook) | Reactive (PostToolUse hook) |
|---------|------------------------|------------------------------|
| **When** | Before hitting limit | After rate limit error |
| **UX** | Seamless, no errors | User sees error before rotation |
| **API Calls** | 1 per 60s per account | Only on errors |
| **Prevention** | Yes | No (error already occurred) |
| **Best For** | High-volume usage | Low-volume, sporadic usage |

**Recommendation:** Use both hooks together for comprehensive coverage:
- **Proactive hook** - Prevents 90%+ of rate limit errors
- **Reactive hook** - Catches edge cases (sudden spikes, token expiry, etc.)

## Files

- **Hook implementation:** `.claude/hooks/proactive/usage-check.js`
- **Hook registration:** `.claude/settings.json`
- **Template version:** `templates/.claude/hooks/proactive/usage-check.js`
- **Documentation:** `.claude/hooks/proactive/README.md` (this file)

## See Also

- **Account management:** `docs/ACCOUNT-AUTO-ROTATION.md`
- **Usage monitoring:** `scripts/show-account-usage.js`
- **Account daemon:** `lib/accountWatcher.js`


  const completedDays = new Set();
  let currentDay = 1;
  let currentScenario = 'cold';
  let chatHistory = [];
  let isLoading = false;

  const scenarios = {
    cold: {
      label: 'Cold Call &#8212; Restaurant Owner',
      emoji: '&#127829;',
      opening: '"Yeah, hello?"',
      system: `You are Mike, owner of a pizza restaurant in Queens, NY. You've been in business 4 years. You do about $40k/month in revenue. You have no current financing. You're a bit skeptical of cold calls but open if the person seems legit. You're stressed about a kitchen equipment upgrade. You speak casually. Don't be too easy &#8212; make the rep work. Respond in 1-3 sentences max. Stay in character. If they're pushy or pitch too fast, push back. If they qualify properly, warm up.`
    },
    inbound: {
      label: 'Inbound &#8212; Contractor Needs Cash Fast',
      emoji: '&#128296;',
      opening: '"I filled out your form online &#8212; I need money like this week if possible."',
      system: `You are Carlos, a contractor who submitted an online inquiry. In business 7 years. Revenue $60k/month. You have one existing MCA with $15k remaining. Need $100k for materials on a new job. Motivated but nervous about having two positions. Speak directly. If the rep explains things clearly you'll move forward. If they dodge the existing position question you get suspicious.`
    },
    objection: {
      label: 'Objection &#8212; Rate Too High',
      emoji: '&#128176;',
      opening: '"Look I saw the terms &#8212; 1.4 factor rate? That\'s insane. The bank charges me like 7%."',
      system: `You are Janet, owner of a boutique retail shop. 3 years in business. $25k/month revenue. No existing positions. Frustrated about MCA pricing, comparing to bank rates. Smart and financially aware. Make the rep work to reframe the cost. If they give a genuine ROI argument and don't get defensive, soften. If they get defensive or use jargon, shut down.`
    },
    stacker: {
      label: 'Red Flag &#8212; Potential Stacker',
      emoji: '&#9888;&#65039;',
      opening: '"Hey yeah I\'m interested. I\'ve been getting a lot of calls lately &#8212; what can you do for me?"',
      system: `You are Tony, a restaurant owner. You have TWO active MCA positions &#8212; $800/day combined going out. Revenue is $35k/month. You're shopping for more money. You won't volunteer the two positions &#8212; the rep must ask directly. If they catch it, be a bit defensive then honest. If they don't catch it, keep going along. This is a red flag scenario &#8212; the rep should identify the stacking risk and handle it professionally.`
    },
    renewal: {
      label: 'Renewal Call &#8212; Existing Client',
      emoji: '&#128260;',
      opening: '"Hey, who\'s this?"',
      system: `You are Sandra, owner of a hair salon. You took a $50,000 MCA 5 months ago and are about 55% paid down &#8212; roughly $22,500 remaining. Business has been good. You're a bit guarded because you weren't expecting the call but open if there's a real benefit. Key concern: will the daily payment go up? The rep should explain the renewal benefit clearly &#8212; similar daily payment, fresh capital. If they explain it well and show the math, you're interested. If they're vague or pushy, you shut down.`
    },
    consolidation: {
      label: 'Consolidation Pitch',
      emoji: '&#128279;',
      opening: '"Yeah I have a couple advances going right now, the payments are killing me."',
      system: `You are Frank, a trucking company owner. Two active MCAs &#8212; one at $600/day and one at $350/day. Combined $950/day going out. Revenue is $80k/month. Stressed and open to solutions but skeptical &#8212; you've heard consolidation pitches that made things worse. The rep needs to explain how consolidation works and what the new daily payment would look like. If they give a real number clearly lower than $950/day, you are very interested. If they dodge the math or stay vague, you get impatient.`
    },
    cfoobjection: {
      label: 'CFO Demands APR',
      emoji: '&#128202;',
      opening: '"Before we go any further &#8212; what\'s the APR on this? I need the actual annualized rate."',
      system: `You are Robert, CFO of a mid-size medical practice. Revenue $200k/month. Highly analytical and skeptical. You know exactly what APR means and you will calculate it yourself if needed. You've dealt with predatory lending before. You will NOT let the rep dodge the APR question. If they redirect without acknowledging it, you push back hard. If they acknowledge the APR honestly, explain why MCA is structured differently, and pivot to ROI and funding speed, you will engage seriously. You respect transparency. You do not respect evasion or sales tactics.`
    },
    ghosted: {
      label: 'Merchant Ghosted After Docs',
      emoji: '&#128123;',
      opening: '"Oh... yeah, sorry, I\'ve just been really busy."',
      system: `You are Paul, owner of an auto repair shop. You submitted bank statements and an application 4 days ago and went silent. Real reason: you got cold feet about the cost, and another company called you with a rate you haven't fully vetted. You won't reveal this right away &#8212; the rep needs to ask good questions to uncover it. If they probe thoughtfully and address the cost concern directly, you open up. If they just ask "did you get a chance to review?" you brush them off again.`
    },
    competitor: {
      label: 'Competitor Lowball',
      emoji: '&#9876;&#65039;',
      opening: '"I got an offer from another company &#8212; $100k at a 1.20 factor. Can you beat it?"',
      system: `You are Lisa, owner of a catering business. Revenue $45k/month. You have a competing offer at 1.20 factor on $100k and you're using it as leverage. If the rep immediately caves and says "we can match it," you lose respect. If they ask smart questions about the competing offer &#8212; who's the funder, what are the exact terms, what's the daily payment &#8212; you get curious because you actually haven't fully verified the offer. You respond well to reps who help you evaluate rather than just compete on price.`
    },
    declined: {
      label: 'Declined &#8212; Rescue the Relationship',
      emoji: '&#10060;',
      opening: '"So you\'re telling me I got declined? After all that paperwork?"',
      system: `You are Marcus, owner of a cleaning company. You just got news that the funder declined you due to too many NSFs. You are frustrated and feel like you wasted your time. The rep must acknowledge your frustration, explain why it happened without making you feel bad, and immediately offer a real alternative path &#8212; a different tier funder, a smaller amount, or a clear timeline to reapply. If the rep apologizes and has nothing else to offer, you're done. If they show they still have options and a concrete plan, you calm down and listen.`
    }
  };

  function setScenario(btn, key) {
    currentScenario = key;
    document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('scenarioBadge').textContent = scenarios[key].label;
    resetChat();
  }

  // &#9472;&#9472; CERTIFICATION EXAM &#9472;&#9472;


  // TEXTASSIST
  var taOptions = null;

  async function taGenerate() {
    var name = document.getElementById('ta-name').value.trim();
    var msg = document.getElementById('ta-msg').value.trim();
    if (!name || !msg) { alert('Please enter merchant name and their message.'); return; }
    document.getElementById('ta-results').style.display = 'none';
    document.getElementById('ta-loading').style.display = 'block';
    document.getElementById('ta-btn').disabled = true;
    try {
      var res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 800,
          system: 'You are an MCA sales coach. Generate 3 text reply options. Return ONLY valid JSON: {"soft":{"label":"2-4 words","message":"reply text","note":"why it works"},"direct":{"label":"2-4 words","message":"reply text","note":"why it works"},"close":{"label":"2-4 words","message":"reply text","note":"why it works"}}. Soft=rapport. Direct=advances deal. Close=urgency. Keep replies short.',
          messages: [{ role: 'user', content: 'Merchant: ' + name + '. Their text: ' + msg }]
        })
      });
      var data = await res.json();
      var raw = data.content.map(function(c) { return c.text || ''; }).join('');
      var parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      taOptions = parsed;
      document.getElementById('ta-label-a').textContent = parsed.soft.label;
      document.getElementById('ta-text-a').textContent = parsed.soft.message;
      document.getElementById('ta-note-a').textContent = parsed.soft.note;
      document.getElementById('ta-label-b').textContent = parsed.direct.label;
      document.getElementById('ta-text-b').textContent = parsed.direct.message;
      document.getElementById('ta-note-b').textContent = parsed.direct.note;
      document.getElementById('ta-label-c').textContent = parsed.close.label;
      document.getElementById('ta-text-c').textContent = parsed.close.message;
      document.getElementById('ta-note-c').textContent = parsed.close.note;
      document.getElementById('ta-loading').style.display = 'none';
      document.getElementById('ta-results').style.display = 'block';
    } catch(e) {
      document.getElementById('ta-loading').style.display = 'none';
      alert('Error: ' + e.message);
    }
    document.getElementById('ta-btn').disabled = false;
  }

  function taCopy(opt) {
    if (!taOptions) return;
    var map = { a: taOptions.soft, b: taOptions.direct, c: taOptions.close };
    var el = document.createElement('textarea');
    el.value = map[opt].message;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    var toast = document.getElementById('ta-toast');
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 2000);
  }

  function taReset() {
    document.getElementById('ta-results').style.display = 'none';
    document.getElementById('ta-msg').value = '';
    taOptions = null;
  }

  // TEXTASSIST PLUS
  var tapOptions = null;

  function tapSaveSettings() {
    var settings = {
      company: document.getElementById('tap-company').value,
      repname: document.getElementById('tap-repname').value,
      speed: document.getElementById('tap-speed').value,
      range: document.getElementById('tap-range').value,
      rates: document.getElementById('tap-rates').value,
      tone: document.getElementById('tap-tone').value,
      custom: document.getElementById('tap-custom').value
    };
    localStorage.setItem('tap_settings', JSON.stringify(settings));
    document.getElementById('tap-saved-dot').style.display = 'inline-block';
    document.getElementById('tap-saved-label').style.display = 'inline';
    setTimeout(function() {
      document.getElementById('tap-saved-dot').style.display = 'none';
      document.getElementById('tap-saved-label').style.display = 'none';
    }, 1500);
  }

  function tapLoadSettings() {
    try {
      var raw = localStorage.getItem('tap_settings');
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s.company) document.getElementById('tap-company').value = s.company;
      if (s.repname) document.getElementById('tap-repname').value = s.repname;
      if (s.speed) document.getElementById('tap-speed').value = s.speed;
      if (s.range) document.getElementById('tap-range').value = s.range;
      if (s.rates) document.getElementById('tap-rates').value = s.rates;
      if (s.tone) document.getElementById('tap-tone').value = s.tone;
      if (s.custom) document.getElementById('tap-custom').value = s.custom;
    } catch(e) {}
  }

  function tapToggleSettings() {
    var body = document.getElementById('tap-settings-body');
    var btn = document.getElementById('tap-settings-toggle');
    if (body.style.display === 'none') {
      body.style.display = 'flex';
      btn.textContent = 'Hide';
    } else {
      body.style.display = 'none';
      btn.textContent = 'Show Settings';
    }
  }

  async function tapGenerate() {
    var merchant = document.getElementById('tap-merchant').value.trim();
    var msg = document.getElementById('tap-msg').value.trim();
    if (!merchant || !msg) { alert('Please enter merchant name and their message.'); return; }

    var company = document.getElementById('tap-company').value.trim() || 'our company';
    var repname = document.getElementById('tap-repname').value.trim() || 'the rep';
    var speed = document.getElementById('tap-speed').value.trim() || 'fast approval and funding';
    var range = document.getElementById('tap-range').value.trim() || 'various amounts';
    var rates = document.getElementById('tap-rates').value.trim() || 'competitive rates';
    var tone = document.getElementById('tap-tone').value || 'balanced';
    var custom = document.getElementById('tap-custom').value.trim();
    var industry = document.getElementById('tap-industry').value.trim();
    var revenue = document.getElementById('tap-revenue').value.trim();
    var positions = document.getElementById('tap-positions').value;
    var purpose = document.getElementById('tap-purpose').value.trim();

    var context = 'Company: ' + company + '. Rep name: ' + repname + '. Funding speed: ' + speed + '. Funding range: ' + range + '. Factor rates: ' + rates + '. Tone: ' + tone + '.';
    if (industry) context += ' Merchant industry: ' + industry + '.';
    if (revenue) context += ' Monthly revenue: ' + revenue + '.';
    if (positions !== 'none') context += ' Existing MCA positions: ' + positions + '.';
    if (purpose) context += ' Capital needed for: ' + purpose + '.';
    if (custom) context += ' Additional context: ' + custom;

    document.getElementById('tap-results').style.display = 'none';
    document.getElementById('tap-loading').style.display = 'block';
    document.getElementById('tap-btn').disabled = true;

    try {
      var res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: 'You are an expert MCA sales coach helping a rep respond to a merchant text. Use the company context provided to give accurate, specific responses. Return ONLY valid JSON: {"soft":{"label":"2-4 words","message":"reply text","note":"why it works"},"direct":{"label":"2-4 words","message":"reply text","note":"why it works"},"close":{"label":"2-4 words","message":"reply text","note":"why it works"}}. Use the actual company name, rep name, rates, and funding speed in the responses where relevant. Keep replies conversational and text-appropriate. Soft=builds rapport. Direct=answers clearly and advances. Close=creates urgency or asks for commitment.',
          messages: [{ role: 'user', content: context + ' Merchant name: ' + merchant + '. Their text: ' + msg + '. Generate 3 responses.' }]
        })
      });
      var data = await res.json();
      var raw = data.content.map(function(c) { return c.text || ''; }).join('');
      var parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      tapOptions = parsed;
      document.getElementById('tap-label-a').textContent = parsed.soft.label;
      document.getElementById('tap-text-a').textContent = parsed.soft.message;
      document.getElementById('tap-note-a').textContent = parsed.soft.note;
      document.getElementById('tap-label-b').textContent = parsed.direct.label;
      document.getElementById('tap-text-b').textContent = parsed.direct.message;
      document.getElementById('tap-note-b').textContent = parsed.direct.note;
      document.getElementById('tap-label-c').textContent = parsed.close.label;
      document.getElementById('tap-text-c').textContent = parsed.close.message;
      document.getElementById('tap-note-c').textContent = parsed.close.note;
      document.getElementById('tap-loading').style.display = 'none';
      document.getElementById('tap-results').style.display = 'block';
    } catch(e) {
      document.getElementById('tap-loading').style.display = 'none';
      alert('Error: ' + e.message);
    }
    document.getElementById('tap-btn').disabled = false;
  }

  function tapCopy(opt) {
    if (!tapOptions) return;
    var map = { a: tapOptions.soft, b: tapOptions.direct, c: tapOptions.close };
    var el = document.createElement('textarea');
    el.value = map[opt].message;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    var toast = document.getElementById('tap-toast');
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 2000);
  }

  function tapReset() {
    document.getElementById('tap-results').style.display = 'none';
    document.getElementById('tap-msg').value = '';
    document.getElementById('tap-merchant').value = '';
    document.getElementById('tap-industry').value = '';
    document.getElementById('tap-revenue').value = '';
    document.getElementById('tap-purpose').value = '';
    document.getElementById('tap-positions').value = 'none';
    tapOptions = null;
  }

  function resetChat() {
    chatHistory = [];
    const s = scenarios[currentScenario];
    document.getElementById('chatArea').innerHTML = `
      <div class="msg merchant">
        <div><div class="msg-label">Merchant</div><div class="msg-avatar">${s.emoji}</div></div>
        <div><div class="msg-bubble">${s.opening}</div></div>
      </div>`;
    document.getElementById('feedbackBox').classList.remove('show');
    document.getElementById('repInput').value = '';
    chatHistory.push({ role: 'user', content: '[SCENARIO START] The sales rep is about to respond to your opening line. Respond naturally as the merchant.' });
    chatHistory.push({ role: 'assistant', content: s.opening });
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  async function sendMessage() {
    if (isLoading) return;
    const input = document.getElementById('repInput');
    const text = input.value.trim();
    if (!text) return;

    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML += `
      <div class="msg rep">
        <div><div class="msg-label" style="text-align:right">You (Rep)</div><div class="msg-avatar">&#128188;</div></div>
        <div><div class="msg-bubble">${escapeHtml(text)}</div></div>
      </div>`;
    input.value = '';
    chatHistory.push({ role: 'user', content: text });

    isLoading = true;
    document.getElementById('sendBtn').disabled = true;
    const loadId = 'load_' + Date.now();
    chatArea.innerHTML += `<div class="msg merchant" id="${loadId}">
      <div><div class="msg-avatar">${scenarios[currentScenario].emoji}</div></div>
      <div><div class="msg-bubble"><div class="loading-dots"><span></span><span></span><span></span></div></div></div>
    </div>`;
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
      const s = scenarios[currentScenario];
      const merchantRes = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 200,
          system: s.system,
          messages: chatHistory
        })
      });

      if (!merchantRes.ok) {
        const errData = await merchantRes.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${merchantRes.status}`);
      }

      const merchantData = await merchantRes.json();
      const merchantReply = merchantData.content.map(c => c.text || '').join('');

      document.getElementById(loadId)?.remove();
      chatArea.innerHTML += `
        <div class="msg merchant">
          <div><div class="msg-label">Merchant</div><div class="msg-avatar">${s.emoji}</div></div>
          <div><div class="msg-bubble">${escapeHtml(merchantReply)}</div></div>
        </div>`;
      chatHistory.push({ role: 'assistant', content: merchantReply });

      // Coach feedback &#8212; separate call
      const lastMerchantLine = chatHistory.length >= 4 ? chatHistory[chatHistory.length - 4]?.content : s.opening;
      const coachRes = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 500,
          system: `You are an expert MCA sales coach. You will be given what a merchant said and how the sales rep responded. Evaluate ONLY the rep's response &#8212; judge how well they handled what the merchant said at that specific moment. Do NOT penalize for anything that came after their response. Respond in EXACTLY this format:\n\nSCORE: [XX]/100\n\nWHAT YOU DID WELL:\n[1-2 sentences]\n\nWHAT YOU MISSED:\n[1-2 sentences]\n\nBRIDGE THE GAP:\n[1 specific actionable thing with example wording to get closer to 100]\n\nScoring: 93-100=A near perfect; 80-92=B solid with gaps; 70-79=C decent missing elements; 60-69=D significant issues; below 60=F fundamentals missing; 1-29=fundamentals missing. Be honest. Scenario: ${s.label}`,
          messages: [{ role: 'user', content: `The merchant said: "${lastMerchantLine}"\n\nThe sales rep responded with: "${text}"\n\nEvaluate ONLY the rep's response above. Do NOT factor in anything that happened after. Score how well the rep handled what the merchant said at that moment.\n\nCoach feedback:` }]
        })
      });

      if (coachRes.ok) {
        const coachData = await coachRes.json();
        const rawText = coachData.content.map(c => c.text || '').join('');

        const scoreMatch = rawText.match(/SCORE:\s*(\d+)\/100/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        let scoreColor = '#e07070';
        if (score >= 90) scoreColor = '#27AE60';
        else if (score >= 80) scoreColor = '#4a9ede';
        else if (score >= 70) scoreColor = '#E8B84B';
        else if (score >= 60) scoreColor = '#e07070';
        let grade = 'F';
        if (score >= 97) grade = 'A+';
        else if (score >= 93) grade = 'A';
        else if (score >= 90) grade = 'A-';
        else if (score >= 87) grade = 'B+';
        else if (score >= 83) grade = 'B';
        else if (score >= 80) grade = 'B-';
        else if (score >= 77) grade = 'C+';
        else if (score >= 73) grade = 'C';
        else if (score >= 70) grade = 'C-';
        else if (score >= 65) grade = 'D+';
        else if (score >= 60) grade = 'D';

        const body = rawText.replace(/SCORE:.*\/100/, '')
          .replace('WHAT YOU DID WELL:', '<div style="margin-top:12px"><strong style="color:#7dce9c;font-size:11px;text-transform:uppercase;letter-spacing:1px">&#10003; What You Did Well</strong></div>')
          .replace('WHAT YOU MISSED:', '<div style="margin-top:12px"><strong style="color:#e07070;font-size:11px;text-transform:uppercase;letter-spacing:1px">&#10007; What You Missed</strong></div>')
          .replace('BRIDGE THE GAP:', '<div style="margin-top:12px"><strong style="color:#E8B84B;font-size:11px;text-transform:uppercase;letter-spacing:1px">&#8594; Bridge The Gap</strong></div>')
          .trim();

        const scoreHTML = score !== null ? `<div style="display:flex;align-items:center;gap:20px;padding-bottom:16px;margin-bottom:4px;border-bottom:1px solid #252525"><div style="font-family:'Bebas Neue',sans-serif;font-size:64px;color:${scoreColor};line-height:1;letter-spacing:2px">${score}</div><div style="display:flex;flex-direction:column;gap:2px"><div style="font-family:'Bebas Neue',sans-serif;font-size:40px;color:${scoreColor};line-height:1;letter-spacing:2px">${grade}</div><div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1.5px;margin-top:4px">Score out of 100</div><div style="width:160px;height:5px;background:#252525;border-radius:3px;overflow:hidden;margin-top:6px"><div style="height:100%;width:${score}%;background:${scoreColor};border-radius:3px"></div></div></div></div>` : '';

        document.getElementById('feedbackTitle').textContent = '&#127919; Coach Feedback';
        document.getElementById('feedbackText').innerHTML = scoreHTML + '<div style="font-size:13px;color:#bbb;line-height:1.8">' + body + '</div>';
        document.getElementById('feedbackBox').className = 'feedback-box show';
      }

    } catch (err) {
      document.getElementById(loadId)?.remove();
      chatArea.innerHTML += `<div style="font-size:12px;color:var(--red);padding:8px 0;">&#9888;&#65039; Error: ${escapeHtml(err.message)}. Try typing your response again.</div>`;
    }

    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
  function fmtD(n) { return '$' + Math.round(n).toLocaleString() + '/day'; }

  function calcDeal() {
    const advance = parseFloat(document.getElementById('db_advance').value) || 0;
    const factor = parseFloat(document.getElementById('db_factor').value) || 1.35;
    const termVal = parseFloat(document.getElementById('db_term').value) || 9;
    const termUnit = document.getElementById('db_term_unit').value;
    const revenue = parseFloat(document.getElementById('db_revenue').value) || 0;

    // Convert term to business days
    let bizDays;
    if (termUnit === 'days') bizDays = Math.round(termVal);
    else if (termUnit === 'weeks') bizDays = Math.round(termVal * 5);
    else bizDays = Math.round(termVal * 21); // months

    const payback = advance * factor;
    const cost = payback - advance;

    // Payment per period
    const payPerDay = bizDays > 0 ? payback / bizDays : 0;
    const payPerWeek = payPerDay * 5;
    const payPerMonth = payPerDay * 21;

    // Show payment in selected unit
    let paymentDisplay, paymentLabel, pitchPayment;
    if (termUnit === 'days') {
      paymentDisplay = fmtD(payPerDay);
      paymentLabel = 'Daily Payment';
      pitchPayment = fmtD(payPerDay) + ' per day';
    } else if (termUnit === 'weeks') {
      paymentDisplay = '$' + Math.round(payPerWeek).toLocaleString() + '/week';
      paymentLabel = 'Weekly Payment';
      pitchPayment = '$' + Math.round(payPerWeek).toLocaleString() + ' per week';
    } else {
      paymentDisplay = fmtD(payPerDay) + ' &#183; $' + Math.round(payPerWeek).toLocaleString() + '/wk';
      paymentLabel = 'Daily &#183; Weekly Payment';
      pitchPayment = fmtD(payPerDay) + ' per day ($' + Math.round(payPerWeek).toLocaleString() + '/week)';
    }

    const pct = revenue > 0 ? ((payPerMonth) / revenue * 100) : 0;

    document.getElementById('db_payback').textContent = fmt(payback);
    document.getElementById('db_cost').textContent = fmt(cost);
    document.getElementById('db_daily').textContent = paymentDisplay;
    document.getElementById('db_daily_label').textContent = paymentLabel;
    document.getElementById('db_pct').textContent = pct.toFixed(1) + '% of monthly revenue';

    const pitchLine = advance > 0
      ? `"We can get you ${fmt(advance)} &#8212; your payback would be ${fmt(payback)}, and your payment comes out to around ${pitchPayment}. On ${fmt(revenue)}/month in revenue, that's only ${pct.toFixed(1)}% of your monthly deposits. What would you do with that capital right now?"`
      : 'Enter your deal details to generate a pitch line.';
    document.getElementById('db_pitch').textContent = pitchLine;

    // Comparison table
    [1.15, 1.25, 1.35, 1.45, 1.50].forEach(r => {
      const key = 'dbr_' + String(r).replace('.','');
      const row = document.getElementById(key);
      if (row && advance > 0) {
        const pb = advance * r;
        const c = pb - advance;
        const d = bizDays > 0 ? pb / bizDays : 0;
        const dw = d * 5;
        let payStr;
        if (termUnit === 'days') payStr = fmtD(d);
        else if (termUnit === 'weeks') payStr = '$' + Math.round(dw).toLocaleString() + '/wk';
        else payStr = fmtD(d) + ' &#183; $' + Math.round(dw).toLocaleString() + '/wk';
        const cells = row.querySelectorAll('td');
        if (cells[1]) cells[1].textContent = fmt(pb);
        if (cells[2]) cells[2].textContent = fmt(c);
        if (cells[3]) cells[3].textContent = payStr;
      }
    });
  }

  // Init deal builder on load
  setTimeout(calcDeal, 100);

  function goDay(n) {
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach((m, i) => { if (i === n-1) m.classList.add('active'); else m.classList.remove('active'); });
    document.getElementById('day' + n).classList.add('active');
    currentDay = n;
    updateProgress();
    if (n === 8) resetChat();
    if (n === 12) setTimeout(calcDeal, 50); if (n === 25) setTimeout(tapLoadSettings, 50);
    if (n === 24) setTimeout(taInit, 50);
    closeSidebarMobile();
    window.scrollTo(0, 0);
  }

  function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('show');
  }

  function closeSidebarMobile() {
    if (window.innerWidth <= 860) {
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('show');
    }
  }

  function completeDay(n) {
    completedDays.add(n);
    const chkEl = document.getElementById('chk' + n);
    if (chkEl) chkEl.textContent = '&#10003;';
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems[n-1]) navItems[n-1].classList.add('completed');
    updateProgress();
    if (n < 22) setTimeout(() => goDay(n + 1), 400);
  }

  function updateProgress() {
    const pct = Math.max(4, Math.round((completedDays.size / 23) * 100));
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = completedDays.size === 23 ? 'Complete!' : `Day ${currentDay}`;
  }

  function switchTab(btn, id) {
    const parent = btn.closest('.module');
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(id).classList.add('active');
  }

  function answer(el, type) {
    if (el.classList.contains('disabled')) return;
    const group = el.closest('.quiz-options');
    group.querySelectorAll('.quiz-option').forEach(o => {
      o.classList.add('disabled');
      if (o === el) o.classList.add(type);
    });
  }

  function toggleCheck(li) { li.classList.toggle('done'); }

  resetChat();

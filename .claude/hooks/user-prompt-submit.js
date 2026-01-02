const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'skill-rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  const suggestions = [];

  for (const [skillName, rule] of Object.entries(rules.skills)) {
    const keywordMatch = rule.keywords?.some(kw =>
      prompt.toLowerCase().includes(kw.toLowerCase())
    );
    const fileMatch = rule.filePatterns?.some(pattern =>
      prompt.includes(pattern)
    );

    if (keywordMatch || fileMatch) {
      suggestions.push({ skill: skillName, reason: rule.description });
    }
  }

  if (suggestions.length > 0) {
    console.log('\n💡 Suggested skills:');
    suggestions.forEach(s => console.log(`   → /${s.skill}: ${s.reason}`));
    console.log('');
  }
});

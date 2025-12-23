// src/core/passwordStrength.js
// No external libs required.

function estimateEntropy(password) {
  // Estimate entropy by charset sizes and length (simple heuristic).
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32; // rough for symbols
  if (pool === 0) return 0;
  const entropy = Math.log2(pool) * password.length;
  return Math.round(entropy);
}

function hasSequentialOrRepeated(password) {
  // detect simple sequences or repeated chars
  const lowered = password.toLowerCase();
  const seqs = ["0123456789","abcdefghijklmnopqrstuvwxyz"];
  for (const s of seqs) {
    for (let i=0;i+4<=s.length;i++){
      const sub = s.slice(i,i+4);
      if (lowered.includes(sub)) return true;
    }
  }
  // repeated char run of length >=4
  if (/(.)\1\1\1/.test(password)) return true;
  return false;
}

function classifyStrength(entropy) {
  if (entropy < 28) return { label: "Very Weak", score: 0 };
  if (entropy < 36) return { label: "Weak", score: 1 };
  if (entropy < 50) return { label: "Fair", score: 2 };
  if (entropy < 65) return { label: "Strong", score: 3 };
  return { label: "Very Strong", score: 4 };
}

/**
 * validatePassword(password, confirmPassword)
 * returns { valid: boolean, message: string, entropy: number, strength: {label,score} }
 */
function validatePassword(password, confirmPassword) {
  if (typeof password !== "string") {
    return { valid: false, message: "Password must be a string." };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }

  if (password.length < 10) {
    return { valid: false, message: "Password must be at least 10 characters long." };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must include at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Password must include at least one special character." };
  }

  if (hasSequentialOrRepeated(password)) {
    return { valid: false, message: "Password contains sequences or repeated characters; choose a stronger password." };
  }

  // basic dictionary-ban (common words)
  const common = ["password","123456","qwerty","letmein","admin","welcome","iloveyou"];
  for (const w of common) {
    if (password.toLowerCase().includes(w)) {
      return { valid: false, message: "Password contains a common word or pattern; choose a less guessable password." };
    }
  }

  const entropy = estimateEntropy(password);
  const strength = classifyStrength(entropy);
  if (entropy < 50) {
    return { valid: false, message: `Password entropy too low (${entropy} bits). Try a longer/more complex password.`, entropy, strength };
  }

  return { valid: true, message: "Password acceptable.", entropy, strength };
}

module.exports = { validatePassword, estimateEntropy, classifyStrength };

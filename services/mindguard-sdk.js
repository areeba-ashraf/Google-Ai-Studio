
/**
 * MindGuard Mental Health Detection SDK v1.0
 * For integration into iPhone, Android, and Web projects.
 */
class MindGuardSDK {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
  }

  /**
   * Analyzes text for mental health markers
   * @param {string} text - The user input to analyze
   * @returns {Promise<Object>} - Parsed insights
   */
  async analyze(text) {
    if (!this.apiKey) throw new Error("MindGuard SDK: API Key is required.");

    const payload = {
      contents: [{ parts: [{ text: `Analyze mental health markers in: "${text}"` }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    try {
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      return { error: "Failed to parse analysis results." };
    }
  }
}

// Export for various environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MindGuardSDK;
} else {
  window.MindGuardSDK = MindGuardSDK;
}

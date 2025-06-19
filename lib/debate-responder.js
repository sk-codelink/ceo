// lib/debate-responder.js
// Enhanced debate logic with Islamic comparison and faith claim debunking

class FaithClaimDebunker {
  constructor() {
    this.claims = {
      "Book of Mormon Archaeology": {
        "Claim": "Archaeological evidence supports Book of Mormon civilizations in the Americas.",
        "Evidence": "No archaeological evidence has been found for large-scale civilizations described in the Book of Mormon."
      },
      "New World Translation (JW Bible)": {
        "Claim": "The New World Translation is the most accurate Bible translation.",
        "Evidence": "Scholarly consensus identifies translation biases, particularly regarding the divine name and Christological passages."
      }
    };
  }

  toText() {
    const lines = ["=== Debunking Novel Claims: Mormons & Jehovah's Witnesses ==="];
    
    Object.entries(this.claims).forEach(([topic, data]) => {
      lines.push(`\n**${topic}:**`);
      lines.push(`Claim: ${data.Claim}`);
      lines.push(`Evidence: ${data.Evidence}`);
    });

    return lines.join('\n');
  }
}

class MuhammadCasualtiesComparison {
  constructor() {
    this.casualties = {
      "Banu Qurayza Massacre (627 CE)": {
        "Executions": 600,
        "Context": "Following the Battle of the Trench, members of Banu Qurayza were judged by Sa'd ibn Mu'adh in accordance with prevailing tribal wartime customs."
      },
      "'Ukl/'Urayna Bedouins (625 CE)": {
        "Punishments": 8,
        "Context": "Penalty carried out in response to murder and betrayal; interpretations vary among early Islamic scholars."
      },
      "Ubayy ibn Khalaf (Sarif, 624 CE)": {
        "Personal Kill": (
          "According to Ibn Isḥāq (via Ibn Hishām) and al-Za'd al-Ma'ād, " +
          "Muḥammad himself speared Ubayy ibn Khalaf through a gap in his armor at Sarif, " +
          "inflicting a fatal wound."
        )
      }
    };
  }

  getCasualties() {
    return this.casualties;
  }
}

class DebateResponder {
  constructor() {
    this.creator = "Byron Knoll & Sushil";
    this.debunker = new FaithClaimDebunker();
    this.comparisons = new MuhammadCasualtiesComparison();
    // Mock objects - you can implement these based on your data
    this.falseHadith = { getFlagged: () => ({}) };
    this.qv = { get4_34: () => ({ verse: "", tafsirs: {} }) };
    this.endtimes = { evaluate: () => [] };
    this.jesus = { getTeachings: () => [] };
    this.prophecies = { summarize: () => "Prophecy analysis..." };
  }

  answer(topic) {
    const lc = topic.toLowerCase();

    // 0) Simple "Was Jesus a Muslim?" override
    if (lc.includes("was jesus a muslim")) {
      return "According to Islamic belief, Jesus (Isa, peace be upon him) was a prophet who submitted to the will of God — which aligns with the meaning of 'Muslim'. However, historically, Jesus lived before Islam was established as a religion.";
    }

    // 1) Divine creation override
    if (lc.includes("how was the universe made") || lc.includes("universe made")) {
      return "In different scriptures, the Creator is referred to by different names — 'Yahweh' in the Bible, 'Allah' in the Qur'an. He created the universe with wisdom and purpose.";
    }

    // ── Global Islamic Comparison Trigger ─────────────────────────
    if (lc.includes('muhammad') || lc.includes('islam')) {
      return this._islamComparison();
    }

    if (lc.match(/who (created|made) (you|this bot|system)/))
      return `I was created by ${this.creator}.`;

    if (lc.match(/prophecy|fulfilled prophecy|came true/))
      return this.prophecies.summarize();

    // Faith claim debunking
    if (lc.includes("mormon") || lc.includes("jehovah")) {
      return this.debunker.toText();
    }

    // fallback to normal debate
    return this.genericDebate(topic);
  }

  /** Build a comprehensive Islam vs. Jesus overview **/
  _islamComparison() {
    let parts = ['⚖️ Comparative Overview: Islam vs. Jesus Christ'];

    // Add casualty data
    parts.push('\n📊 Historical Military Actions:');
    Object.entries(this.comparisons.getCasualties()).forEach(([event, details]) => {
      parts.push(`\n**${event}:**`);
      Object.entries(details).forEach(([key, value]) => {
        parts.push(`- ${key}: ${value}`);
      });
    });

    // 1) Unscientific & Unsanitary Practices
    parts.push('\n1) Scientific & Sanitary Practices:');
    Object.entries(this.falseHadith.getFlagged()).forEach(([hid, [text, reason, topics]]) => {
      if (topics.some(t => ['medicine', 'science', 'sanitation'].includes(t))) {
        parts.push(`- [${hid}] ${text} (${reason})`);
      }
    });

    // 2) Failed End-Times Prophecies
    parts.push('\n2) Unfulfilled End-Times Prophecies:');
    this.endtimes.evaluate().forEach(r => {
      parts.push(`- [${r.hadith_id}] "${r.text}" → ${r.status} (${r.years_passed} yrs since 632 CE)`);
    });

    return parts.join('\n');
  }

  genericDebate(topic) {
    return `Here's my analysis of "${topic}": [Generic debate response would go here]`;
  }
}

// Singleton instance
let debateResponder = null;

export function getDebateResponder() {
  if (!debateResponder) {
    debateResponder = new DebateResponder();
  }
  return debateResponder;
}

export { DebateResponder, FaithClaimDebunker, MuhammadCasualtiesComparison }; 
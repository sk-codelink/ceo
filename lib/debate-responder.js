// lib/debate-responder.js
// Enhanced debate logic with Islamic comparison and faith claim debunking

class FaithClaimDebunker {
  constructor() {
    this.claims = {
      "Mormonism": {
        "Book of Mormon Archaeology": {
          "Claim": "The Book of Mormon describes ancient civilizations in the Americas.",
          "Evidence": "No independent archaeological evidence has been found to support the existence of Nephite or Lamanite civilizations."
        },
        "Golden Plates of Joseph Smith": {
          "Claim": "Joseph Smith translated the Book of Mormon from gold tablets shown to him by an angel.",
          "Evidence": "There is no physical evidence of the plates; Smith claimed to have returned them to the angel. The translation process relied on seer stones and has no external verification."
        },
        "Reformed Egyptian & Book of Abraham": {
          "Claim": "Joseph Smith translated Egyptian characters into scripture, including a language called Reformed Egyptian.",
          "Evidence": "No historical evidence exists for a language called 'Reformed Egyptian'. The papyri used for the Book of Abraham have been recovered and shown by Egyptologists to be standard funerary texts, not related to Abraham or Hebrew traditions."
        }
      },
      "Jehovah's Witnesses": {
        "New World Translation (JW Bible)": {
          "Claim": "Alters key verses to remove Trinity support.",
          "Evidence": "Manuscript evidence (e.g. Codex Sinaiticus, Vaticanus) supports traditional readings of John 1:1 and Colossians 1:15."
        }
      },
      "Islam": {
        "Quranic Inerrancy": {
          "Claim": "The Qur'an has remained perfectly preserved, word for word, since Muhammad's time.",
          "Evidence": "Early Islamic manuscripts (e.g., Sana'a palimpsest) show variant readings and orthographic differences, contradicting claims of absolute textual uniformity. However, it is also documented that Prophet Muhammad commanded his close companions to both write down and memorize the Quran as he dictated it to them, establishing a dual system of preservation through both written records and oral transmission that Muslims believe ensured accuracy."
        }
      },
      "Nation of Islam": {
        "Yakub Story": {
          "Claim": "All white people are a separate race created by the scientist Yakub 6,600 years ago.",
          "Evidence": "There is no genetic, archaeological or anthropological support for a recent, separate creation of one 'race'—human evolution and migration patterns contradict this narrative."
        }
      },
      "Hinduism": {
        "Cyclic Universe Belief": {
          "Claim": "The universe is created and destroyed in infinite cycles by Brahma, Vishnu, and Shiva.",
          "Evidence": "According to the Bible, Jesus made all things. Colossians 1:16-20 . Yahweh stretched out the heavens .Isaiah 44:24"
        }
      },
      "Buddhism": {
        "Karma and Rebirth": {
          "Claim": "A soul-less karmic process leads to rebirth until enlightenment.",
          "Evidence": "There is no empirical or biological evidence supporting a mechanism for karmic rebirth; memory and personality are brain-based and non-transferrable."
        }
      },
      "Scientology": {
        "Xenu Origin Story": {
          "Claim": "Alien overlord Xenu brought billions of spirits to Earth and exploded them in volcanoes.",
          "Evidence": "There is no historical, geological, or astronomical evidence for such an event; this story contradicts all known scientific models."
        }
      },
      "Catholicism": {
        "Papal Infallibility": {
          "Claim": "The Pope is infallible when speaking ex cathedra on matters of doctrine.",
          "Evidence": "There is no scriptural foundation in early Christian texts to support the concept of a single infallible human interpreter."
        }
      },
      "Judaism": {
        "Messiah Yet to Come": {
          "Claim": "The Jewish Messiah has not yet arrived.",
          "Evidence": "Historical prophecy in Isaiah and Daniel point to the arrival of the Messiah aligning with the time of Jesus of Nazareth."
        }
      }
    };

    // Enhanced trigger keywords from Debunk.txt
    this.triggerKeywords = {
      "mormon": "Mormonism",
      "joseph smith": "Mormonism", 
      "gold plates": "Mormonism",
      "gold tablets": "Mormonism",
      "reformed egyptian": "Mormonism",
      "book of abraham": "Mormonism",
      "jehovah": "Jehovah's Witnesses",
      "islam": "Islam",
      "quran": "Islam",
      "nation of islam": "Nation of Islam",
      "yakub": "Nation of Islam",
      "hindu": "Hinduism",
      "buddh": "Buddhism",
      "scientolog": "Scientology",
      "catholic": "Catholicism",
      "pope": "Catholicism",
      "judaism": "Judaism",
      "torah": "Judaism"
    };
  }

  toText(religions = null) {
    religions = religions || Object.keys(this.claims);
    const lines = ["=== Debunking Novel Claims ==="];
    
    religions.forEach(religion => {
      if (this.claims[religion]) {
        lines.push(`\n**${religion}:**`);
        Object.entries(this.claims[religion]).forEach(([topic, data]) => {
          lines.push(`\n  ${topic}:`);
          lines.push(`    Claim: ${data.Claim}`);
          lines.push(`    Evidence: ${data.Evidence}`);
        });
      }
    });

    return lines.join('\n');
  }

  // Enhanced method from Debunk.txt
  analyzeByTopic(topic) {
    const lc = topic.toLowerCase();
    const matchedReligions = new Set();
    
    Object.entries(this.triggerKeywords).forEach(([keyword, religion]) => {
      if (lc.includes(keyword)) {
        matchedReligions.add(religion);
      }
    });

    if (matchedReligions.size > 0) {
      const religions = Array.from(matchedReligions);
      if (lc.includes("explain") || lc.includes("why") || lc.includes("evidence") || lc.includes("sources") || lc.includes("prove")) {
        return this.toText(religions);
      }
      return `This religion contains teachings that differ from the Bible and lacks historical or archaeological support. Type 'explain' to see sources.`;
    }
    
    return null;
  }
}

class MuhammadCasualtiesComparison {
  constructor() {
    this.casualties = {
      "Banu Qurayza Massacre (627 CE)": {
        "Executions": 600,
        "Context": "Following the Battle of the Trench, members of Banu Qurayza were judged by Sa'd ibn Mu'adh in accordance with prevailing tribal wartime customs. Why: The Banu Qurayza tribe broke their treaty with Muslims during the siege of Medina, secretly negotiating with attacking enemies (Quraysh and Ghatafan) to attack Muslims from behind while they were already under siege. This was considered treason during wartime."
      },
      "'Ukl/'Urayna Bedouins (625 CE)": {
        "Punishments": 8,
        "Context": "Penalty carried out in response to murder and betrayal; interpretations vary among early Islamic scholars. Why: These Bedouins came to Medina claiming to be sick and seeking help. Muhammad provided them with camels and a shepherd for milk/cure. They then murdered the shepherd, stole the camels, and fled. They were captured and punished according to their own crimes (eye for an eye principle)."
      },
      "Ubayy ibn Khalaf (Sarif, 624 CE)": {
        "Personal Kill": (
          "According to Ibn Isḥāq (via Ibn Hishām) and al-Za'd al-Ma'ād, " +
          "Muḥammad himself speared Ubayy ibn Khalaf through a gap in his armor at Sarif, " +
          "inflicting a fatal wound. Why: Ubayy ibn Khalaf was a Meccan warrior who had previously threatened to kill Muhammad personally and owned a horse specifically trained to hunt down Muhammad in battle. This was a direct combat encounter during the Battle of Uhud where Ubayy was actively trying to kill Muhammad."
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
    this.creator = "God";
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
      return "In different scriptures, the Creator is referred to by different names — 'Yahweh' in the Bible.The Bible says in Genesis 1:1, In the beginning, God created the heavens and the earth.";
    }

    // ── Global Islamic Comparison Trigger ─────────────────────────
    if (lc.includes('muhammad') || lc.includes('islam')) {
      return this._islamComparison();
    }

    if (lc.match(/who (created|made) (you|this bot|system)/))
      return `I was created by ${this.creator}.`;

    if (lc.match(/prophecy|fulfilled prophecy|came true/))
      return this.prophecies.summarize();

    // Enhanced faith claim debunking - now covers 9 religions
    const faithAnalysis = this.debunker.analyzeByTopic(topic);
    if (faithAnalysis) {
      return faithAnalysis;
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
    parts.push('\n1) Unscientific & Unsanitary Practices and Scientific & Sanitary Practices:');
    Object.entries(this.falseHadith.getFlagged()).forEach(([hid, [text, reason, topics]]) => {
      if (topics.some(t => ['medicine', 'science', 'sanitation'].includes(t))) {
        parts.push(`- [${hid}] ${text} (${reason})`);
      }
    });

    // 2) Failed End-Times Prophecies
    parts.push('\n2) Unfulfilled and fulfilled End-Times Prophecies:');
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
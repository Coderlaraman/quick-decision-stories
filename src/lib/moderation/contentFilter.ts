// Content filtering and moderation utilities

// Palabras y frases prohibidas en diferentes idiomas
const PROHIBITED_WORDS = {
  en: [
    // Violence
    'kill', 'murder', 'violence', 'blood', 'gore', 'torture', 'weapon', 'gun', 'knife',
    // Adult content
    'sex', 'porn', 'nude', 'naked', 'adult', 'explicit',
    // Hate speech
    'hate', 'racist', 'discrimination', 'nazi', 'terrorist',
    // Drugs
    'drug', 'cocaine', 'heroin', 'marijuana', 'alcohol',
    // Gambling
    'gambling', 'casino', 'bet', 'poker', 'lottery'
  ],
  es: [
    // Violencia
    'matar', 'asesinar', 'violencia', 'sangre', 'tortura', 'arma', 'pistola', 'cuchillo',
    // Contenido adulto
    'sexo', 'porno', 'desnudo', 'adulto', 'explícito',
    // Discurso de odio
    'odio', 'racista', 'discriminación', 'nazi', 'terrorista',
    // Drogas
    'droga', 'cocaína', 'heroína', 'marihuana', 'alcohol',
    // Apuestas
    'apuesta', 'casino', 'apostar', 'poker', 'lotería'
  ]
};

// Patrones de texto sospechoso
const SUSPICIOUS_PATTERNS = [
  // URLs
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  // Emails
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Phone numbers
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  // Repeated characters (spam)
  /(..)\1{4,}/g,
  // All caps (shouting)
  /\b[A-Z]{10,}\b/g
];

export interface ContentAnalysis {
  score: number; // 0-100, higher = more problematic
  flags: string[];
  suggestions: string[];
  autoReject: boolean;
  requiresReview: boolean;
}

export interface ModerationResult {
  approved: boolean;
  confidence: number;
  reasons: string[];
  suggestions: string[];
}

/**
 * Analiza el contenido de texto para detectar problemas
 */
export function analyzeTextContent(text: string, language: 'en' | 'es' = 'en'): ContentAnalysis {
  const analysis: ContentAnalysis = {
    score: 0,
    flags: [],
    suggestions: [],
    autoReject: false,
    requiresReview: false
  };

  if (!text || text.trim().length === 0) {
    return analysis;
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  const prohibitedWords = PROHIBITED_WORDS[language] || PROHIBITED_WORDS.en;

  // Verificar palabras prohibidas
  let prohibitedCount = 0;
  prohibitedWords.forEach(word => {
    if (normalizedText.includes(word)) {
      prohibitedCount++;
      analysis.flags.push(`Contains prohibited word: ${word}`);
    }
  });

  // Calcular puntuación basada en palabras prohibidas
  if (prohibitedCount > 0) {
    analysis.score += Math.min(prohibitedCount * 15, 60);
  }

  // Verificar patrones sospechosos
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches) {
      analysis.score += matches.length * 10;
      switch (index) {
        case 0:
          analysis.flags.push('Contains URLs');
          break;
        case 1:
          analysis.flags.push('Contains email addresses');
          break;
        case 2:
          analysis.flags.push('Contains phone numbers');
          break;
        case 3:
          analysis.flags.push('Contains spam-like repeated characters');
          break;
        case 4:
          analysis.flags.push('Contains excessive capitalization');
          break;
      }
    }
  });

  // Verificar longitud del contenido
  if (text.length < 10) {
    analysis.score += 20;
    analysis.flags.push('Content too short');
  } else if (text.length > 10000) {
    analysis.score += 10;
    analysis.flags.push('Content very long');
  }

  // Verificar calidad del contenido
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = words.length / Math.max(sentenceCount, 1);
  
  if (avgWordsPerSentence < 3) {
    analysis.score += 15;
    analysis.flags.push('Poor sentence structure');
  }

  // Determinar acciones basadas en la puntuación
  if (analysis.score >= 80) {
    analysis.autoReject = true;
    analysis.suggestions.push('Content should be rejected automatically');
  } else if (analysis.score >= 40) {
    analysis.requiresReview = true;
    analysis.suggestions.push('Content requires manual review');
  }

  // Sugerencias específicas
  if (prohibitedCount > 0) {
    analysis.suggestions.push('Remove or replace inappropriate language');
  }
  
  if (text.match(SUSPICIOUS_PATTERNS[0])) {
    analysis.suggestions.push('Remove external links');
  }
  
  if (text.match(SUSPICIOUS_PATTERNS[4])) {
    analysis.suggestions.push('Use normal capitalization');
  }

  return analysis;
}

/**
 * Analiza una historia completa incluyendo título, descripción y escenas
 */
export function analyzeStoryContent(story: {
  title: string;
  description: string;
  scenes?: Array<{
    content: string;
    options?: Array<{ text: string; }>;
  }>;
}, language: 'en' | 'es' = 'en'): ContentAnalysis {
  const titleAnalysis = analyzeTextContent(story.title, language);
  const descriptionAnalysis = analyzeTextContent(story.description, language);
  
  let maxScore = Math.max(titleAnalysis.score, descriptionAnalysis.score);
  let allFlags = [...titleAnalysis.flags, ...descriptionAnalysis.flags];
  let allSuggestions = [...titleAnalysis.suggestions, ...descriptionAnalysis.suggestions];

  // Analizar escenas si están disponibles
  if (story.scenes) {
    story.scenes.forEach((scene, index) => {
      const sceneAnalysis = analyzeTextContent(scene.content, language);
      maxScore = Math.max(maxScore, sceneAnalysis.score);
      
      sceneAnalysis.flags.forEach(flag => {
        allFlags.push(`Scene ${index + 1}: ${flag}`);
      });
      
      allSuggestions.push(...sceneAnalysis.suggestions);

      // Analizar opciones de la escena
      if (scene.options) {
        scene.options.forEach((option, optionIndex) => {
          const optionAnalysis = analyzeTextContent(option.text, language);
          maxScore = Math.max(maxScore, optionAnalysis.score);
          
          optionAnalysis.flags.forEach(flag => {
            allFlags.push(`Scene ${index + 1}, Option ${optionIndex + 1}: ${flag}`);
          });
          
          allSuggestions.push(...optionAnalysis.suggestions);
        });
      }
    });
  }

  // Remover duplicados
  allFlags = [...new Set(allFlags)];
  allSuggestions = [...new Set(allSuggestions)];

  return {
    score: maxScore,
    flags: allFlags,
    suggestions: allSuggestions,
    autoReject: maxScore >= 80,
    requiresReview: maxScore >= 40
  };
}

/**
 * Modera contenido automáticamente
 */
export function moderateContent(content: string, language: 'en' | 'es' = 'en'): ModerationResult {
  const analysis = analyzeTextContent(content, language);
  
  return {
    approved: !analysis.autoReject && analysis.score < 40,
    confidence: Math.min(100 - analysis.score, 100),
    reasons: analysis.flags,
    suggestions: analysis.suggestions
  };
}

/**
 * Limpia texto removiendo contenido problemático
 */
export function sanitizeText(text: string, language: 'en' | 'es' = 'en'): string {
  let cleanText = text;
  const prohibitedWords = PROHIBITED_WORDS[language] || PROHIBITED_WORDS.en;
  
  // Reemplazar palabras prohibidas con asteriscos
  prohibitedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanText = cleanText.replace(regex, '*'.repeat(word.length));
  });
  
  // Remover URLs
  cleanText = cleanText.replace(SUSPICIOUS_PATTERNS[0], '[LINK REMOVED]');
  
  // Remover emails
  cleanText = cleanText.replace(SUSPICIOUS_PATTERNS[1], '[EMAIL REMOVED]');
  
  // Remover números de teléfono
  cleanText = cleanText.replace(SUSPICIOUS_PATTERNS[2], '[PHONE REMOVED]');
  
  return cleanText.trim();
}

/**
 * Genera un reporte de moderación
 */
export function generateModerationReport(analysis: ContentAnalysis): string {
  const report = [];
  
  report.push(`Content Analysis Report`);
  report.push(`Score: ${analysis.score}/100`);
  report.push(`Status: ${analysis.autoReject ? 'AUTO REJECT' : analysis.requiresReview ? 'REQUIRES REVIEW' : 'APPROVED'}`);
  
  if (analysis.flags.length > 0) {
    report.push(`\nFlags:`);
    analysis.flags.forEach(flag => report.push(`- ${flag}`));
  }
  
  if (analysis.suggestions.length > 0) {
    report.push(`\nSuggestions:`);
    analysis.suggestions.forEach(suggestion => report.push(`- ${suggestion}`));
  }
  
  return report.join('\n');
}
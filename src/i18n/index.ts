import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import esCommon from '../locales/es/common.json';
import enCommon from '../locales/en/common.json';

const resources = {
  es: {
    common: esCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    debug: process.env.NODE_ENV === 'development',

    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Configuración de interpolación
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Namespace por defecto
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;
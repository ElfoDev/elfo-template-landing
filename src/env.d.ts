/** Funções globais dos analytics opcionais (só existem se o id estiver na config). */
interface Window {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}

export default function Event() {
  const listeners = new Map();

  // Добавляет слушатель
  this.addEventListener = (eventType, listener) => {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    return listeners.get(eventType).add(listener);
  }

  // Удаляет слушатель
  this.removeEventListener = (eventType, listener) => {
    if (!listeners.has(eventType)) return false;
    return listeners.get(eventType).delete(listener);
  }

  // Создаёт событие
  this.dispatchEvent = (eventType, options=[]) => {
    if (!listeners.has(eventType)) return false;
    const func = new Array();
    listeners.get(eventType).forEach(v => func.push(v));
    func.forEach(v => v(...options));
  }
}
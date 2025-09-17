/* === KEYFRAMES CUSTOMIZADAS === */

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* === CLASSES DE ANIMAÇÃO === */

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}

.animate-slide-in-up {
  animation: slideInUp 0.4s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out forwards;
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out forwards;
}

/* === TRANSIÇÕES AVANÇADAS === */

.transition-all-300 {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform-200 {
  transition: transform 0.2s ease-in-out;
}

.transition-colors-150 {
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

/* === HOVER EFFECTS === */

.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.hover-glow {
  transition: box-shadow 0.3s ease-in-out;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* === LOADING STATES === */

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-dark {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* === ESTADOS DE FOCO === */

.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
}

.focus-ring-error {
  @apply focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500;
}

.focus-ring-success {
  @apply focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500;
}





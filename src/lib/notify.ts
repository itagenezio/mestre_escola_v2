"use client";

/**
 * Mestre da Escola v3.0 - Notification Service
 * Premium Audio Feedback System using Google UI Sounds
 */

const SOUND_URLS = {
  notification: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", 
  success: "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",     
  alert: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",       
};

export const playNotification = (type: keyof typeof SOUND_URLS = "notification") => {
  if (typeof window === "undefined") return;
  
  try {
    const audio = new Audio(SOUND_URLS[type]);
    audio.volume = 0.5;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Autoplay blocked: Click first.", error);
      });
    }
  } catch (err) {
    console.error("Audio system error:", err);
  }
};



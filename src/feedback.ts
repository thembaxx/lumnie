let context: AudioContext | undefined;
export function feedback(
  kind: 'tap' | 'success' | 'wrong' | 'celebrate',
  sound: boolean,
  haptics: boolean,
) {
  if (haptics && typeof navigator !== 'undefined' && navigator.vibrate)
    navigator.vibrate(kind === 'success' ? [20, 35, 30] : kind === 'wrong' ? [35, 20, 35] : 10);
  if (!sound || typeof window === 'undefined') return;
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
    const notes =
      kind === 'celebrate'
        ? [523.25, 659.25, 783.99, 1046.5]
        : kind === 'success'
          ? [659.25, 880]
          : kind === 'wrong'
            ? [220, 196]
            : [520];
    notes.forEach((frequency, i) => {
      const oscillator = context!.createOscillator(),
        gain = context!.createGain(),
        at = context!.currentTime + i * 0.075;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.035, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.17);
      oscillator.connect(gain);
      gain.connect(context!.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.19);
    });
  } catch {
    /* Audio is optional when the browser does not provide it. */
  }
}

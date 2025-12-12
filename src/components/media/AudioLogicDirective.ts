import { html } from "lit";
import { Directive, directive } from "lit/directive.js";

class AudioLogicDirective extends Directive {
  render() {}

  update(part) {
    const root = part.element;

    if (root._initialized) return;
    root._initialized = true;

    const audio = root.querySelector("#audioEl");
    const playBtn = root.querySelector("#playBtn");
    const seek = root.querySelector("#seek");
    const volume = root.querySelector("#volume");
    const timeDisplay = root.querySelector("#timeDisplay");
    const canvas = root.querySelector("#waveform");
    const ctx = canvas.getContext("2d");

    // Resize canvas to CSS size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Audio visualization
    let audioContext = null;
    let analyser = null;
    let dataArray = null;

    function initWaveform() {
      audioContext = new AudioContext();
      const src = audioContext.createMediaElementSource(audio);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      dataArray = new Uint8Array(analyser.frequencyBinCount);

      src.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    function drawWaveform() {
      if (!analyser) return;
      requestAnimationFrame(drawWaveform);

      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#666";
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.stroke();
    }

    playBtn.addEventListener("click", async () => {
      if (!audioContext) {
        initWaveform();
        drawWaveform();
      }

      if (audio.paused) {
        await audio.play();
        playBtn.name = "pause";
      } else {
        audio.pause();
        playBtn.name = "play";
      }
    });

    audio.addEventListener("timeupdate", () => {
      seek.value = (audio.currentTime / audio.duration) * 100;

      const fmt = (t) =>
        `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

      timeDisplay.textContent = `${fmt(audio.currentTime)} / ${
        isNaN(audio.duration) ? "0:00" : fmt(audio.duration)
      }`;
    });

    seek.addEventListener("sl-change", (e) => {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    });

    volume.addEventListener("sl-change", (e) => {
      audio.volume = e.target.value;
    });

    audio.addEventListener("ended", () => {
      playBtn.name = "play";
    });

    return;
  }
}

export const audioLogic = directive(AudioLogicDirective);

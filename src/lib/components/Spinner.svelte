<script lang='ts'>
  interface Props {
    color?: string
    unit?: string
    duration?: string
    size?: string | number
    pause?: boolean
  }

  const {
    color = '#FF3E00',
    unit = 'px',
    duration = '0.6s',
    size = 60,
    pause = false,
  }: Props = $props()

  const moonSize: number = +size / 7
  const top: number = +size / 2 - moonSize / 2
</script>

<div
  class='wrapper'
  class:pause-animation={pause}
  style='--size: {size}{unit}; --color: {color}; --moonSize: {top}{unit}; --duration: {duration}'
>
  <div class='circle-one' class:pause-animation={pause}></div>
  <div class='circle-two' class:pause-animation={pause}></div>
</div>

<style>
  .wrapper {
    height: var(--size);
    width: var(--size);
    border-radius: 100%;
    animation: moonStretchDelay var(--duration) 0s infinite linear;
    animation-fill-mode: forwards;
    position: relative;
  }
  .circle-one {
    top: var(--moonSize);
    background-color: var(--color);
    width: calc(var(--size) / 7);
    height: calc(var(--size) / 7);
    border-radius: 100%;
    animation: moonStretchDelay var(--duration) 0s infinite linear;
    animation-fill-mode: forwards;
    opacity: 0.8;
    position: absolute;
  }
  .circle-two {
    opacity: 0.1;
    border: calc(var(--size) / 7) solid var(--color);
    height: var(--size);
    width: var(--size);
    border-radius: 100%;
    box-sizing: border-box;
  }
  .pause-animation {
    animation-play-state: paused;
  }
  @keyframes moonStretchDelay {
    100% {
      transform: rotate(360deg);
    }
  }
</style>

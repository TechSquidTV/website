export default function timeToRead(text: string) {
  const wpm = 200;
  return Math.ceil(text.split(" ").length / wpm);
}
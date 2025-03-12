async function resetStreaks() {
  await fetch("https://scrappy.hackclub.com/api/streakResetter");
}

resetStreaks();

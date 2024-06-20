export function abbreviateString(input: string): string {
  if (input.length <= 8) {
    return input;
  }

  const firstFour = input.substring(0, 4);
  const lastFour = input.substring(input.length - 4);
  return `${firstFour}...${lastFour}`;
}

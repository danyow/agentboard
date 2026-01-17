/**
 * Generates a consistent color for a project based on its name.
 * Uses a simple hash to select from a curated palette of colors.
 */

// Curated palette of distinct hues that are visually different from each other
const PROJECT_HUES = [
  220,  // blue
  145,  // green
  280,  // purple
  30,   // orange
  350,  // red/rose
  185,  // cyan
  315,  // magenta/pink
  75,   // lime/yellow-green
  255,  // indigo
  10,   // red-orange
]

/**
 * Simple string hash function for consistent color selection.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get color styles for a project name.
 * Text is muted gray with a subtle color tint, background is the colored pill.
 */
export function getProjectColorStyle(projectName: string): {
  backgroundColor: string
  color: string
} {
  const index = hashString(projectName) % PROJECT_HUES.length
  const hue = PROJECT_HUES[index]

  return {
    // Colored pill background
    backgroundColor: `hsl(${hue} 60% 50% / 0.2)`,
    // Muted text with subtle color tint (low saturation, similar lightness to --text-muted #737373 ≈ 45%)
    color: `hsl(${hue} 20% 55%)`,
  }
}

/**
 * Get the hue for a project name (useful for related styling).
 */
export function getProjectHue(projectName: string): number {
  const index = hashString(projectName) % PROJECT_HUES.length
  return PROJECT_HUES[index]
}

export const getDIDfromAtURI = (atURI: string): string | null => {
  const components = atURI.split("/")

  if (components.length >= 3) {
    return components[2]
  } else {
    return null
  }
}
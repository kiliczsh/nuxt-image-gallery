export const useImageGallery = () => {
  const config = useRuntimeConfig()
  const imageToDownload = ref()

  const applyFilters = async (imageContainer: HTMLElement | undefined, poster: CanvasImageSource | null, contrast: number, blur: number, invert: number, saturate: number, hueRotate: number, sepia: number, filter: boolean = false) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d')

    canvas.width = imageContainer!.getBoundingClientRect().width
      // if filter panel we must restore orignal height
    canvas.height = filter ? (imageContainer!.getBoundingClientRect().height * 100) / 80 : imageContainer!.getBoundingClientRect().height

    context!.filter = `contrast(${contrast}%) blur(${blur}px) invert(${invert}%)
      saturate(${saturate}%) hue-rotate(${hueRotate}deg) sepia(${sepia}%)`

    context!.drawImage(poster!, 0, 0, canvas.width, canvas.height)

    const modifiedImage = new Image()

    modifiedImage.src = canvas.toDataURL('image/png')
    imageToDownload.value = modifiedImage

    return imageToDownload
  }

  const downloadImage = async (filename: string, imageContainer: HTMLElement | undefined, poster: CanvasImageSource, contrast: number, blur: number, invert: number, saturate: number, hueRotate: number, sepia: number) => {

    await applyFilters(imageContainer, poster, contrast, blur, invert, saturate, hueRotate, sepia)

    await useFetch(imageToDownload.value.src, {
      baseURL: `${config.public.imageApi}/ipx/_/tmdb/`,
    }).then((response: any) => {
      const blob: any = response.data.value
      const url: string = URL.createObjectURL(blob)
      const link: HTMLAnchorElement = document.createElement('a')

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.click()
    })
  }

  return {
    downloadImage,
    applyFilters
  }
}

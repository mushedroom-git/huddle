/// <reference types="vite/client" />

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
}

interface Window {
  BarcodeDetector?: BarcodeDetectorConstructor
}

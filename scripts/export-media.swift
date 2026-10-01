import Foundation
import AppKit
import PDFKit
import ImageIO
import AVFoundation

struct Item: Decodable { let id: String; let source: String; let page: Int? }
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let cache = root.appendingPathComponent(".cache/media")
try FileManager.default.createDirectory(at: cache, withIntermediateDirectories: true)
let items = try JSONDecoder().decode([Item].self, from: Data(contentsOf: root.appendingPathComponent(".cache/media-input.json")))
var documents: [String: PDFDocument] = [:]
for item in items {
    let output = cache.appendingPathComponent(item.id + ".jpg")
    if FileManager.default.fileExists(atPath: output.path) { continue }
    let url = root.appendingPathComponent(item.source)
    let result: NSBitmapImageRep
    if let page = item.page {
        if documents[item.source] == nil { documents[item.source] = PDFDocument(url: url) }
        guard let pdfPage = documents[item.source]?.page(at: page - 1) else { fatalError("Missing PDF page: \(item.source) \(page)") }
        let thumbnail = pdfPage.thumbnail(of: NSSize(width: 2000, height: 2000), for: .mediaBox)
        result = NSBitmapImageRep(data: thumbnail.tiffRepresentation!)!
    } else {
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let cg = CGImageSourceCreateThumbnailAtIndex(source, 0, [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceThumbnailMaxPixelSize: 2200, kCGImageSourceCreateThumbnailWithTransform: true] as CFDictionary) else { fatalError("Cannot decode: \(item.source)") }
        result = NSBitmapImageRep(cgImage: cg)
    }
    try result.representation(using: .jpeg, properties: [.compressionFactor: 0.94])!.write(to: output)
    print("Prepared \(item.id)")
}

let videoOutput = root.appendingPathComponent("public/media/feel-marni.mp4")
let posterURL = cache.appendingPathComponent("film-poster.jpg")
if !FileManager.default.fileExists(atPath: posterURL.path) {
    let generator = AVAssetImageGenerator(asset: AVURLAsset(url: videoOutput))
    generator.appliesPreferredTrackTransform = true
    generator.maximumSize = CGSize(width: 1600, height: 900)
    let cg = try await generator.image(at: CMTime(seconds: 21, preferredTimescale: 600)).image
    try NSBitmapImageRep(cgImage: cg).representation(using: .jpeg, properties: [.compressionFactor: 0.9])!.write(to: posterURL)
}

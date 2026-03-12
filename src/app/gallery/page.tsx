import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

const photos = [
  { src: "/gallery/photo-1.jpg", width: 1200, height: 554 },
  { src: "/gallery/photo-2.jpg", width: 1200, height: 554 },
  { src: "/gallery/photo-3.jpg", width: 1200, height: 554 },
  { src: "/gallery/photo-4.jpg", width: 1200, height: 900 },
  { src: "/gallery/photo-5.jpg", width: 1200, height: 900 },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <h1 className="text-lg font-bold text-white">2024 Highlights</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <p className="text-gray-400 text-sm mb-6">
          Moments from the 2024 Raqueteers Badminton Tournament
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-800/50 overflow-hidden bg-gray-900"
            >
              <Image
                src={photo.src}
                alt={`Tournament photo ${i + 1}`}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

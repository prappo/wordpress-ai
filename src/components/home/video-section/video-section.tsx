import Image from "next/image";

export function VideoSection() {
  return (
    <section className={'mx-auto max-w-7xl px-[32px] relative flex flex-col items-center justify-center mt-10 mb-20'}>
      <div
        className={
          'w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl'
        }
      >
        <div className="relative w-full h-full">
          <Image
            src="/assets/screenshot.png"
            alt="WordPress AI Screenshot"
            className="w-full h-full object-cover"
            width={1000}
            height={1000}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="flex text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
          </svg>
        </div>
        <span className="text-sm text-gray-400 ml-2">4.9/5 from 200+ reviews</span>
      </div>
    </section>
  );
}

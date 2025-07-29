export function WhySection() {
  return (
    <section className="mx-auto max-w-7xl px-[32px] relative flex flex-col items-center justify-center mt-20 mb-32">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            Why WordPress AI?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your WordPress development experience with AI-powered tools that make customization accessible to everyone
          </p>
        </div>

        {/* Problem Statement */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">The Traditional WordPress Challenge</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  WordPress development often feels like solving a puzzle with missing pieces. You either need to combine multiple plugins, each with their own quirks, or invest in expensive premium solutions that include features you&apos;ll never use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Generation</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Transform your ideas into working WordPress plugins and themes instantly with our advanced AI technology.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Precise Customization</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Fine-tune the generated code to match your exact requirements with our intuitive editing tools.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Secure Testing Environment</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Test your creations in a secure, browser-based WordPress environment before deployment.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Confident Deployment</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Deploy your custom solutions with confidence, knowing they&apos;ve been thoroughly tested and optimized.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your WordPress Experience?
            </h3>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              Whether you&apos;re a developer looking to speed up your workflow or a non-technical user wanting to customize your site, our platform makes WordPress customization accessible to everyone.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">No coding required</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Instant results</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Free to start</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
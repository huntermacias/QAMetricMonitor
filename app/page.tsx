import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full">
     
      <header className="w-full border-b border-white/10 bg-black/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      
          <div className="flex items-center gap-2">
        
            <img
              src="https://w7.pngwing.com/pngs/137/201/png-transparent-costco-travel-hotel-car-rental-vacation-travel-text-trademark-logo.png" 
              alt="QAMetricMonitoring Logo"
              width={50}
              height={50}
              className='rounded-full'
            />
            <span className="font-bold text-lg">
              QAMetric<span className="text-purple-400">Monitoring</span>
            </span>
          </div>
    
         
        </div>
      </header>

      {/*  HERO  */}
      <section className="relative flex-1 flex items-center justify-center bg-[url('https://as1.ftcdn.net/jpg/08/21/08/62/1000_F_821086277_xiUTeEswK2jykHQ8INw2BOGjq19nyxbm.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            The Ultimate QA / SDET Hub
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Seamlessly monitor and manage your Jenkins pipelines, TFS tasks, and
            soon—analyze Splunk data all in one place.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#get-started"
              className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors"
            >
              Get Started
            </a>
            <a
              href="#learn-more"
              className="px-6 py-3 border border-white/20 text-white rounded-md hover:border-purple-400 hover:text-purple-400 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/*  FEATURES  */}
      <section id="features" className="py-16 bg-black/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Features</h2>
            <p className="text-gray-400 mt-2">
              Everything you need as a QA / SDET—right here.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature #1: Jenkins */}
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/jenkins.png"
                alt="Jenkins"
                width={50}
                height={50}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Jenkins Integration</h3>
              <p className="text-sm text-gray-300">
                Trigger builds, view logs, re-run tests—directly in your
                QAMetricMonitoring dashboard. Full coverage of Jenkins pipelines.
              </p>
            </div>

            {/* Feature #2: TFS */}
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/tfs.png"
                alt="TFS"
                width={50}
                height={50}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">TFS Tracking</h3>
              <p className="text-sm text-gray-300">
                See your test tasks, bugs, and epics from TFS. Never miss an
                update on your QA tasks again.
              </p>
            </div>

            {/* Feature #3: Splunk Coming Soon */}
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/splunk.png"
                alt="Splunk"
                width={80}
                height={80}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Splunk Data (Coming Soon)</h3>
              <p className="text-sm text-gray-300">
                Real-time logs and analytics from Splunk integrated right into
                your QA view. Anticipate issues before they happen.
              </p>
            </div>

          
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/reporting-icon.png"
                alt="Reporting"
                width={50}
                height={50}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Test Results Dashboards</h3>
              <p className="text-sm text-gray-300">
                Beautiful visualizations of pass/fail rates, coverage, and
                performance metrics in a single pane of glass.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/notifications-icon.png"
                alt="Notifications"
                width={50}
                height={50}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Alerting & Notifications</h3>
              <p className="text-sm text-gray-300">
                Get real-time alerts on Slack, Teams, or email when a test fails
                or when your code coverage drops.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-white/10 transition">
              <Image
                src="/images/security-icon.png"
                alt="Security"
                width={50}
                height={50}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">Secure & Scalable</h3>
              <p className="text-sm text-gray-300">
                Designed with enterprise-grade security and built to scale with
                your team’s QA demands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  FOOTER  */}
      <footer className="bg-black/80 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/images/qa-logo.png"
              alt="QAMetricMonitoring Logo"
              width={40}
              height={40}
            />
            <span className="font-bold text-lg">
              QAMetric<span className="text-purple-400">Monitoring</span>
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-4 sm:mt-0">
            © {new Date().getFullYear()} QAMetricMonitoring, LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

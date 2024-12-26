import { PinContainer } from '@/components/3d-pin'
import { Boxes } from '@/components/background-boxes'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useId } from 'react'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full">

      <header className="w-full sticky top-0 z-50">
        <div className="h-[600px] relative w-full overflow-hidden  flex flex-col items-center justify-center rounded-lg">
          <div className="absolute inset-0 w-full h-full z-20 [mask-image:radial-gradient(transparent,orange)] pointer-events-none" />

          <Boxes />
          <h1 className={cn("md:text-6xl text-7xl relative z-20")}>
            The Ultimate QA / SDET Hub
          </h1>
          <p className="text-center mt-2 dark:text-neutral-300 relative z-20">
            Monitor data derived from TFS and Jenkins
          </p>
        </div>
      </header>


      {/*  FEATURES  */}
      <section id="features" className="py-16 border-y rounded-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Features</h2>
            <p className="text-gray-400 mt-2">
              Everything you need as a QA / SDET—right here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 md:gap-2 max-w-7xl mx-auto">
            {/* Feature #1: Jenkins */}

            <PinContainer
              title="/jenkins"
              href="/jenkins"
            >
              <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
                <Grid size={20} />
                <Image
                  src="/images/jenkins.png"
                  alt="Jenkins"
                  width={30}
                  height={30}
                  className="mb-4"
                />
                <h3 className="text-base !m-0 !p-0 font-normal">Jenkins Integration</h3>
                <p className="text-sm text-gray-300">
                  Trigger builds, view logs, re-run tests. Full coverage of Jenkins pipelines.
                </p>
                <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-red-500 via-purple-500/50 to-blue-500" />

              </div>
            </PinContainer>

            {/* Feature #2: TFS */}
            <PinContainer
              title="/tfs/bugs"
              href="/bugs"
            >
              <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
                <Grid size={20} />
                <Image
                  src="/images/tfs.png"
                  alt="TFS"
                  width={30}
                  height={30}
                  className="mb-4"
                />
                <h3 className="text-base !m-0 !p-0 font-normal">TFS Tracking</h3>
                <p className="text-sm text-gray-300">
                  See your test tasks, bugs, and epics from TFS. Never miss an
                  update on your QA tasks again.
                </p>
                <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-red-500 via-purple-500/50 to-blue-500" />

              </div>
            </PinContainer>


            {/* Feature #3: Splunk Coming Soon */}
            <PinContainer
              title="/tfs/splunk"
              href="/splunk"
            >
              <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
                <Grid size={20} />

                <Image
                  src="/images/splunk.png"
                  alt="Splunk"
                  width={50}
                  height={50}
                  className="mb-4"
                />


                <span className="text-base !m-0 !p-0 font-normal">
                  Splunk Data
                  <Badge className="inline-flex ml-3 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    Coming Soon
                  </Badge>              </span>

                <p className="text-sm text-gray-300">
                  Real-time logs and analytics from Splunk integrated right into
                  your QA view. Anticipate issues before they happen.
                </p>
                <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-red-500 via-purple-500/50 to-blue-500" />

              </div>
            </PinContainer>
          </div>
        </div>
      </section>


    </main>
  )
}


export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
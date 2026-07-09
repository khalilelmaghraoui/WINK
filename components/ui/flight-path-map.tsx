import { CinematicEnvelope } from "./cinematic-envelope";

interface FlightPathMapProps {
  className?: string;
  heroEnvelope?: boolean;
}

export function FlightPathMap({
  className = "",
  heroEnvelope = true
}: FlightPathMapProps) {
  return (
    <div
      className={[
        "nocturnal-atlas paper-grain relative isolate min-h-[520px] overflow-hidden rounded-none",
        "border-y border-wink-border bg-wink-background",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-80 motion-safe:animate-wink-map-fade"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1120 640"
      >
        <defs>
          <radialGradient cx="50%" cy="48%" id="atlasVignette" r="70%">
            <stop offset="45%" stopColor="#F8F3EA" stopOpacity="0" />
            <stop offset="100%" stopColor="#181512" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <g fill="none" stroke="#6F665D" strokeOpacity="0.18" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, index) => (
            <path
              d={`M 0 ${80 + index * 68} C 260 ${55 + index * 58}, 640 ${
                105 + index * 30
              }, 1120 ${72 + index * 66}`}
              key={`lat-${index}`}
            />
          ))}
          {Array.from({ length: 9 }).map((_, index) => (
            <path
              d={`M ${80 + index * 126} 0 C ${60 + index * 126} 180, ${
                110 + index * 104
              } 360, ${70 + index * 126} 640`}
              key={`lng-${index}`}
            />
          ))}
        </g>
        <g fill="none" stroke="#181512" strokeOpacity="0.16" strokeWidth="2">
          <path d="M135 260 C220 180 350 185 450 238 C520 274 615 250 690 214 C778 171 900 190 986 278" />
          <path d="M200 390 C305 350 390 370 486 424 C615 494 744 462 886 398" />
          <path d="M490 138 C555 110 620 130 676 170" />
        </g>
        <path
          className="motion-safe:animate-wink-route-draw"
          d="M188 418 C318 315 428 336 520 274 S716 150 862 234 S944 392 1000 326"
          fill="none"
          pathLength="1"
          stroke="#8F2438"
          strokeDasharray="0.02 0.035"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <g fill="#C9A24E" opacity="0.92">
          {[
            [188, 418],
            [386, 330],
            [620, 212],
            [862, 234],
            [1000, 326],
            [770, 470],
            [310, 205]
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="5" />
          ))}
        </g>
        <g className="motion-safe:animate-wink-envelope-travel" transform="translate(188 418)">
          <rect
            fill="#FFFCF7"
            height="18"
            rx="2"
            stroke="#8F2438"
            strokeWidth="1"
            width="28"
            x="-14"
            y="-9"
          />
          <path d="M-14 -8 L0 3 L14 -8" fill="none" stroke="#0F5E5D" strokeWidth="1" />
        </g>
        <g
          fill="none"
          stroke="#6F665D"
          strokeOpacity="0.45"
          strokeWidth="1"
          transform="translate(90 100)"
        >
          <circle cx="0" cy="0" r="28" />
          <path d="M0 -38 V38 M-38 0 H38 M0 -26 L7 0 L0 26 L-7 0 Z" />
        </g>
        <rect fill="url(#atlasVignette)" height="640" width="1120" />
      </svg>

      {heroEnvelope ? (
        <div className="absolute inset-x-5 bottom-12 z-10 mx-auto max-w-[520px] motion-safe:animate-wink-arrival-zoom sm:bottom-16">
          <CinematicEnvelope interactive recipient="Maya" size="lg" />
        </div>
      ) : null}
    </div>
  );
}
